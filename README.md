# @mukhindev/request

> [!NOTE]  
> Beta. Works only with JSON response

## Simple request

```JavaScript
import { createRequest } from "@mukhindev/request";

const getPost = createRequest(
  (options) => {
    // Call location options
    const { postId, ...other } = options;

    // Final options
    return {
      url: `https://jsonplaceholder.typicode.com/posts/${postId}`,
      ...other,
    };
  }
);
```

```JavaScript
// Request to https://jsonplaceholder.typicode.com/posts/3?some-param=42
getPost({ postId: 3, params: { "some-param": 42 }} /* Call location options */)
  .then((res) => console.log(res.data));
```

## Extended request

Useful when your parameters and processes are repeated in every request.
For example, API url, authorization header, token refresh process, etc.

```JavaScript
import { createRequest, joinUrl } from "@mukhindev/request";

// Custom createRequest function extends default
const createJsonPlaceholderRequest = (getOptions) => {
  return createRequest(async (options /* Call location options */) => {
    // Request location options
    const { url, ...other } = await getOptions(options);

    // You can execute an async process before the request. For example, check and refresh token
    // await checkToken()

    // Final options
    return {
      // Overridden options
      url: joinUrl("https://jsonplaceholder.typicode.com", url),
      // Options without changes
      ...other,
    };
  });
};
```

```JavaScript
const getPost = createJsonPlaceholderRequest(
  (options) => {
    // Call location options
    const { postId, ...other } = options;

    // Request location options
    return {
      // Short pathname. Full url will be received in createJsonPlaceholderRequest
      url: `/posts/${postId}`,
      ...other,
    };
  }
);
```

```JavaScript
// Request to https://jsonplaceholder.typicode.com/posts/3?some-param=42
getPost({ postId: 3, params: { "some-param": 42 }} /* Call location options */)
  .then((res) => console.log(res.data));
```

## TypeScript

```TypeScript
import { createRequest, CreateRequestFn, joinUrl } from "@mukhindev/request";

const createJsonPlaceholderRequest: CreateRequestFn = (getOptions) => {
  return createRequest(async (options) => {
    const { url, ...other } = await getOptions(options);

    return {
      url: joinUrl("https://jsonplaceholder.typicode.com", url),
      ...other,
    };
  });
};
```

```TypeScript
// Request call options
type CallOptions = {
  postId: number;
  params: {
    "some-param": number;
  };
};

// Reply data model
type ReplyData = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

const getPost = createJsonPlaceholderRequest<CallOptions, ReplyData>(
  (options) => {
    const { postId, ...other } = options;

    return {
      url: `/posts/${postId}`,
      ...other,
    };
  }
);
```

```TypeScript
getPost({ postId: 3, params: { "some-param": 42 }} /* Type safe request options */)
  .then((res) => console.log(res.data) /* Type safe replay data */);
```