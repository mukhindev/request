// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRequest = (options: any) => Promise<any>;

/**
 * Get options type from request function
 *
 * Example:
 *
 * ```TypeScript
 * RequestOptionsOf<typeof getPost>
 * ```
 * */
export type RequestOptionsOf<T extends AnyRequest> = Parameters<T>[0];

/**
 * Get reply (response) type from request function
 *
 * Example:
 *
 * ```TypeScript
 * RequestReplyOf<typeof getPost>
 * ```
 * */
export type RequestReplyOf<T extends AnyRequest> = Awaited<ReturnType<T>>;
