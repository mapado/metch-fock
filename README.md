# metch-fock

A `fetch` mock library.

It will replace the fetch implementation by a custom one matching your response.

It does work with Node 18+ `fetch` implementation. (See [Considered alternatives](#considered-alternatives)).

## Installation

Install it with your package manager

```sh
# npm
npm i -D metch-fock
#yarn
yarn add --dev metch-fock
#pnpm
pnpm add -D metch-fock
```

## Usage

Imagine that function:

```ts
/**
 * This is a really simple function, you might have something way more complicated in your codebase.
 * The only important thing is that it will call the `fetch` method.
 */
async function doFetchWithToken(input, options) {
  const options = addToken(options);

  return fetch(input, options);
}
```

You need to implement a `beforeEach` and `afterEach` method.
The first one will be used to block all network `fetch` call to avoid calling distant urls when running your tests.
The second one will reset the mock stack. If you don't do that, the second test will match the mock of the first test, you don't want that.

```ts
import { blockAllCalls, fetchMock, resetMocks } from './fetchMock';

describe('some test file', () => {
  beforeEach(() => {
    // block all network calls
    blockAllCalls();
  });

  afterEach(() => {
    // empty the mock call stack
    resetMocks();
  });

  test('a test that will match every call', () => {
    const expected = new Response('OK');

    fetchMock(() => true, expected);

    const r1 = await doFetchWithToken('https://match.shrug/test');

    expect(r1).toBe(expected);
  });

  test('some test', () => {
    const expected = new Response('OK');

    fetchMock.get('https://match.get/test', expected);
    fetchMock.put(/https:\/\/match.put\//, expected);

    const r1 = await doFetchWithToken('https://match.get/test');

    expect(r1).toBe(expected);

    const r2 = await doFetchWithToken('https://match.put/test', {
      method: 'PUT',
    });

    expect(r2).toBe(expected);
  });

  test('some test with a complex matcher', () => {
    const expected = new Response('OK');

    fetchMock((input, options): boolean => {
      // you have access to all parameters of `fetch` function here, you can return anything you want
      return options?.headers?.Authorization === 'Bearer some-token';
    }, expected);

    const r1 = await doFetchWithToken('https://match.shrug/test', {
      headers: { Authorization: 'Bearer some-token' },
    });

    expect(r1).toBe(expected);
  });
});
```

## API

Main matcher function, with all the flexibility you want:

```ts
function fetchMock(
  matcher: (
    input: URL | RequestInfo,
    options: RequestInit | undefined,
  ) => boolean,
  response: Response,
): void;
```

Helpers for simple test writing:

```ts
function fetchMock.get(url: string | RegExp, response: Response): void;
function fetchMock.post(url: string | RegExp, response: Response): void;
function fetchMock.put(url: string | RegExp, response: Response): void;
function fetchMock.patch(url: string | RegExp, response: Response): void;
function fetchMock.delete(url: string | RegExp, response: Response): void;
```

Utility functions:

```ts
function getInputUrl(input: URL | RequestInfo): string;
function getOptionMethod(options: RequestInit | undefined): string;
```

## Considered alternatives

- We were using [`nock`](https://github.com/nock/nock) for a long time (and still are in some of our projects), but nock [is currently not compatible with Node 18+ native fetch implementation](https://github.com/nock/nock/issues/2397)
- [`fetch-mock`](https://github.com/wheresrhys/fetch-mock), but no commit since Sep 2021, and does not work with [node 18+ fetch](https://github.com/wheresrhys/fetch-mock/issues/658) either
- [@mswjs/interceptors](https://github.com/mswjs/interceptors) seems really overkill for a mocking system (but it does seems really powerful for middleware, proxy, etc.)
- [undici MockAgent](https://undici.nodejs.org/#/docs/best-practices/mocking-request) does seems to work only with undici.
