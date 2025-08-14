import HistoryTable from "@src/components/HistoryTable";
import {
  DEFAULT_SERVERINFO,
  SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES,
} from "@src/constants";
import * as preferenceHooks from "@src/hooks/preferences";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

// Mocks
const useShowNonHumansMock = vi.fn();
const useShowSignerPluginMock = vi.fn();

const baseProps = {
  bid: "test",
  cid: "test",
  enableDiffOverview: true,
  historyLoaded: true,
  history: [],
  hasNextHistory: false,
  listNextHistory: vi.fn(),
  onFiltersChange: vi.fn(),
};

describe("HistoryTable component", () => {
  beforeEach(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(
      SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show warning banner if collection is excluded", async () => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue({
      capabilities: {
        ...SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES.capabilities,
        history: {
          excluded_resources: [{ bucket: "test" }],
        },
      },
    });

    renderWithRouter(<HistoryTable {...baseProps} historyLoaded={false} />);
    expect(await screen.findByTestId("warning")).toBeInTheDocument();
  });

  it("should render a spinner when not yet loaded", async () => {
    renderWithRouter(<HistoryTable {...baseProps} historyLoaded={false} />);
    expect(await screen.findByTestId("spinner")).toBeInTheDocument();
  });

  it("should render empty state when history is loaded but empty", async () => {
    renderWithRouter(<HistoryTable {...baseProps} />);
    expect(
      await screen.findByText("No history entry found.")
    ).toBeInTheDocument();
  });

  it("should render table rows when history data is provided", async () => {
    const testHistory = [
      {
        uri: "/buckets/test/collections/test",
        date: "2023-11-02T17:56:17.452727+00:00",
        action: "update",
        target: { data: { id: "test" } },
        user_id: "test-user",
        collection_id: "test",
        resource_name: "collection",
        id: "test-hist-id1",
        last_modified: 1698947777486,
      },
      {
        uri: "/buckets/test/collections/test",
        date: "2023-11-02T17:56:17.427881+00:00",
        action: "update",
        target: { data: { id: "test" } },
        user_id: "test-user",
        collection_id: "test",
        resource_name: "collection",
        id: "test-hist-id2",
        last_modified: 1698947777451,
      },
    ];

    renderWithRouter(<HistoryTable {...baseProps} history={testHistory} />);
    expect(await screen.findAllByTitle("View entry details")).toHaveLength(2);
  });
});

describe("HistoryTable filters", () => {
  beforeEach(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(
      SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES
    );
    vi.spyOn(preferenceHooks, "useShowSignerPlugin").mockImplementation(() => [
      true,
      useShowSignerPluginMock,
    ]);
    vi.spyOn(preferenceHooks, "useShowNonHumans").mockImplementation(() => [
      true,
      useShowNonHumansMock,
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render both filters when supported", async () => {
    renderWithRouter(<HistoryTable {...baseProps} />);
    expect(await screen.findByTestId("showNonHumans")).toBeInTheDocument();
    expect(await screen.findByTestId("showSignerPlugin")).toBeInTheDocument();
  });

  it("should have both filters checked by default", async () => {
    renderWithRouter(<HistoryTable {...baseProps} />);
    expect(await screen.findByTestId("showNonHumans")).toBeChecked();
    expect(await screen.findByTestId("showSignerPlugin")).toBeChecked();
  });

  it("should disable signer plugin filter if showNonHumans is unchecked", async () => {
    vi.spyOn(preferenceHooks, "useShowNonHumans").mockImplementation(() => [
      false,
      useShowNonHumansMock,
    ]);
    renderWithRouter(<HistoryTable {...baseProps} />);
    expect(await screen.findByTestId("showSignerPlugin")).toBeDisabled();
  });

  it("should call update function when toggling non-human filter", async () => {
    renderWithRouter(<HistoryTable {...baseProps} />);
    const checkbox = await screen.findByTestId("showNonHumans");
    fireEvent.click(checkbox);
    expect(useShowNonHumansMock).toHaveBeenCalledWith(false);
  });

  it("should call update function when toggling signer plugin filter", async () => {
    renderWithRouter(<HistoryTable {...baseProps} />);
    const checkbox = await screen.findByTestId("showSignerPlugin");
    fireEvent.click(checkbox);
    expect(useShowSignerPluginMock).toHaveBeenCalledWith(false);
  });
});

describe("HistoryTable without capabilities", () => {
  beforeEach(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(DEFAULT_SERVERINFO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should hide filters when capabilities are missing", async () => {
    renderWithRouter(<HistoryTable {...baseProps} />);
    expect(screen.queryByTestId("showNonHumans")).not.toBeInTheDocument();
    expect(screen.queryByTestId("showSignerPlugin")).not.toBeInTheDocument();
  });
});
