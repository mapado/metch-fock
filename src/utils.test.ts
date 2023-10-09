import { describe, test, expect } from 'vitest';
import { getInputUrl } from './utils';

describe('getInputUrl', () => {
  test('with a string', () => {
    expect(getInputUrl('https://www.mapado.com')).toBe(
      'https://www.mapado.com',
    );
  });

  test('with a URL', () => {
    expect(getInputUrl(new URL('v1', 'https://www.mapado.com'))).toBe(
      'https://www.mapado.com/v1',
    );
  });

  test('with a Request', () => {
    expect(getInputUrl(new Request('https://www.mapado.com'))).toBe(
      'https://www.mapado.com/',
    );

    expect(
      getInputUrl(new Request('https://www.mapado.com', { method: 'POST' })),
    ).toBe('https://www.mapado.com/');
  });
});
