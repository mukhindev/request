import { createSearchParams, createHeaders } from "./utils";

type CustomOptions = object & Partial<Request>;

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

export type CreateRequestFn = typeof createRequest;

export function createRequest<Options extends CustomOptions, Data = unknown>(
  getOptions: (options: Options) => RequestOptions | Promise<RequestOptions>
) {
  return async (options: Options): Promise<Reply<Data>> => {
    const {
      url = "/",
      headers = {},
      params = {},
      ...requestOptions
    } = await getOptions(options);

    const requestUrl = new URL(url);
    const searchParams = createSearchParams(params);
    requestUrl.search = searchParams.toString();

    const request = new Request(requestUrl, {
      headers: createHeaders(headers),
      ...requestOptions,
    });

    const response = await fetch(request);
    const data = await response.json();

    const reply: Reply<Data> = {
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
}

export { joinUrl } from "./utils/joinUrl";
