import AuthForm from "../../src/components/AuthForm";
import { DEFAULT_SERVERINFO } from "../../src/reducers/session";
import { createSandbox, createComponent } from "../test_utils";
import { expect } from "chai";
import { DEFAULT_KINTO_SERVER } from "../../src/constants";

describe("AuthForm component", () => {
  let sandbox,
    setupSession,
    getServerInfo,
    navigateToExternalAuth,
    serverChange;

  beforeEach(() => {
    jest.resetModules();
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  it("should set the default server url in a visible field", () => {
    const node = createComponent(AuthForm, {
      match: {},
      setupSession,
      serverChange,
      getServerInfo,
      servers: [],
      navigateToExternalAuth,
      session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
    });
    const element = node.querySelector("input[id='root_server']");
    expect(element.type).eql("text");
    expect(element.value).eql(DEFAULT_KINTO_SERVER);
  });

  it("should set the server url value in hidden field", async () => {
    jest.doMock("../../src/constants", () => {
      const actual = jest.requireActual("../../src/constants");
      return {
        __esModule: true,
        ...actual,
        SINGLE_SERVER: "http://www.example.com/",
      };
    });
    const AuthForm = require("../../src/components/AuthForm").default;
    const node = createComponent(AuthForm, {
      match: {},
      setupSession,
      serverChange,
      getServerInfo,
      servers: [],
      navigateToExternalAuth,
      session: { authenticated: false, serverInfo: DEFAULT_SERVERINFO },
    });
    const element = node.querySelector("input[id='root_server']");
    expect(element.type).eql("hidden");
    expect(element.value).eql("http://www.example.com/");
  });
});
