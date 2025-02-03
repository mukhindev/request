import { createSearchParams } from "./utils/createSearchParams";
import { createHeaders } from "./utils/createHeaders";

/**
 * Generic abbreviations
 * O — Options (including options union)
 * E — Extended options
 * D = Returned data (response body)
 */

type ResponseType = "text" | "json" | "blob";

export type RequestOptions = Omit<Partial<Request>, "headers"> & {
  params?: Record<string, unknown>;
  headers?: Record<string, string | number | boolean>;
  data?: unknown;
  // Custom error handler
  onError?: (reply: Reply<unknown>) => Promise<Reply<unknown>>;
};

export type Reply<D> = {
  data: D;
  /** Error if request is not sent */
  error?: unknown;
  request: Request;
  responseType: ResponseType;
  /** Received response (null if request sending error) */
  response: Response | null;
  headers: Record<string, string>;
  /** Status == 0 if was't response */
  status: number;
  options: RequestOptions;
};

export type ForwardOptionsFn<O, E> = (
  options: RequestOptions & O & E,
) => (RequestOptions & E) | Promise<RequestOptions & E>;

export type RequestFn<O, D> = (options: O) => Promise<Reply<D>>;

export type CreateRequestFn<E = unknown> = <O, D>(
  forwardOptions: ForwardOptionsFn<O, E>,
) => RequestFn<O & RequestOptions & E, D>;

/**
 * Fetch API based utility for comfortable requests
 *
 * Example:
 *
 * ```TypeScript
 * type Options = {
 *   postId: number
 * };
 *
 * type Data = {
 *   post: PostModel
 * };
 *
 * export const getPost = createJsonPlaceholderRequest<Options, Data>(
 *   (options) => {
 *     const { postId, ...other } = options;
 *
 *     return {
 *       url: `${API_HOST}/posts/${postId}`,
 *       ...other,
 *     };
 *   }
 * );
 *
 * getPost({ postId: 42 })
 *   .then((reply) => console.log(reply.data.post))
 * ```
 */
export const createRequest: CreateRequestFn = (forwardOptions) => {
  return async (options) => {
    const {
      url = "/",
      headers = {},
      params = {},
      data,
      onError,
      ...requestOptions
    } = await forwardOptions(options);

    const requestUrl = new URL(url);

    // Get search params object from request url
    const searchParamsFromUrl: Record<string, unknown> = {};
    for (const [key, value] of new URLSearchParams(requestUrl.search)) {
      searchParamsFromUrl[key] = value;
    }

    // Merge search params from url and params
    const searchParams = createSearchParams({
      ...searchParamsFromUrl,
      ...params,
    });

    requestUrl.search = searchParams.toString();

    // If json, then set relevant headers
    if (!requestOptions.body && typeof data === "object" && data !== null) {
      headers["Content-Type"] = "application/json";

      Object.assign(requestOptions, {
        body: JSON.stringify(data),
      });
    }

    const request = new Request(requestUrl, {
      headers: createHeaders(headers),
      ...requestOptions,
    });

    // Prepare reply object
    const reply: Reply<any> = {
      data: null,
      responseType: "text",
      request,
      response: null,
      headers: {},
      status: 0,
      options: await forwardOptions(options),
    };

    const handleError = async (error: unknown) => {
      reply.error = error;

      // If has custom error handler
      if (onError) {
        return await onError(reply);
      }

      throw reply;
    };

    // Send request
    try {
      reply.response = await fetch(request);
      reply.headers = Object.fromEntries(reply.response.headers.entries());
      reply.status = reply.response.status;

      const contentType = reply.response.headers.get("content-type");
      const contentLength = +(reply.response.headers.get("content-length") ?? 0); // prettier-ignore
      const contentDisposition = reply.response.headers.get("content-disposition"); // prettier-ignore

      if (contentLength === 0 || contentType?.startsWith("text/plain")) {
        reply.responseType = "text";
      } else if (contentType?.startsWith("application/json")) {
        reply.responseType = "json";
      } else if (
        contentType?.startsWith("application/octet-stream") ||
        contentDisposition?.startsWith("attachment")
      ) {
        reply.responseType = "blob";
      }
    } catch (error) {
      return handleError(error);
    }

    if (reply.responseType === "text") {
      try {
        reply.data = await reply.response.text();
      } catch (error) {
        return handleError(error);
      }
    }

    if (reply.responseType === "json") {
      try {
        reply.data = await reply.response.json();
      } catch (error) {
        return handleError(error);
      }
    }

    if (reply.responseType === "blob") {
      try {
        reply.data = await reply.response.blob();
      } catch (error) {
        return handleError(error);
      }
    }

    // Error status
    if (reply.response.status >= 400) {
      return handleError(new Error("Server error status (>= 400)"));
    }

    return reply;
  };
};
