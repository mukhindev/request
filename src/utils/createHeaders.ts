export function createHeaders(headers: Record<string, unknown>): Headers {
  const fetchHeaders = new Headers();

  Object.entries(headers).forEach(([param, value]) => {
    if (typeof value === "string") {
      fetchHeaders.set(param, value);
      return;
    }

    if (typeof value === "number") {
      fetchHeaders.set(param, value.toString());
      return;
    }

    if (typeof value === "boolean") {
      fetchHeaders.set(param, value ? "true" : "false");
      return;
    }
  });

  return fetchHeaders;
}
