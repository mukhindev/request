import { Reply } from "../createRequest";

/** Check the error sending the request */
export function isRequestError<T = unknown>(error: unknown): error is Reply<T> {
  if (!error || typeof error !== "object") {
    return false;
  }

  const hasResponse = "request" in error && error.request instanceof Request;
  const hasRequest = "response" in error && error.response === null;
  const hasStatus = "status" in error && error.status === 0;
  const hasHeaders = "headers" in error;
  const hasData = "data" in error && error.data === null;
  const hasError = "error" in error;

  return (
    hasResponse && hasRequest && hasStatus && hasData && hasHeaders && hasError
  );
}
