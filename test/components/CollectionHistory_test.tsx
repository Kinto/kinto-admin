import CollectionHistory from "@src/components/collection/CollectionHistory";
import { SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES } from "@src/constants";
import * as collectionHooks from "@src/hooks/collection";
import * as preferenceHooks from "@src/hooks/preferences";
import * as sessionHooks from "@src/hooks/session";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

describe("CollectionHistory component", () => {
  const useCollectionHistoryMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();

    // Hook mocks
    vi.spyOn(collectionHooks, "useCollectionHistory").mockImplementation(
      useCollectionHistoryMock
    );
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(
      SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES
    );
    vi.spyOn(preferenceHooks, "useShowNonHumans").mockImplementation(() => [
      true,
      vi.fn(),
    ]);
    vi.spyOn(preferenceHooks, "useShowSignerPlugin").mockImplementation(() => [
      true,
      vi.fn(),
    ]);

    // Mock history hook return value
    useCollectionHistoryMock.mockReturnValue({
      data: [],
      hasNextPage: false,
      next: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the history table", async () => {
    renderWithRouter(<CollectionHistory />, {
      route: "/default/collection/history",
      path: "/:bid/:cid/:tab?",
      initialEntries: ["/default/collection/history"],
    });

    expect(await screen.findByTestId("paginatedTable")).toBeInTheDocument();
  });

  it("should apply filters from query params", () => {
    renderWithRouter(<CollectionHistory />, {
      route:
        "/default/collection/history?since=42&show_signer_plugin=false&resource_name=record",
      path: "/:bid/:cid/:tab?",
      initialEntries: [
        "/default/collection/history?since=42&show_signer_plugin=false&resource_name=record",
      ],
    });

    expect(useCollectionHistoryMock).toHaveBeenCalledWith(
      "default",
      "collection",
      {
        since: "42",
        show_signer_plugin: false,
        resource_name: "record",
      }
    );
  });
});
