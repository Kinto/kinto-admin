import Breadcrumbs from "@src/components/Breadcrumbs/Breadcrumbs";
import { renderWithRouter } from "@test/testUtils";
import { screen } from "@testing-library/react";

describe("Breadcrumbs component", () => {
  it("should link home only at the root", () => {
    renderWithRouter(<Breadcrumbs />);
    expect(
      screen.getAllByRole("link").map(a => a.getAttribute("href"))
    ).toEqual(["/"]);
  });

  it("should link each path segment", () => {
    renderWithRouter(<Breadcrumbs />, {
      route: "/foo/bar",
      path: "/foo/bar",
    });
    expect(
      screen
        .getAllByRole("link")
        .map(a => [a.textContent, a.getAttribute("href")])
    ).toEqual([
      ["home", "/"],
      ["foo", "/foo"],
      ["bar", "/foo/bar"],
    ]);
  });
});
