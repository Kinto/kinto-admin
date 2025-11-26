import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("kinto");

// @rjsf/react-bootstrap has some odd vitest compat error
vi.mock("@rjsf/react-bootstrap", () => {
  return {
    Theme: {}
  };
});

Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
