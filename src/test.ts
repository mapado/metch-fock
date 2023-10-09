globalThis.fetch = async (
  input: URL | RequestInfo,
  options: RequestInit | undefined,
) => {
  return new Response('hello world');
};
