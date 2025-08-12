import HistoryTable from "@src/components/HistoryTable";
import { SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES } from "@src/constants";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

const props = {
  bid: "test",
  cid: "test",
  enableDiffOverview: false,
  historyLoaded: true,
  history: [],
  hasNextHistory: false,
  listNextHistory: vi.fn(),
  location: "/",
  notifyError: vi.fn(),
};

describe("HistoryTable component", () => {
  beforeAll(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(
      SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES
    );
  });

  it("Should show banner if collection is excluded", async () => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue({
      capabilities: {
        history: {
          excluded_resources: [{ bucket: "test" }],
        },
        ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES.capabilities,
      },
      ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES,
    });
    renderWithRouter(<HistoryTable {...props} historyLoaded={false} />);
    expect(screen.queryByTestId("warning")).toBeDefined();
  });

  it("Should render a spinner when not yet loaded", async () => {
    renderWithRouter(<HistoryTable {...props} historyLoaded={false} />);
    expect(screen.queryByTestId("spinner")).toBeDefined();
  });

  it("Should render an empty table when history is loaded but there is no data", async () => {
    renderWithRouter(<HistoryTable {...props} />);
    expect(screen.queryByTestId("spinner")).toBeNull();
    expect(screen.findByText("No history entry found.")).toBeDefined();
  });

  it("Should render our data when data is provided", async () => {
    renderWithRouter(
      <HistoryTable
        {...props}
        history={[
          {
            uri: "/buckets/main-workspace/collections/test",
            date: "2023-11-02T17:56:17.452727+00:00",
            action: "update",
            target: {
              data: {
                id: "test",
              },
            },
            user_id: "test-user",
            collection_id: "test",
            resource_name: "collection",
            id: "test-hist-id1",
            last_modified: 1698947777486,
          },
          {
            uri: "/buckets/main-workspace/collections/test",
            date: "2023-11-02T17:56:17.427881+00:00",
            action: "update",
            target: {
              data: {
                id: "test",
              },
            },
            user_id: "test-user",
            collection_id: "test",
            resource_name: "collection",
            id: "test-hist-id2",
            last_modified: 1698947777451,
          },
        ]}
      />
    );
    expect(screen.queryByTestId("spinner")).toBeNull();
    expect(screen.queryByText("No history entry found.")).toBeNull();
    expect(screen.queryAllByTitle("View entry details").length).toBe(2);
  });
});
