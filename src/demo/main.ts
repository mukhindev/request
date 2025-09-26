import * as todoApi from "./entities/todo/api";
import { isRequestError, isRequestReply } from "@mukhindev/request";

const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw Error("Root not found!");
}

const preElement = document.createElement("pre");
preElement.textContent = "Loading...";
rootElement.append(preElement);

todoApi
  .getTodo({
    todoId: 3,
    params: {
      "some-param": 42,
    },
  })
  .then((reply) => {
    console.log("isReply:", isRequestReply(reply)); // true
    console.log("isError:", isRequestError(reply)); // false
    console.log(reply);

    preElement.textContent = JSON.stringify(reply.data, null, 2);
  })
  .catch((error) => {
    console.log("isReply:", isRequestReply(error)); // true
    console.log("isError:", isRequestError(error)); // true
    console.log(error);

    preElement.textContent =
      `Check the console, there are non-serializable values!\n\n` +
      JSON.stringify(error, null, 2);
  });
