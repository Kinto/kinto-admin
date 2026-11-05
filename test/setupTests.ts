import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("kinto");

// @rjsf/react-bootstrap has some odd vitest compat error
vi.mock("@rjsf/react-bootstrap", () => {
  return {
    Theme: {},
  };
});

Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

// For CodeMirror
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
