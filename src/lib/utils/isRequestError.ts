import { Reply } from "../createRequest";
import { isRequestReply } from "./isRequestReply";

/** Check the error sending the request */
export function isRequestError<T = unknown>(error: unknown): error is Reply<T> {
  if (!error || typeof error !== "object") {
    return false;
  }

  return isRequestReply(error) && "error" in error;
}
