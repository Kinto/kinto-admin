import DiffView from "@src/components/DiffView";
import { render, screen } from "@testing-library/react";

function addedLines() {
  return screen.queryAllByRole("insertion").map(el => el.textContent.trim());
}

function removedLines() {
  return screen.queryAllByRole("deletion").map(el => el.textContent.trim());
}

// creates an object { a: 1, b: 2, ..., o: 15 }
const record = Object.fromEntries(
  [..."abcdefghijklmno"].map((key, i) => [key, i + 1])
);

describe("DiffView", () => {
  describe("what counts as a change", () => {
    it("shows a changed value as a removed line and an added line", () => {
      render(
        <DiffView
          source={{ id: "r1", title: "old" }}
          target={{ id: "r1", title: "new" }}
        />
      );
      expect(removedLines()).toEqual(['"title": "old"']);
      expect(addedLines()).toEqual(['"title": "new"']);
    });

    it("shows every line as added when there is no source", () => {
      render(<DiffView target={{ id: "r1", title: "new" }} />);
      expect(removedLines()).toEqual([]);
      expect(addedLines()).toEqual(["{", '"id": "r1",', '"title": "new"', "}"]);
    });

    it("shows every line as removed when there is no target", () => {
      render(<DiffView source={{ id: "r1", title: "old" }} />);
      expect(removedLines()).toEqual([
        "{",
        '"id": "r1",',
        '"title": "old"',
        "}",
      ]);
      expect(addedLines()).toEqual([]);
    });

    it("ignores key order, including in nested objects", () => {
      render(
        <DiffView
          source={{ b: 1, a: { d: [{ f: 1, e: 2 }], c: 3 } }}
          target={{ a: { c: 3, d: [{ e: 2, f: 1 }] }, b: 1 }}
        />
      );
      expect(removedLines()).toEqual([]);
      expect(addedLines()).toEqual([]);
    });

    it("does not ignore array order", () => {
      render(
        <DiffView source={{ tags: ["x", "y"] }} target={{ tags: ["y", "x"] }} />
      );
      expect(removedLines()).not.toEqual([]);
      expect(addedLines()).not.toEqual([]);
    });

    it("also marks the previous line when a key is appended", () => {
      // The previous line gains a trailing comma.
      render(<DiffView source={{ a: 1 }} target={{ a: 1, b: 2 }} />);
      expect(removedLines()).toEqual(['"a": 1']);
      expect(addedLines()).toEqual(['"a": 1,', '"b": 2']);
    });

    it("diffs large collections line by line", () => {
      // With @codemirror/merge's default scan limit, a few scattered changes
      // in a collection this size come back as one big changed block.
      const records = Array.from({ length: 400 }, (_, i) => ({
        id: `record-${i}`,
        title: `title ${i}`,
      }));
      const changed = records.map((r, i) =>
        i % 100 === 0 ? { ...r, title: "changed" } : r
      );
      render(<DiffView source={records} target={changed} />);
      expect(removedLines()).toEqual([
        '"title": "title 0"',
        '"title": "title 100"',
        '"title": "title 200"',
        '"title": "title 300"',
      ]);
      expect(addedLines()).toEqual(Array(4).fill('"title": "changed"'));
    });
  });

  // Collapsed lines aren't in the DOM.
  describe("collapsing unchanged lines", () => {
    it("collapses unchanged lines away from a change", () => {
      render(<DiffView source={record} target={{ ...record, h: "changed" }} />);
      expect(screen.queryByText('"a": 1,')).not.toBeInTheDocument();
      expect(screen.getByText('"g": 7,')).toBeInTheDocument();
      expect(screen.getByText('"i": 9,')).toBeInTheDocument();
      expect(screen.queryByText('"o": 15')).not.toBeInTheDocument();
    });

    it("collapses unchanged lines between two changes", () => {
      render(
        <DiffView
          source={record}
          target={{ ...record, a: "changed", o: "changed" }}
        />
      );
      expect(screen.getByText('"b": 2,')).toBeInTheDocument();
      expect(screen.queryByText('"h": 8,')).not.toBeInTheDocument();
      expect(screen.getByText('"n": 14,')).toBeInTheDocument();
    });

    it("doesn't collapse a short run of unchanged lines", () => {
      const small = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      render(<DiffView source={small} target={{ ...small, c: "changed" }} />);
      expect(screen.getByText('"a": 1,')).toBeInTheDocument();
      expect(screen.getByText('"e": 5')).toBeInTheDocument();
    });

    it("never collapses changed lines", () => {
      render(<DiffView source={record} />);
      expect(removedLines()).toHaveLength(17);
    });
  });

  describe("allLines", () => {
    it("shows every line when set", () => {
      render(
        <DiffView
          source={record}
          target={{ ...record, h: "changed" }}
          allLines
        />
      );
      expect(screen.getByText('"a": 1,')).toBeInTheDocument();
      expect(screen.getByText('"o": 15')).toBeInTheDocument();
    });

    it("collapses and expands when toggled", () => {
      const target = { ...record, h: "changed" };
      const { rerender } = render(
        <DiffView source={record} target={target} allLines />
      );
      rerender(<DiffView source={record} target={target} />);
      expect(screen.queryByText('"a": 1,')).not.toBeInTheDocument();
      rerender(<DiffView source={record} target={target} allLines />);
      expect(screen.getByText('"a": 1,')).toBeInTheDocument();
    });
  });

  it("updates when source and target change", () => {
    const { rerender } = render(
      <DiffView source={{ title: "old" }} target={{ title: "new" }} />
    );
    rerender(<DiffView source={{ title: "a" }} target={{ title: "b" }} />);
    expect(removedLines()).toEqual(['"title": "a"']);
    expect(addedLines()).toEqual(['"title": "b"']);
  });
});
