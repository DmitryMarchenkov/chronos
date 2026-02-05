export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export class HttpError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const httpError = (
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) => new HttpError(statusCode, code, message, details);

export const errorResponse = (error: ApiError) => ({ error });
