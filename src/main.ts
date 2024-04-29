import { createSearchParams, createHeaders } from "./utils";

export type Reply<Data> = {
  data: Data;
  request: Request;
  response: Response;
  headers: Record<string, string>;
  status: number;
};

export type RequestOptions<E = object> = Omit<Partial<Request>, "headers"> & {
  params?: Record<string, unknown>;
  headers?: Record<string, string | number | boolean>;
} & E;

export type ForwardOptionsFn<T extends object, E = object> = (
  options: T & RequestOptions<E>
) => RequestOptions<E> | Promise<RequestOptions<E>>;

/** E: extended options (optional), T: options, D: data,   */
export type CreateRequestFn<E = object> = <T extends object, D = unknown>(
  forwardOptions: ForwardOptionsFn<T, E>
) => (options: T & RequestOptions<E>) => Promise<Reply<D>>;

export const createRequest: CreateRequestFn = (forwardOptions) => {
  return async (options) => {
    const {
      url = "/",
      headers = {},
      params = {},
      ...requestOptions
    } = await forwardOptions(options);

    const requestUrl = new URL(url);
    const searchParams = createSearchParams(params);
    requestUrl.search = searchParams.toString();

    const request = new Request(requestUrl, {
      headers: createHeaders(headers),
      ...requestOptions,
    });

    const response = await fetch(request);
    const data = await response.json();

    const reply = {
      data,
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

// exports utils
export { joinUrl } from "./utils/joinUrl";
