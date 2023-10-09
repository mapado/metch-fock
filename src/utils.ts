export function getInputUrl(
  input: Parameters<typeof globalThis.fetch>[0],
): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

export function getOptionMethod(options: RequestInit | undefined): string {
  return options?.method?.toUpperCase() || 'GET';
}
