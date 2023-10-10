import { getInputUrl, getOptionMethod } from './utils.js';

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

function fetchMock(matcher: MatcherFunction, response: Response): void {
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

/**
 * Simple matcher for quick mocking
 */
function generateFetchMockHelper(method: string): FetchMockHelper {
  return (url: string | RegExp, response: Response) => {
    return fetchMock((input, options) => {
      if (getOptionMethod(options) !== method) {
        return false;
      }

      if (typeof url === 'string') {
        return getInputUrl(input) === url;
      }

      if (url instanceof RegExp) {
        return url.test(getInputUrl(input));
      }

      throw new Error(
        'input must be a string or a RegExp when using fetchMock helper',
      );
    }, response);
  };
}

type FetchMockHelper = (url: string | RegExp, response: Response) => void;

const get: FetchMockHelper = (url, response): void =>
  generateFetchMockHelper('GET')(url, response);

const post: FetchMockHelper = (url, response): void =>
  generateFetchMockHelper('POST')(url, response);

const put: FetchMockHelper = (url, response): void =>
  generateFetchMockHelper('PUT')(url, response);

const patch: FetchMockHelper = (url, response): void =>
  generateFetchMockHelper('PATCH')(url, response);

const deleteFn: FetchMockHelper = (url, response): void =>
  generateFetchMockHelper('DELETE')(url, response);
fetchMock.get = get;
fetchMock.post = post;
fetchMock.put = put;
fetchMock.patch = patch;
fetchMock.delete = deleteFn;

export default fetchMock;
