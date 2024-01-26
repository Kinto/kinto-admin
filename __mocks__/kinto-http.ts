import { DEFAULT_SERVERINFO } from "@src/reducers/session";
import { vi } from 'vitest';

export const mockFetchServerInfo = vi.fn().mockReturnValue(DEFAULT_SERVERINFO);

const mock = vi.fn().mockImplementation(server => {
  return {
    fetchServerInfo: mockFetchServerInfo,
    remote: server,
  };
});

export default mock;
