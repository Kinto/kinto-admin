import PerRecordDiffView, {
  findChangeTypes,
  ChangeType,
  formatDiffHeader,
} from "../../../../src/components/signoff/SimpleReview/PerRecordDiffView";
import React from "react";
import { render } from "@testing-library/react";

function renderSimpleReview(props = null) {
  const mergedProps = {
    oldRecords: [],
    newRecords: [],
    collectionData: {
      status: "to-review",
      bid: "a",
      cid: "b",
    },
    ...props,
  };
  return render(<PerRecordDiffView {...mergedProps} />);
}

describe("PerRecordDiffView component", () => {
  it("should render loading when authenticating", () => {
    const node = renderSimpleReview({
      collectionData: {
        status: "signed",
        bid: "a",
        cid: "b",
      },
    });
    expect(node.container.textContent).toBe(
      "No changes to review, collection status is signed."
    );
  });

  it("should render diffs", () => {
    const node = renderSimpleReview({
      oldRecords: [{ id: "foo" }, { id: "bar" }],
      newRecords: [{ id: "foo" }, { id: "baz" }],
    });
    expect(node.queryAllByTestId("record-diff")).toHaveLength(2);
  });

  it("should render per-record diffs", () => {
    const node = renderSimpleReview({
      oldRecords: [{ id: "foo" }],
      newRecords: [{ id: "foo" }, { id: "bar" }],
    });
    expect(node.queryAllByTestId("record-diff")).toHaveLength(1);
  });
});

describe("findChangeTypes", () => {
  it("should find added items", () => {
    expect(
      findChangeTypes([{ id: "a" }], [{ id: "a" }, { id: "b" }])
    ).toStrictEqual([
      { id: "b", changeType: ChangeType.ADD, target: { id: "b" } },
    ]);
  });

  it("should find removed items", () => {
    expect(
      findChangeTypes([{ id: "a" }, { id: "b" }], [{ id: "a" }])
    ).toStrictEqual([
      { id: "b", changeType: ChangeType.REMOVE, source: { id: "b" } },
    ]);
  });

  it("should find multiple removed items", () => {
    expect(
      findChangeTypes(
        [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
        [{ id: "a" }]
      )
    ).toStrictEqual([
      { id: "b", changeType: ChangeType.REMOVE, source: { id: "b" } },
      { id: "c", changeType: ChangeType.REMOVE, source: { id: "c" } },
      { id: "d", changeType: ChangeType.REMOVE, source: { id: "d" } },
    ]);
  });

  it("should find updated items", () => {
    expect(
      findChangeTypes(
        [{ id: "a", text: "hello", last_modified: 123 }],
        [{ id: "a", text: "world", last_modified: 456 }]
      )
    ).toStrictEqual([
      {
        id: "a",
        changeType: ChangeType.UPDATE,
        source: { id: "a", text: "hello", last_modified: 123 },
        target: { id: "a", text: "world", last_modified: 456 },
      },
    ]);
  });

  it("should find empty updated items", () => {
    expect(
      findChangeTypes(
        [{ id: "a", last_modified: 123 }],
        [{ id: "a", last_modified: 456 }]
      )
    ).toStrictEqual([
      {
        id: "a",
        changeType: ChangeType.EMPTY_UPDATE,
        source: { id: "a", last_modified: 123 },
        target: { id: "a", last_modified: 456 },
      },
    ]);
  });

  it("should sort by id", () => {
    const sources = [
      { id: "a" },
      { id: "d", text: "foo" },
      { id: "c", text: "foo" },
      { id: "e", last_modified: 123 },
    ];
    const [, d, c, e] = sources;
    const targets = [
      { id: "c", text: "bar" },
      { id: "b" },
      { id: "a" },
      { id: "e", last_modified: 456 },
    ];
    const [c2, b, , e2] = targets;
    expect(findChangeTypes(sources, targets)).toStrictEqual([
      { id: "b", changeType: ChangeType.ADD, target: b },
      { id: "c", changeType: ChangeType.UPDATE, source: c, target: c2 },
      { id: "d", changeType: ChangeType.REMOVE, source: d },
      { id: "e", changeType: ChangeType.EMPTY_UPDATE, source: e, target: e2 },
    ]);
  });
});

describe("formatDiffHeader", () => {
  it("returns expected header based on provided records and displayFields", () => {

    let getTextContent = (props) => {
      return render(
        formatDiffHeader(props)
      ).container.textContent;
    };
    
    expect(getTextContent({
      target: { id: "foo"}
    })).toBe("id: foo");
    
    expect(getTextContent({
      source: { id: "foo"}
    })).toBe("id: foo");

    expect(getTextContent({
      source: { 
        id: "foo",
        prop1: "val1",
        prop2: "val2",
      },
      target: { 
        id: "foo",
        prop1: "val3",
        prop2: "val4",
      }
    })).toBe("id: foo");

    expect(getTextContent({
      source: { 
        id: "foo",
        prop1: "val1",
        prop2: "val2",
        prop3: "prevVal",
      },
      target: { 
        id: "foo",
        prop1: "val3",
        prop2: "val4",
        // prop3 intentionally undefined
      },
      displayFields: [ "prop1", "prop2", "prop3"]
    })).toBe("prop1: val3prop2: val4prop3: <unknown>id: foo");

    expect(getTextContent({
      target: { 
        id: "foo",
        prop: { 
          nestedProp: "nestedVal"
        },
      },
      displayFields: [ "prop.nestedProp"]
    })).toBe("prop.nestedProp: nestedValid: foo");
  });
});
