"use strict";

import express, { Response, Request, NextFunction } from "express";
import { OrgDocument, Org as Model } from "../models/Org";
import { toApiResponse, ApiResponseData, ValidationResponse } from "../util/response";
import Github from "../lib/Github";
import { catchWrapper as cw } from "../util/promise";

export type ApiRequest = {
  org: OrgDocument;
}

/**
 * Middleware
 */
export const middleware = async (req: Request & ApiRequest, res: Response, next: NextFunction) => {
  const orgName = req.params.org || null;
  const github = req.app.locals.github as Github;

  try {
    if (!orgName) throw new ValidationResponse(res, "Organization name is required");

    // verify first if the organization is present
    await github.getOrg(orgName)
      .catch(cw("github.getOrg"));

    // find or create the orgnization
    const org = await Model.findOneOrCreate({ name: orgName })
      .catch(cw("Org.findOneOrCreate"));

    res.locals.org = org; // for reference
  } catch (error) {
    return next(error);
  }
  return next();
};

/**
 * POST /orgs/<org-name>/comments
 * create comment for an organization
 */
export const postOrgComment = async (req: Request & ApiRequest, res: Response, next: NextFunction) => {
  const org = res.locals.org as OrgDocument;

  try {
    // verify first if comment is present
    const { comment } = req.body;
    if (!comment) throw new ValidationResponse(res, "Comment is required.");

    // insert the comment
    await org.insertComment(comment)
      .catch(cw("Org.insertComment"));

    const data = { item: org } as ApiResponseData;
    res.json(toApiResponse(res, data));
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /orgs/<org-name>/comments
 * list comments of an organization
 */
export const getOrgComments = async (req: Request & ApiRequest, res: Response, next: NextFunction) => {
  const org = res.locals.org as OrgDocument;

  try {
    const comments = await org.getAllComments()
      .catch(cw("Org.getAllComments"));
    const data = { items: comments } as ApiResponseData;
    res.json(toApiResponse(res, data));
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /orgs/<org-name>/comments
 * soft delete all comments of the given organization
 */
export const deleteOrgComments = async (req: Request & ApiRequest, res: Response, next: NextFunction) => {
  const org = res.locals.org as OrgDocument;

  try {
    // delete all the comments
    await org.deleteAllComments()
    .catch(cw("Org.deleteAllComments"));

    const data = { items: [] } as ApiResponseData;
    res.json(toApiResponse(res, data));
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /orgs/<org-name>/members
 * get all members of the given organization
 */
export const getOrgMembers = async (req: Request & ApiRequest, res: Response, next: NextFunction) => {
  const org = res.locals.org as OrgDocument;
  const github = req.app.locals.github as Github;

  try {
    const members = await github.getOrgMembers(org.name)
      .catch(cw("github.getOrgMembers"));

    const data = { items: members } as ApiResponseData;
    res.json(toApiResponse(res, data));
  } catch (error) {
    return next(error);
  }
};


const router = express.Router();

router.post("/orgs/:org/comments", middleware, postOrgComment);
router.get("/orgs/:org/comments", middleware, getOrgComments);
router.delete("/orgs/:org/comments", middleware, deleteOrgComments);
router.get("/orgs/:org/members", middleware, getOrgMembers);

export default router;