import { Reply } from "../createRequest";

export function isRequestReply<T = unknown>(reply: unknown): reply is Reply<T> {
  if (!reply || typeof reply !== "object") {
    return false;
  }

  const hasResponse = "request" in reply && reply.request instanceof Request;
  const hasRequest = "response" in reply && reply.response instanceof Response;
  const hasStatus = "status" in reply && typeof reply.status === "number";
  const hadHeaders = "headers" in reply;
  const hadData = "data" in reply;

  return hasResponse && hasRequest && hasStatus && hadData && hadHeaders;
}
