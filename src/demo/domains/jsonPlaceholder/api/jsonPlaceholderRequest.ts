import { createRequest, CreateRequestFn, joinUrl } from "@mukhindev/request";
import { JSON_PLACEHOLDER_API_HOST } from "../constants";

type ExtendedJsonPlaceholderOptions = {
  // Custom special option for all created requests by createJsonPlaceholderRequest
  delay: number;
};

export const createJsonPlaceholderRequest: CreateRequestFn<
  ExtendedJsonPlaceholderOptions
> = (forwardOptions) => {
  return createRequest(async (options) => {
    const { delay = 0, url, headers, ...other } = await forwardOptions(options);

    // You can execute an async process before the request. For example, check and refresh token
    // Delay for async process example
    if (delay > 0) {
      console.log("Process before request start");
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log("Process before request end");
    }

    return {
      // join "https://jsonplaceholder.typicode.com" + pathname
      url: joinUrl(JSON_PLACEHOLDER_API_HOST, url),
      headers: {
        ...headers,
        accept: "application/json",
      },
      // https://jsonplaceholder does not content-type header
      responseType: "json",
      ...other,
    };
  });
};
