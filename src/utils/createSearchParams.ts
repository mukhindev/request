export function createSearchParams(
  params: Record<string, unknown>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([param, value]) => {
    if (typeof value === "string") {
      searchParams.set(param, value);
      return;
    }

    if (typeof value === "number") {
      searchParams.set(param, value.toString());
      return;
    }

    if (typeof value === "boolean") {
      searchParams.set(param, value ? "true" : "false");
      return;
    }

    if (Array.isArray(value)) {
      searchParams.set(param, value.join(","));
      return;
    }

    searchParams.delete(param);
  });

  return searchParams;
}
