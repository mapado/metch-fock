import { getInputUrl } from './utils';

type MatcherFunction = (
  input: URL | RequestInfo,
  options: RequestInit | undefined,
) => boolean;

class Matcher {
  matcher: MatcherFunction;
  response: Response;

  constructor(matcher: MatcherFunction, response: Response) {
    this.matcher = matcher;
    this.response = response;
  }
}

let matchers: Array<Matcher> = [];

export function resetMocks(): void {
  matchers = [];
}

export default function fetchMock(
  matcher: MatcherFunction,
  response: Response,
): void {
  matchers.push(new Matcher(matcher, response));

  overrideFetch();
}

function overrideFetch() {
  globalThis.fetch = async (
    input: URL | RequestInfo,
    options: RequestInit | undefined,
  ) => {
    for (const matcher of matchers) {
      if (matcher.matcher(input, options)) {
        return matcher.response;
      }
    }

    throw new Error(
      `Unable to match the given "${
        options?.method || 'GET'
      }" fetch call to "${getInputUrl(input)}"`,
    );
  };
}
