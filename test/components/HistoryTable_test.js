import React from "react";
import { render } from "@testing-library/react";
import HistoryTable from "../../src/components/HistoryTable";
import { BrowserRouter as Router, Route } from "react-router-dom";

const props = {
  bid: "test",
  cid: "test",
  enableDiffOverview: false,
  historyLoaded: true,
  history: [],
  hasNextHistory: false,
  listNextHistory: jest.fn(),
  location: "/",
  notifyError: jest.fn(),
};

describe("HistoryTable component", () => {
  it("Should render a spinner when not yet loaded", async () => {
    const result = render(<HistoryTable {...props} historyLoaded={false} />);
    expect(result.queryByTestId("spinner")).toBeDefined();
  });

  it("Should render an empty table when history is loaded but there is no data", async () => {
    const result = render(<HistoryTable {...props} />);
    expect(result.queryByTestId("spinner")).toBeNull();
    expect(result.findByText("No history entry found.")).toBeDefined();
  });

  it("Should render our data when data is provided", async () => {
    const result = render(
      <Router>
        <Route path="/">
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
        </Route>
      </Router>
    );
    expect(result.queryByTestId("spinner")).toBeNull();
    expect(result.queryByText("No history entry found.")).toBeNull();
    expect(result.queryAllByTitle("View entry details").length).toBe(2);
  });
});
