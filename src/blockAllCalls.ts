import { getInputUrl } from './utils';

export default function blockAllCalls(): void {
  globalThis.fetch = async (
    input: URL | RequestInfo,
    options: RequestInit | undefined,
  ): Promise<Response> => {
    const url = getInputUrl(input);

    throw new Error(
      `Unable to fetch "${url}": it seems that you did block all calls but that you did not mock any call at all by calling \`fetchMock\``,
    );
  };
}
