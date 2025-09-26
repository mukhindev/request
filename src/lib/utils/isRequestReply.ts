import { Reply } from "../request";

/** Check if this reply your request (Response was received) */
export function isRequestReply<T = unknown>(reply: unknown): reply is Reply<T> {
  if (!reply || typeof reply !== "object") {
    return false;
  }

  const hasData = "data" in reply;
  const hasRequest = "request" in reply && reply.request instanceof Request;
  const hasResponseType = "responseType" in reply;
  const hasResponse = "response" in reply && reply.response instanceof Response;
  const hasHeaders = "headers" in reply;
  const hasStatus = "status" in reply && typeof reply.status === "number";
  const hasOptions = "options" in reply;

  return (
    hasData &&
    hasRequest &&
    hasResponseType &&
    hasResponse &&
    hasHeaders &&
    hasStatus &&
    hasOptions
  );
}
