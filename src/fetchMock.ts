import { getInputUrl } from './utils';

type MatcherFunction = (
  input: URL | RequestInfo,
  options: RequestInit | undefined,
) => boolean;

export default function fetchMock(
  matcher: MatcherFunction,
  response: Response,
): void {
  globalThis.fetch = async (
    input: URL | RequestInfo,
    options: RequestInit | undefined,
  ) => {
    if (matcher(input, options)) {
      console.log('match !');
      return response;
    }

    console.log('will throw');

    throw new Error(
      `Unable to match the given "${
        options?.method || 'GET'
      }" fetch call to "${getInputUrl(input)}"`,
    );
  };
}
