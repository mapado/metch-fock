import { describe, test, expect } from 'vitest';
import blockAllCalls from './blockAllCalls';

describe('blockAllCalls', () => {
  test('should execute call when call are not blocked', async () => {
    const response = await fetch('https://www.mapado.com');

    expect(response.status).toBe(200);
  });

  test('should throw when call are blocked and no mock is defined', async () => {
    blockAllCalls();

    await expect(fetch('https://www.mapado.com')).rejects.toEqual(
      new Error(
        'Unable to fetch "https://www.mapado.com": it seems that you did block all calls but that you did not mock any call at all by calling `fetchMock`',
      ),
    );
  });
});
