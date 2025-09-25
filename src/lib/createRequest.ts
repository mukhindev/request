import { createSearchParams } from "./utils/createSearchParams";
import { createHeaders } from "./utils/createHeaders";

/**
 * Generic abbreviations
 * O — Options (including options union)
 * E — Extended options
 * D = Returned data (response body)
 */

type ResponseType = "text" | "json" | "blob";

export type RequestOptions<D, R = any> = Omit<Partial<Request>, "headers"> & {
  params?: Record<string, unknown>;
  headers?: Record<string, string | number | boolean>;
  /** Request body data */
  data?: unknown;
  responseType?: ResponseType;
  /**
   * Transform the reply body (.data).
   * The return type must match the passed second parameter of the `createRequest` generic `D`.
   * */
  transformData?: (reply: Reply<R>) => D | undefined;
  /** Custom error handler */
  onError?: (reply: Reply<unknown>) => Promise<Reply<unknown>>;
};

export type Reply<D, R = any> = {
  /** Replay body data */
  data: D;
  /** Error if request is not sent */
  error?: unknown;
  request: Request;
  responseType: ResponseType;
  /** Received response (null if request sending error) */
  response: Response | null;
  headers: Record<string, string>;
  /** Status == 0 if wasn't response */
  status: number;
  options: RequestOptions<D, R>;
};

export type ForwardOptionsFn<O, E, D, R = any> = (
  options: RequestOptions<D, R> & O & E,
) => (RequestOptions<D, R> & E) | Promise<RequestOptions<D, R> & E>;

export type RequestFn<O, D, R = any> = (options: O) => Promise<Reply<D, R>>;

export type CreateRequestFn<E = unknown> = <O, D, R = any>(
  forwardOptions: ForwardOptionsFn<O, E, D, R>,
) => RequestFn<O & RequestOptions<D, R> & E, D>;

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
    const forwardedOptions = await forwardOptions(options);

    const {
      url = "/",
      headers = {},
      params = {},
      data,
      responseType,
      transformData,
      onError,
      ...requestOptions
    } = forwardedOptions;

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
      responseType: responseType ?? "text",
      request,
      response: null,
      headers: {},
      status: 0,
      options: forwardedOptions,
    };

    const handleTransformData = () => {
      if (transformData) {
        const transformedData = transformData(reply);

        // `undefined` is a JS entity, it cannot be body data
        if (transformedData !== undefined) {
          reply.data = transformedData;
        }
      }
    };

    const handleError = async (error: unknown) => {
      reply.error = error;
      // In the error response also use data transformation
      handleTransformData();

      // If it has custom error handler
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

      // Automatic detection of response type
      if (!responseType) {
        const contentType = reply.response.headers.get("content-type");
        const contentDisposition = reply.response.headers.get("content-disposition"); // prettier-ignore

        if (contentType?.startsWith("application/json")) {
          reply.responseType = "json";
        } else if (
          contentType?.startsWith("application/octet-stream") ||
          contentDisposition?.startsWith("attachment")
        ) {
          reply.responseType = "blob";
        }
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

    handleTransformData();

    return reply;
  };
};
