import { isRequestReply } from "./isRequestReply";
import { Reply } from "../request";

/** Check the error sending the request */
export function isRequestError<T = unknown>(error: unknown): error is Reply<T> {
  if (!error || typeof error !== "object") {
    return false;
  }

  return isRequestReply(error) && "error" in error;
}
