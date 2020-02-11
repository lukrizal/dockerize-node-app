import _ from "lodash";
import bluebird from "bluebird";
import { Octokit } from "@octokit/rest";

import { GITHUB_PAT } from "../util/secrets";
import { catchWrapper as cw } from "../util/promise";

export type GithubMember = {
  login: string;
  avatarUrl: string;
  countFollowers: number;
  countFollowing: number;
}

type ExpressApp = {
  locals: {
    github?: Github;
  };
}
export type ExpressReqRes = {
  app: ExpressApp;
}

class Github {
  octokit: Octokit;
  constructor() {
    // initialize github api connection
    this.init();
  }

  init() {
    this.octokit = new Octokit({
      auth: GITHUB_PAT
    });
  }

  async getOrg(orgName: string): Promise<Octokit.OrgsGetResponse> {
    const errMsg = `Organization ${orgName} not found.`;
    const res = await this.octokit.orgs.get({ org: orgName })
      .catch(cw(errMsg, true));
    if (_.has(res, "data")) return res.data;

    throw new Error(errMsg);
  }

  async getOrgMembers(orgName: string): Promise<GithubMember[]> {
    const errMsg = `Organization ${orgName} does not have members.`;
    await this.getOrg(orgName).catch(cw());

    const res = await this.octokit.orgs.listMembers({ org: orgName })
      .catch(cw(errMsg, true));
    if (_.has(res, "data") && _.isArray(res.data)) {
      const prepFn = async (x: Octokit.OrgsListMembersResponseItem): Promise<GithubMember> => {
        const member = {
          login: x.login,
          avatarUrl: x.avatar_url,
          countFollowers: 0,
          countFollowing: 0
        } as GithubMember;

        let res = await this.octokit.users.listFollowersForUser({
          username: x.login
        }).catch(cw("Octokit [users.listFollowersForUser] error."));

        if (_.has(res, "data")) {
          member.countFollowers = res.data.length;
        }

        res = await this.octokit.users.listFollowingForUser({
          username: x.login
        }).catch(cw("Octokit [users.listFollowingForUser] error."));

        if (_.has(res, "data")) {
          member.countFollowing = res.data.length;
        }

        return member;
      };

      const members = await bluebird.map(res.data, prepFn, { concurrency: 5 });
      return _.orderBy(members, ["countFollowers"], ["desc"]);
    }

    throw new Error(errMsg);
  }
}

export function expressMiddleware(req: ExpressReqRes, res: ExpressReqRes, next: Function) {
  if (!req.app.locals.github) {
    req.app.locals.github = new Github();
  }
  return next();
}

export default Github;