import CollectionHistory from "@src/components/collection/CollectionHistory";
import {
  DEFAULT_SERVERINFO,
  SERVERINFO_WITH_SIGNER_AND_HISTORY_CAPABILITIES,
} from "@src/constants";
import * as collectionHooks from "@src/hooks/collection";
import * as preferenceHooks from "@src/hooks/preferences";
import * as sessionHooks from "@src/hooks/session";
import {
  canCreateRecord,
  canEditCollection,
  canEditRecord,
} from "@src/permission";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("@src/permission", () => ({
  __esModule: true,
  canCreateRecord: vi.fn(),
  canEditRecord: vi.fn(),
  canEditCollection: vi.fn(),
}));

describe("CollectionHistory component", () => {
  const routeProps = {
    route: "/default/history",
    path: "/:bid/:cid/:tab?",
    initialEntries: ["/default/collection/history"],
    initialState: {
      session: {
        serverInfo: {
          capabilities: {
            history: {},
            signer: {},
            openid: {},
          },
        },
      },
    },
  };

  const useCollectionHistoryMock = vi.fn();
  const useShowSignerPluginMock = vi.fn();
  const useShowNonHumansMock = vi.fn();

  beforeEach(() => {
    canCreateRecord.mockReturnValue(true);
    canEditRecord.mockReturnValue(true);
    canEditCollection.mockReturnValue(true);

    vi.spyOn(collectionHooks, "useCollectionHistory").mockImplementation(
      useCollectionHistoryMock
    );
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

    useCollectionHistoryMock.mockReturnValue({
      data: [],
      hasNextPage: false,
      next: vi.fn(),
    });
  });

  describe("Without capabilities", () => {
    beforeEach(() => {
      vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(
        DEFAULT_SERVERINFO
      );
      renderWithRouter(<CollectionHistory />, routeProps);
    });

    it("should hide filters when capabilities are missing", () => {
      expect(screen.queryByTestId("showNonHumans")).not.toBeInTheDocument();
      expect(screen.queryByTestId("showSignerPlugin")).not.toBeInTheDocument();
    });
  });

  describe("With filters enabled", () => {
    let rendered;
    beforeEach(() => {
      rendered = renderWithRouter(<CollectionHistory />, routeProps);
    });

    it("should render the history table", () => {
      expect(screen.getByTestId("paginatedTable")).toBeInTheDocument();
    });

    it("should render both filters when supported", () => {
      expect(screen.getByTestId("showNonHumans")).toBeInTheDocument();
      expect(screen.getByTestId("showSignerPlugin")).toBeInTheDocument();
    });

    it("should have both filters checked by default", () => {
      expect(screen.getByTestId("showNonHumans")).toBeChecked();
      expect(screen.getByTestId("showSignerPlugin")).toBeChecked();
    });

    it("should disable signer plugin filter if showNonHumans is unchecked", () => {
      vi.spyOn(preferenceHooks, "useShowNonHumans").mockReturnValue([
        false,
        useShowNonHumansMock,
      ]);
      rendered.rerender(<CollectionHistory />);
      const signerCheckbox = screen.getByTestId("showSignerPlugin");
      expect(signerCheckbox).toBeDisabled();
    });

    it("should update showNonHumans filter when toggled", () => {
      const checkbox = screen.getByTestId("showNonHumans");
      fireEvent.click(checkbox);
      expect(useShowNonHumansMock).toHaveBeenCalledWith(false);
    });

    it("should update showSignerPlugin filter when toggled", () => {
      const checkbox = screen.getByTestId("showSignerPlugin");
      fireEvent.click(checkbox);
      expect(useShowSignerPluginMock).toHaveBeenCalledWith(false);
    });
  });
});
