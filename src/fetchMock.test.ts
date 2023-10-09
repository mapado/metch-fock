import { describe, test, expect } from 'vitest';
import fetchMock from './fetchMock';
import { getInputUrl } from './utils';

describe('fetchMock', () => {
  test('should handle a simple mock', async () => {
    const response = new Response('Hello world !');

    fetchMock((input, options) => true, response);

    const result = await globalThis.fetch('https://www.mapado.com');

    expect(result).toBe(response);
  });

  test('should throw if matcher function returns false (no method given)', async () => {
    const response = new Response('Hello world !');

    fetchMock((input, options) => false, response);

    await expect(globalThis.fetch('https://www.mapado.com')).rejects.toEqual(
      new Error(
        'Unable to match the given "GET" fetch call to "https://www.mapado.com"',
      ),
    );
  });

  test.each([
    { method: 'GET', url: 'https://www.mapado.com' },
    { method: 'POST', url: 'https://www.mapado.com' },
    { method: 'PUT', url: new URL('v2', 'https://www.mapado.com') },
    { method: 'PATCH', url: 'https://www.mapado.com' },
    { method: 'DELETE', url: 'https://www.mapado.com' },
  ])('should throw with the correct method', async ({ method, url }) => {
    const response = new Response('Hello world !');

    fetchMock((input, options) => false, response);

    await expect(globalThis.fetch(url, { method })).rejects.toEqual(
      new Error(`Unable to match the given "${method}" fetch call to "${url}"`),
    );
  });

  test('should handle a simple matcher', async () => {
    const response = new Response('Hello world !');

    fetchMock(
      (input, options) => getInputUrl(input).startsWith('https://do.match'),
      response,
    );

    await expect(globalThis.fetch('https://do.match/test')).resolves.toBe(
      response,
    );

    await expect(globalThis.fetch('https://dont.match/test')).rejects.toEqual(
      new Error(
        'Unable to match the given "GET" fetch call to "https://dont.match/test"',
      ),
    );
  });

  // test('should handle different matchers', async () => {
  //   fetchMock(
  //     (input, options) => getInputUrl(input).startsWith('https://1.match'),
  //     new Response('Match 1'),
  //   );

  //   fetchMock(
  //     (input, options) => getInputUrl(input).startsWith('https://2.match'),
  //     new Response('Match 2'),
  //   );

  //   const r1 = await globalThis.fetch('https://1.match/test');
  //   expect(await r1.text()).toEqual('Match 1');

  //   const r2 = await globalThis.fetch('https://2.match/test');
  //   expect(await r2.text()).toEqual('Match 2');
  // });
});
