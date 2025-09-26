# @mukhindev/request

Fetch API based utility for comfortable requests


For demo: clone https://github.com/mukhindev/request, `npm i`, `npm run dev`. Demo sources in `src/demo`.

## Install

```
npm install @mukhindev/request
```

## Simple request

```JavaScript
import { createRequest } from "@mukhindev/request";

// POST
const createTodo = createRequest(
  (options) => {
    // Call location options
    const { ...other } = options;

    // Final options
    return {
      method: "POST",
      url: `https://jsonplaceholder.typicode.com/todos`,
      ...other, // include body, signal, headers, etc.
    };
  }
);

// GET
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

## data vs body

`body` works the same it works in `fetch` (Fetch API).

`data` will automatically prepare the data for `body`. For example, the object uses `JSON.stringify`.

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

| reply param          | description                                                                        |
|----------------------|------------------------------------------------------------------------------------|
| `reply.data`         | Received data                                                                      |
| `reply.error`        | Error on request                                                                   |
| `reply.request`      | Request (Fetch API)                                                                |
| `reply.responseType` | `text` \| `json` \| `blob`                                                         |                                                                       |   
| `reply.response`     | Response (Fetch API)                                                               |
| `reply.headers`      | Response Headers as simple object. Headers (Fetch API) in `reply.response.headers` |
| `reply.status`       | Status number                                                                      |
| `reply.options`      | Options with which the request was called                                          |

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

## Transform in/out data

```JavaScript
export const createTodo = createRequest(
    (options) => {
        const { data, ...other } = options;

        // Transform request body data
        const serverData = {
            user_id: data.userId,
            todo_text: data.title,
            is_checked: data.isChecked,
        }

        return {
            method: "POST",
            url: "/todo",
            data: serverData,
            // Transform reply (response) body data
            transformData: ({ data, error }) => {
                // The error has a different data, but it is also a body
                if (!error) {
                    return {
                        id: data.id,
                        userId: data.user_id,
                        todoText: data.todo_text,
                        isChecked: data.is_checked,
                    };
                }
            },
            ...other,
        };
    }
);
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

## Handle error

```TypeScript
import { isRequestError } from "@mukhindev/request";

todoApi
  .getTodo({ todoId: 3 })
  .then((reply) => console.log(reply))
  .catch((reason) => {
    // A typical case where the server sends an error message in the message field
    if (isRequestError<{ message: string }>(reason) && "message" in reason.data) {
      console.error(reason.data.message);
    }
  });
```


## Handle error on extension

For example 401 error. 

In the example, all created `createExtendRequest` requests call a refresh token if the status is 401

Create error handler. He should accept the Reply and throw the Reply away as an error.
Thanks to Promise, you can perform some action at this time.

```JavaScript
// handleRequestUnauthorizedError.js
import { createRequest, isRequestError } from "@mukhindev/request";
import { authStore } from "~/entities/auth/stores/authStore.ts";
import { refreshToken } from "~/entities/request/refreshToken.ts";

/**
 * Handling error 401.
 * We try to update the token and repeat the same request.
 * If it doesn't work, we throw a request error.
 * **/
export const handleRequestUnauthorizedError = async (reply) => {
    // If error 401
    if (isRequestError(reply) && reply.status === 401) {
        try {
            // Let's try to update the token
            await refreshToken();

            // We repeat the request with the same options
            return createRequest(() => {
                return {
                    ...reply.options,
                    // If the error persists, log out
                    onError: (reply) => {
                        app.logout();
                        throw reply;
                    },
                };
            })({});
        } catch {
            // If fail on refresh token, log out
            app.logout();
            throw reply;
        }
    }

    throw reply;
};
```

Use in extension:


```JavaScript
import { createRequest, joinUrl } from "@mukhindev/request";
import { handleRequestUnauthorizedError } from "./handleRequestUnauthorizedError"

// Custom createExtendRequest function extends default
const createExtendRequest = (forwardOptions) => {
  return createRequest(async (options) => {
    const { url, ...other } = await forwardOptions(options);
    
    return {
      url: joinUrl("https://jsonplaceholder.typicode.com", url),
      // Use error handler
      onError: handleRequestUnauthorizedError,
      ...other,
    };
  });
};
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
      // Type safe request options
      isAuthorization: true,
      ...other,
    };
  }
);
```

```TypeScript
getTodo({
  todoId: 3,
  params: {
    "some-param": 42,
  },
}).then((reply) => {
  // Type safe replay data
  console.log(reply.data)
});
```


