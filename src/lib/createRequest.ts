import { createSearchParams } from "./utils/createSearchParams";
import { createHeaders } from "./utils/createHeaders";

/**
 * Generic abbreviations
 * O — Options (including options union)
 * E — Extended options
 * D = Returned data (response body)
 */

export type RequestOptions = Omit<Partial<Request>, "headers"> & {
  params?: Record<string, unknown>;
  headers?: Record<string, string | number | boolean>;
  data?: unknown;
  onError?: (reply: Reply<unknown>) => Promise<Reply<unknown>>;
};

export type Reply<D> = {
  data: D;
  error?: unknown;
  request: Request;
  response: Response | null;
  headers: Record<string, string>;
  status: number | null;
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
    const searchParams = createSearchParams(params);
    requestUrl.search = searchParams.toString();

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

    const reply: Reply<unknown> = {
      data: null,
      request,
      response: null,
      headers: {},
      status: null,
      options: await forwardOptions(options),
    };

    const handleError = async (error: unknown) => {
      reply.error = error;

      if (onError) {
        return await onError(reply);
      }

      throw reply;
    };

    try {
      reply.response = await fetch(request);
      reply.headers = Object.fromEntries(reply.response.headers.entries());
      reply.status = reply.response.status;
    } catch (error) {
      return handleError(error);
    }

    try {
      reply.data = await reply.response.json();
    } catch (error) {
      return handleError(error);
    }

    if (reply.response.status >= 400) {
      return handleError(new Error("Server error status (>= 400)"));
    }

    return reply;
  };
};
