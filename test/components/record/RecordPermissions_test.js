import * as React from "react";
import { expect } from "chai";
import { RecordPermissions } from "../../../src/components/record/RecordPermissions";
import { createComponent, sessionFactory } from "../../test_utils";

describe("RecordPermissions component", () => {
  const route =
    "/buckets/test-bucket/collections/test-collection/records/test-record/permissions";
  const path = "/buckets/:bid/collections/:cid/records/:rid/permissions";
  it("renders", () => {
    const initialState = {
      session: sessionFactory(),
      record: { busy: false },
    };
    const node = createComponent(<RecordPermissions />, {
      initialState,
      route: route,
      path: path,
    });
    expect(node.querySelector("h1").textContent).to.equal(
      "Edit test-bucket/test-collection/test-record record permissions"
    );
  });
  it("renders a loading spinner when record is busy", () => {
    const initialState = {
      session: sessionFactory(),
      record: { busy: true },
    };
    const node = createComponent(<RecordPermissions />, {
      initialState,
      route: route,
      path: path,
    });
    expect(node.querySelector(".spinner")).to.be.ok;
  });
});
