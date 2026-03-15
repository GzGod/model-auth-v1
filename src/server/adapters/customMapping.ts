export interface CustomMappingConfig {
  responsePath: string;
}

function getByPath(input: unknown, dottedPath: string): unknown {
  return dottedPath.split(".").reduce<unknown>((acc, token) => {
    if (acc === null || typeof acc !== "object") return undefined;
    const asRecord = acc as Record<string, unknown>;
    return asRecord[token];
  }, input);
}

export function readMappedContent(raw: unknown, config: CustomMappingConfig): string {
  const value = getByPath(raw, config.responsePath);
  if (typeof value === "string") return value;
  return "";
}
