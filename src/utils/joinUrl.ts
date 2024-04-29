type UrlPart = string | number | null | undefined;

/** Get a URL from parts. Clean up extra "/" and empty values */
export function joinUrl(...parts: (UrlPart | UrlPart[])[]): string {
  return parts
    .map((part) => {
      if (Array.isArray(part)) {
        return joinUrl(...part);
      }

      return part;
    })
    .join("/")
    .replace(/\/{2,}/g, "/")
    .replace(":/", "://");
}
