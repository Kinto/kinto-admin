import { DEFAULT_SERVERINFO } from "../../src/reducers/session";

export const mockFetchServerInfo = jest
  .fn()
  .mockReturnValue(DEFAULT_SERVERINFO);
const mock = jest.fn().mockImplementation(server => {
  return {
    fetchServerInfo: mockFetchServerInfo,
    remote: server,
  };
});

export default mock;
