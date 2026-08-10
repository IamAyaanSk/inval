import { Prisma } from "@/generated/prisma/client";

const globalErrorMessage = "Something went wrong";

export type HttpStatusCode =
  | 400
  | 401
  | 403
  | 404
  | 405
  | 409
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

export class ApiError extends Error {
  httpStatusCode: HttpStatusCode;
  isInternalError: boolean;

  constructor({
    message,
    httpStatusCode = 500,
    isInternalError = false,
  }: {
    message: string;
    httpStatusCode?: HttpStatusCode;
    isInternalError?: boolean;
  }) {
    super(message);
    this.name = "ApiError";
    this.httpStatusCode = httpStatusCode;
    this.isInternalError = isInternalError;
  }
}

export function getErrorDetails({
  error,
  forEntity,
  defaultMessage,
}: {
  error: unknown;
  forEntity: string;
  defaultMessage?: string;
}): { message: string; statusCode: HttpStatusCode } {
  if (error instanceof ApiError) {
    return {
      message: error.isInternalError
        ? (defaultMessage ?? globalErrorMessage)
        : error.message,
      statusCode: error.httpStatusCode,
    };
  }

  if (error instanceof SyntaxError) {
    return { message: "Invalid JSON payload.", statusCode: 400 };
  }

  // Prisma client known request errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return { message: `${forEntity} already exists`, statusCode: 409 };
      case "P2025":
        return { message: `${forEntity} not found`, statusCode: 404 };
      default:
        return {
          message: defaultMessage ?? globalErrorMessage,
          statusCode: 500,
        };
    }
  }

  // Other errors
  return { message: defaultMessage ?? globalErrorMessage, statusCode: 500 };
}
