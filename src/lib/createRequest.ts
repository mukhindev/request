import { Reply, request, RequestOptions } from "./request";

export type ForwardOptionsFn<O, E, D, S = any> = (
  options: RequestOptions<D, S> & O,
) => (RequestOptions<D, S> & E) | Promise<RequestOptions<D, S> & E>;

export type RequestFn<O, D, S = any> = (options: O) => Promise<Reply<D, S>>;

export type CreateRequestFn<E = unknown> = <O, D, S = any>(
  forwardOptions: ForwardOptionsFn<O, E, D, S>,
) => RequestFn<O & RequestOptions<D, S>, D>;

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
  return async function wrapperRequest(options) {
    return await request(await forwardOptions(options));
  };
};
