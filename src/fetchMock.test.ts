import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fetchMock, { resetMocks } from './fetchMock';
import { getInputUrl } from './utils';
import blockAllCalls from './blockAllCalls';

describe('fetchMock', () => {
  beforeEach(() => {
    blockAllCalls();
  });

  afterEach(() => {
    resetMocks();
  });

  test('should handle a simple mock', async () => {
    const response = new Response('Hello world !');

    fetchMock((input, options) => true, response);

    const result = await fetch('https://www.mapado.com');

    expect(result).toBe(response);
  });

  test('should throw if matcher function returns false (no method given)', async () => {
    const response = new Response('Hello world !');

    fetchMock((input, options) => false, response);

    await expect(fetch('https://www.mapado.com')).rejects.toEqual(
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

    await expect(fetch(url, { method })).rejects.toEqual(
      new Error(`Unable to match the given "${method}" fetch call to "${url}"`),
    );
  });

  test('should handle a simple matcher', async () => {
    const response = new Response('Hello world !');

    fetchMock(
      (input, options) => getInputUrl(input).startsWith('https://do.match'),
      response,
    );

    await expect(fetch('https://do.match/test')).resolves.toBe(response);

    await expect(fetch('https://dont.match/test')).rejects.toEqual(
      new Error(
        'Unable to match the given "GET" fetch call to "https://dont.match/test"',
      ),
    );
  });

  test('should handle different matchers', async () => {
    fetchMock(
      (input, options) => getInputUrl(input).startsWith('https://1.match'),
      new Response('Match 1'),
    );

    fetchMock(
      (input, options) => getInputUrl(input).startsWith('https://2.match'),
      new Response('Match 2'),
    );

    const r1 = await fetch('https://1.match/test');
    expect(await r1.text()).toEqual('Match 1');

    const r2 = await fetch('https://2.match/test');
    expect(await r2.text()).toEqual('Match 2');
  });

  test('resetting the mock should remove all matchers', async () => {
    fetchMock((input, options) => true, new Response('Match 1'));

    const r1 = await fetch('https://1.match/test');
    expect(await r1.text()).toEqual('Match 1');

    resetMocks();

    await expect(fetch('https://1.match/test')).rejects.toEqual(
      new Error(
        'Unable to match the given "GET" fetch call to "https://1.match/test"',
      ),
    );
  });
});

describe('fetchMock.method', () => {
  beforeEach(() => {
    blockAllCalls();
  });

  afterEach(() => {
    resetMocks();
  });

  test('fetchMock.get()', async () => {
    const response = new Response('Hello world !');

    fetchMock.get('https://www.mapado.com', response);

    const result = await fetch('https://www.mapado.com');

    expect(result).toBe(response);
  });

  test('fetchMock.post()', async () => {
    const response = new Response('Hello world !');

    fetchMock.post('https://www.mapado.com', response);

    const result = await fetch('https://www.mapado.com', { method: 'POST' });

    expect(result).toBe(response);
  });

  test('fetchMock.put() with regex', async () => {
    const response = new Response('Hello world !');

    fetchMock.put(/https:\/\/www\.mapado\.com\/v1\//, response);

    await expect(
      fetch('https://www.mapado.com/v1/test', { method: 'PUT' }),
    ).resolves.toBe(response);
  });

  test.each([
    8,
    { foo: 'bar' },
    Symbol('symbol'),
    new Blob([]),
    function () {},
    () => {},
  ])('helper with a weird value', async (matcher) => {
    // @ts-expect-error Testing weird values at runtime
    fetchMock.put(matcher, new Response('Ok'));

    await expect(
      fetch('https://www.mapado.com/v1/test', { method: 'PUT' }),
    ).rejects.toEqual(
      new Error(
        'input must be a string or a RegExp when using fetchMock helper',
      ),
    );
  });
});

describe('fetchMock.method.stringMethod', () => {
  test('startsWith', async () => {
    const response = new Response('Hello world !');

    fetchMock.delete.startsWith('https://www.mapado.com', response);

    const result = await fetch('https://www.mapado.com/foo.bar', {
      method: 'DELETE',
    });

    expect(result).toBe(response);
  });

  test('endsWith', async () => {
    const response = new Response('Hello world !');

    fetchMock.patch.endsWith('foo.bar', response);

    const result = await fetch('https://www.mapado.com/foo.bar', {
      method: 'PATCH',
    });

    expect(result).toBe(response);
  });

  test('includes', async () => {
    const response = new Response('Hello world !');

    fetchMock.get.includes('mapado', response);

    const result = await fetch('https://www.mapado.com/foo.bar');

    expect(result).toBe(response);
  });
});
