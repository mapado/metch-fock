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

function overrideFetch(): void {
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

type FetchMockHelper = {
  (url: string | RegExp, response: Response): void;
  startsWith: FetchMockStringHelper;
  endsWith: FetchMockStringHelper;
  includes: FetchMockStringHelper;
};
type FetchMockStringHelper = (url: string, response: Response) => void;
type ValidStringMethod = 'startsWith' | 'endsWith' | 'includes';

type FetchMockFunction = {
  (matcher: MatcherFunction, response: Response): void;
  get: FetchMockHelper;
  post: FetchMockHelper;
  put: FetchMockHelper;
  patch: FetchMockHelper;
  delete: FetchMockHelper;
};

const fetchMock: FetchMockFunction = (matcher, response): void => {
  matchers.unshift(new Matcher(matcher, response));

  overrideFetch();
};

/**
 * Simple matcher for quick mocking.
 * For example `fetchMock.post(url: string | RegExp, response: Response)` helper.
 */
function generateFetchMockHelper(method: string): FetchMockHelper {
  const fn: FetchMockHelper = (url: string | RegExp, response: Response) => {
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

  fn.startsWith = generateFetchMockStringHelper(method, 'startsWith');
  fn.endsWith = generateFetchMockStringHelper(method, 'endsWith');
  fn.includes = generateFetchMockStringHelper(method, 'includes');

  return fn;
}

/**
 * This function generate string helper functions.
 * For example `fetchMock.post.startsWith(startUrl: string, response: Response)` helper.
 */
function generateFetchMockStringHelper(
  method: string,
  methodName: ValidStringMethod,
): FetchMockStringHelper {
  return (url, response) => {
    return fetchMock(
      (input, options) =>
        getOptionMethod(options) === method &&
        getInputUrl(input)[methodName](url),
      response,
    );
  };
}

fetchMock.get = generateFetchMockHelper('GET');
fetchMock.post = generateFetchMockHelper('POST');
fetchMock.put = generateFetchMockHelper('PUT');
fetchMock.patch = generateFetchMockHelper('PATCH');
fetchMock.delete = generateFetchMockHelper('DELETE');

export default fetchMock;
