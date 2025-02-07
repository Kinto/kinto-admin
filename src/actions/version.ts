export function versionRequest(): {
  type: "VERSION_REQUEST";
} {
  return { type: "VERSION_REQUEST" };
}

export function versionResponse(response: Record<string, string>): {
  type: "VERSION_RESPONSE";
  response: Record<string, string>;
} {
  return { type: "VERSION_RESPONSE", response };
}
