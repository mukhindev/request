import { joinUrl } from "@mukhindev/request";
import { TODO_API_BASE_PATH } from "../constants";
import { TodoModel } from "../types";
import { createJsonPlaceholderRequest } from "../../../domains/jsonPlaceholder/api";

type Options = {
  todoId: number;
  params: {
    "some-param": number;
  };
};

type Data = TodoModel & { customProperty: string };

export const getTodo = createJsonPlaceholderRequest<Options, Data>(
  (options) => {
    const { todoId, ...other } = options;

    console.log("getTodo()");

    return {
      url: joinUrl(TODO_API_BASE_PATH, todoId),
      transformData: ({ data, error }) => {
        // The error has a different answer, but it is also a body
        if (!error) {
          return {
            ...data,
            customProperty: "create on transform()",
          };
        }
      },
      ...other,
    };
  },
);
