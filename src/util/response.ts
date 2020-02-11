export type ExpressResponse = {
  statusCode: number;
}
export type ApiResponseData = {
  message?: string;
  httpStatus?: number;
  error?: string;
  item?: object;
  items?: object[];
}
export type ApiResponse = {
  error?: boolean;
  data: ApiResponseData;
}

export class ErrorResponse extends Error {
  res: ExpressResponse;
  constructor(resp: ExpressResponse, ...args: any) {
    super(...args);
    this.res = resp;
  }
}

export class ValidationResponse extends ErrorResponse {}

export const toApiResponse = (res: ExpressResponse|ErrorResponse, data: ApiResponseData) => {
  let response = res as ExpressResponse;
  const result: ApiResponse = { data };
  if (res instanceof ErrorResponse) { // expecting res is an ErrorResponse
    response = res.res as ExpressResponse;
    result.error = true;
    result.data.error = res.message;
  }

  result.data.httpStatus = response.statusCode;
  return result;
};
