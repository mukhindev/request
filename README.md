# @mukhindev/request

Fetch API based utility for comfortable requests

> [!NOTE]  
> Works only with JSON response

Demo: https://github.com/mukhindev/request-demo

## Install

```
npm install @mukhindev/request
```

## Simple request

```JavaScript
import { createRequest } from "@mukhindev/request";

const createTodo = createRequest(
  (options) => {
    // Call location options
    const { ...other } = options;

    // Final options
    return {
      method: "POST",
      url: `https://jsonplaceholder.typicode.com/todos`,
      ...other,
    };
  }
);

const getTodo = createRequest(
  (options) => {
    const { todoId, ...other } = options;

    return {
      url: `https://jsonplaceholder.typicode.com/todos/${todoId}`,
      ...other,
    };
  }
);
```

```JavaScript
// POST: https://jsonplaceholder.typicode.com/todos
createTodo({ data: { title: "Buy milk" } })

// GET: https://jsonplaceholder.typicode.com/todos/3?some-param=42
getTodo({ todoId: 3, params: { "some-param": 42 }} /* Call location options */)
  .then((reply) => console.log(reply.data));
```

## Terms

```JavaScript
//    Request   Request creation function    Request options
//       ↓                ↓                        ↓
const getTodo = createRequest((options) => ({ ...options }))
```

```JavaScript
//                Reply
//                  ↓
getTodo({}).then((reply) => console.log(reply.data));
```

## Reply

> Why is it called "Reply" instead of "Response"?

Because Response (Fetch API) is inside. `reply.response`

`reply.data`: Received data  
`reply.request`: Request (Fetch API)  
`reply.response`: Response (Fetch API)  
`reply.headers`: Response Headers as simple object. Headers (Fetch API) in `reply.response`  
`reply.status`: Status number

## Extended request

Useful when your parameters and processes are repeated in every request.
For example, API url, authorization header, token refresh process, etc.

```JavaScript
import { createRequest, joinUrl } from "@mukhindev/request";

// Custom createRequest function extends default
const createJsonPlaceholderRequest = (forwardOptions) => {
  return createRequest(async (options /* Call location options */) => {
    // Request location options
    const { isAuthorization, url, ...other } = await forwardOptions(options);

    // You can execute an async process before the request. For example, check and refresh token
    if (isAuthorization) {
      // await checkToken()
    }
   

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
const getTodo = createJsonPlaceholderRequest(
  (options) => {
    // Call location options
    const { todoId, ...other } = options;

    // Request location options
    return {
      // Short pathname. Full url will be received in createJsonPlaceholderRequest
      url: `/todos/${todoId}`,
      ...other,
    };
  }
);
```

```JavaScript
// Request to https://jsonplaceholder.typicode.com/todos/3?some-param=42
getTodo({ isAuthorization: true, todoId: 3, params: { "some-param": 42 }} /* Call location options */)
  .then((reply) => console.log(reply.data));
```

## TypeScript

```TypeScript
import { createRequest, CreateRequestFn, joinUrl } from "@mukhindev/request";

type ExtendedOptions = {
  // Custom special option for all created requests by createJsonPlaceholderRequest
  isAuthorization: boolean;
};

const createJsonPlaceholderRequest: CreateRequestFn<ExtendedOptions> = (forwardOptions) => {
  return createRequest(async (options) => {
    const { isAuthorization, url, ...other } = await forwardOptions(options);
    
    if (isAuthorization) { /*...*/ }

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
  todoId: number;
  params: {
    "some-param": number;
  };
};

// Reply data model
type ReplyData = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const getTodo = createJsonPlaceholderRequest<CallOptions, ReplyData>(
  (options) => {
    const { todoId, ...other } = options;

    return {
      url: `/todos/${todoId}`,
      ...other,
    };
  }
);
```

```TypeScript
getTodo({
  // Type safe request options
  isAuthorization: true,
  todoId: 3,
  params: {
    "some-param": 42,
  },
}).then((reply) => {
  // Type safe replay data
  console.log(reply.data)
});
```


