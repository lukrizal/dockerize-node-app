"use strict";

import { Response, Request, NextFunction } from "express";

import { toApiResponse, ErrorResponse, ValidationResponse } from "../util/response";
import logger from "../util/logger";


export function handler404(req: Request, res: Response, next: NextFunction) {
  const message = "Not found.";
  const err = new ErrorResponse(res, message);
  res.status(404).json(toApiResponse(err, { message }));
};

export function handler500 (error: Error, req: Request, res: Response, next: NextFunction) {
  const message = "Something went wrong";
  const err = new ErrorResponse(res, error.message);
  let statusCode = 400;

  if (error instanceof ValidationResponse) statusCode = 422;

  res.status(statusCode).json(toApiResponse(err, { message }));
};


// const router = express.Router();

// router.use(handler404);
// router.use(handler500);

// export default router;