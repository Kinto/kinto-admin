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
  const useExcludeSignerPluginMock = vi.fn();
  const useExcludeNonHumansMock = vi.fn();

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
    vi.spyOn(preferenceHooks, "useExcludeSignerPlugin").mockImplementation(
      () => [false, useExcludeSignerPluginMock]
    );
    vi.spyOn(preferenceHooks, "useExcludeNonHumans").mockImplementation(() => [
      false,
      useExcludeNonHumansMock,
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
      expect(screen.queryByTestId("excludeNonHumans")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("excludeSignerPlugin")
      ).not.toBeInTheDocument();
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
      expect(screen.getByTestId("excludeNonHumans")).toBeInTheDocument();
      expect(screen.getByTestId("excludeSignerPlugin")).toBeInTheDocument();
    });

    it("should have no filter checked by default", () => {
      expect(screen.getByTestId("excludeNonHumans")).not.toBeChecked();
      expect(screen.getByTestId("excludeSignerPlugin")).not.toBeChecked();
    });

    it("should disable signer plugin filter if excludeNonHumans is checked", () => {
      vi.spyOn(preferenceHooks, "useExcludeNonHumans").mockReturnValue([
        true,
        useExcludeNonHumansMock,
      ]);
      rendered.rerender(<CollectionHistory />);
      const signerCheckbox = screen.getByTestId("excludeSignerPlugin");
      expect(signerCheckbox).toBeDisabled();
    });

    it("should update excludeNonHumans filter when toggled", () => {
      const checkbox = screen.getByTestId("excludeNonHumans");
      fireEvent.click(checkbox);
      expect(useExcludeNonHumansMock).toHaveBeenCalledWith(true);
    });

    it("should update excludeSignerPlugin filter when toggled", () => {
      const checkbox = screen.getByTestId("excludeSignerPlugin");
      fireEvent.click(checkbox);
      expect(useExcludeSignerPluginMock).toHaveBeenCalledWith(true);
    });
  });
});
