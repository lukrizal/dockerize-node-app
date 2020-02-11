import _ from "lodash";
import Github, { expressMiddleware, ExpressReqRes } from "../src/lib/Github";

describe("Github > middleware ", () => {
  it("should be able to provide express middleware", async () => {
    const reqRes = { app: { locals: {} } } as ExpressReqRes;

    expect(reqRes.app.locals.github).toBeUndefined();
    expressMiddleware(reqRes, reqRes, _.noop);
    expect(reqRes.app.locals).toHaveProperty("github");
  });
});

describe("Github > methods", () => {
  jest.setTimeout(20000); // 20 seconds before timeout, for the 3rd party

  let github: Github;

  beforeAll(() => {
    github = new Github();
  });

  beforeEach((done) => {
    setTimeout(() => done(), 2000); // 2 seconds waiting time, to prevent github throttle
  });

  it("should be able to fetch a github organization", async () => {
    let orgName = "xendit";
    try {
      const org = await github.getOrg(orgName);
      expect(org).toHaveProperty("login");
      expect(org.login).toBe(orgName);
    } catch (error) {
      if (error.original) throw error.original;
    }

    orgName = "non-existing-organization";
    try {
      await github.getOrg(orgName);
    } catch (error) {
      expect(error.message).toBe(`Organization ${orgName} not found.`);
    }
  });

  it("should be able to fetch members of an organization", async () => {
    let orgName = "xendit";
    try {
      const members = await github.getOrgMembers(orgName);
      expect(members).toBeInstanceOf(Array);
      expect(members[0]).toHaveProperty("login");
      expect(members[0]).toHaveProperty("avatarUrl");
      expect(members[0]).toHaveProperty("countFollowers");
      expect(members[0]).toHaveProperty("countFollowing");
    } catch (error) {
      if (error.original) throw error.original;
    }

    orgName = "non-existing-organization";
    try {
      await github.getOrgMembers(orgName);
    } catch (error) {
      expect(error.message).toBe(`Organization ${orgName} not found.`);
    }
  });
});