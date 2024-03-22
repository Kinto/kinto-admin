import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("kinto");

Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
