import { createSearchParams, createHeaders } from "./utils";

export type Reply<Data> = {
  data: Data;
  request: Request;
  response: Response;
  headers: Record<string, string>;
  status: number;
};

export type RequestOptions = Omit<Partial<Request>, "headers"> & {
  params?: Record<string, unknown>;
  headers?: Record<string, string | number | boolean>;
};

export type ForwardOptionsFn<T extends object> = (
  options: T & RequestOptions
) => RequestOptions | Promise<RequestOptions>;

export type CreateRequestFn = <T extends object, D = unknown>(
  forwardOptions: ForwardOptionsFn<T>
) => (options: T & RequestOptions) => Promise<Reply<D>>;

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
