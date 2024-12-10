import { Reply } from "../createRequest";

/** Check if this reply your request (Response was received) */
export function isRequestReply<T = unknown>(reply: unknown): reply is Reply<T> {
  if (!reply || typeof reply !== "object") {
    return false;
  }

  const hasRequest = "request" in reply && reply.request instanceof Request;
  const hasResponse = "response" in reply && reply.response instanceof Response;
  const hasStatus = "status" in reply && typeof reply.status === "number";
  const hasHeaders = "headers" in reply;
  const hasData = "data" in reply;

  return hasRequest && hasResponse && hasStatus && hasData && hasHeaders;
}
