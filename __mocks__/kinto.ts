import { DEFAULT_SERVERINFO } from "@src/reducers/session";
import { vi } from 'vitest';

export const mockFetchServerInfo = vi.fn().mockReturnValue(DEFAULT_SERVERINFO);

export const KintoClient = vi.fn().mockImplementation(server => {
  return {
    fetchServerInfo: mockFetchServerInfo,
    remote: server,
    listBuckets: () => {
      return {
        data: []
      };
    },
    batch: () => {
      return [];
    },
  };
});

