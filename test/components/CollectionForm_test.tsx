import CollectionForm from "@src/components/collection/CollectionForm";
import * as collectionHooks from "@src/hooks/collection";
import { canCreateCollection, canEditCollection } from "@src/permission";
import { renderWithProvider } from "@test/testUtils";
import { screen } from "@testing-library/react";
import React from "react";

const warningText =
  "You don't have the required permission to edit this collection.";

vi.mock("@src/permission", () => {
  return {
    __esModule: true,
    canCreateCollection: vi.fn(),
    canEditCollection: vi.fn(),
  };
});

describe("CollectionForm component", () => {
  beforeAll(() => {
    // preventing code mirror errors
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    });
    Range.prototype.getClientRects = () => ({
      item: () => null,
      length: 0,
      [Symbol.iterator]: vi.fn(),
    });
  });

  it("Should render an editable form for a user with permissions creating a new collection", async () => {
    canCreateCollection.mockReturnValue(true);
    renderWithProvider(<CollectionForm />, {
      route: "/default",
      path: "/:bid",
    });

    const warning = screen.queryByText(warningText);
    expect(warning).toBeNull();
    const title = await screen.findByLabelText("Collection id*");
    expect(title.disabled).toBe(false);
  });

  it("Should render an editable form for a user with permissions editing a collection", async () => {
    canEditCollection.mockReturnValue(true);
    vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
      id: "test",
    });

    renderWithProvider(<CollectionForm />, {
      route: "/default/test",
      path: "/:bid/:cid",
    });

    const warning = screen.queryByText(warningText);
    expect(warning).toBeNull();
    const title = await screen.findByLabelText("Collection id*");
    expect(title.disabled).toBe(false);
  });

  it("Should render an error for a user lacking permissions creating a collection", async () => {
    canCreateCollection.mockReturnValue(false);
    renderWithProvider(<CollectionForm />, {
      route: "/default",
      path: "/:bid",
    });

    const warning = await screen.queryByText(warningText);
    expect(warning).toBeDefined();
    const title = await screen.findByLabelText("Collection id*");
    expect(title.disabled).toBe(true);
  });

  it("Should render as read-only for a user lacking permissions editing a collection", async () => {
    canEditCollection.mockReturnValue(false);
    renderWithProvider(<CollectionForm />, {
      route: "/default/test",
      path: "/:bid/:cid",
    });

    const warning = await screen.queryByText(warningText);
    expect(warning).toBeDefined();
    const title = await screen.findByLabelText("Collection id*");
    expect(title.disabled).toBe(true);
  });
});
