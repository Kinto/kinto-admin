import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("kinto-http");

Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
