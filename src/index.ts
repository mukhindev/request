/**
 * Generic abbreviations
 * O — Options (including options union)
 * E — Extended options
 * D = Returned data (response body)
 */

import { createHeaders } from "./utils/createHeaders";
import { createSearchParams } from "./utils/createSearchParams";

export type RequestOptions = Omit<Partial<Request>, "headers"> & {
  params?: Record<string, unknown>;
  headers?: Record<string, string | number | boolean>;
  data?: unknown;
};

export type Reply<D> = {
  data: D;
  request: Request;
  response: Response;
  headers: Record<string, string>;
  status: number;
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

    const response = await fetch(request);
    const replyData = await response.json();

    const reply = {
      data: replyData,
      request,
      response,
      headers: Object.fromEntries(response.headers.entries()),
      status: response.status,
    };

    if (response.status >= 400) {
      throw reply;
    }

    return reply;
  };
};

/** Public utils */
export { joinUrl } from "./utils/joinUrl";
export type { RequestOptionsOf, RequestReplyOf } from "./types/utils/RequestOf";
