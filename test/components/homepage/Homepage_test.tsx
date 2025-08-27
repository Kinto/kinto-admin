import { HomePage } from "@src/components/homepage/HomePage";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as sessionHooks from "@src/hooks/session";
import * as localStore from "@src/store/localStore";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

describe("HomePage component", () => {
  afterEach(() => {
    localStore.clearSession();
  });
  const mockUseServerInfo = vi.fn();

  beforeEach(() => {
    vi.spyOn(sessionHooks, "useServerInfo").mockImplementation(
      mockUseServerInfo
    );
  });

  describe("Authenticating", () => {
    it("loads a spinner when authenticating", async () => {
      mockUseServerInfo.mockReturnValue(undefined);
      renderWithRouter(<HomePage />);
      expect(await screen.findByTestId("spinner")).toBeDefined();
    });
  });

  describe("Authenticated", () => {
    it("should render server information heading with default info if it cannot be fetched", async () => {
      mockUseServerInfo.mockReturnValue(DEFAULT_SERVERINFO);
      renderWithRouter(<HomePage />);

      expect(screen.getByText("Properties").textContent).toBeDefined();
      vi.waitFor(() => {
        expect(
          [].map.call(screen.getAllByTestId("home-th"), x => x.textContent)
        ).toStrictEqual([
          "url",
          "capabilities",
          "project_name",
          "project_docs",
        ]);
      });
    });
  });
});
