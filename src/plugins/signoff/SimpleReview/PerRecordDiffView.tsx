import React, { useState } from "react";
import { omit, diffJson } from "../../../utils";
import type { ValidRecord } from "../../../types";
import { diffArrays, diffJson as diff } from "diff";
import { SourceInfo } from "../types";

export enum ChangeType {
  ADD = "add",
  REMOVE = "remove",
  UPDATE = "update",
  EMPTY_UPDATE = "empty_update",
}

export const EXTRA_FIELDS = ["last_modified", "schema"];

export interface PerRecordDiffViewProps {
  oldRecords: ValidRecord[];
  newRecords: ValidRecord[];
  collectionData: SourceInfo;
}

export default function PerRecordDiffView({
  oldRecords,
  newRecords,
  collectionData,
}: PerRecordDiffViewProps) {
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [showAllLines, setShowAllLines] = useState(false);
  const changes = findChangeTypes(
    oldRecords,
    newRecords,
    showExtraFields ? undefined : EXTRA_FIELDS
  );

  switch (collectionData.status) {
    case "to-review":
    case "work-in-progress":
      return (
        <div>
          <div className="form-check form-check-inline mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showExtraFields}
              onChange={e => setShowExtraFields(e.currentTarget.checked)}
              id="showExtraFields"
            />
            <label className="form-check-label" htmlFor="showExtraFields">
              Show record timestamps
            </label>
          </div>

          <div className="form-check form-check-inline mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={showAllLines}
              onChange={e => setShowAllLines(e.currentTarget.checked)}
              id="showAllLines"
            />
            <label className="form-check-label" htmlFor="showAllLines">
              Show all lines
            </label>
          </div>

          {changes.map(({ id, changeType, source, target }) => (
            <Diff
              key={id}
              id={id}
              changeType={changeType}
              source={source}
              target={target}
              allLines={showAllLines}
            />
          ))}
        </div>
      );
    default:
      return (
        <>
          No changes to review, collection status is{" "}
          <code>{collectionData.status}</code>.
        </>
      );
  }
}

function Diff({
  id,
  changeType,
  source,
  target,
  className = "",
  allLines = false,
}: {
  id: string;
  changeType: ChangeType;
  source?: ValidRecord;
  target?: ValidRecord;
  className?: string;
  allLines?: boolean;
}) {
  let diff: string[];

  if (source && !target) {
    diff = JSON.stringify(source, null, 2)
      .split("\n")
      .map(line => `- ${line}`);
  } else if (target && !source) {
    diff = JSON.stringify(target, null, 2)
      .split("\n")
      .map(line => `+ ${line}`);
  } else {
    diff = diffJson(source, target, allLines ? "all" : undefined);
  }

  return (
    <div className={`record-diff card mb-4 ${className}`}>
      <div className="card-header">
        <DiffLabel changeType={changeType} /> {id}
      </div>
      <div className="card-body p-0">
        <pre className="json-record json-record-simple-review mb-0">
          {diff.map((chunk: string, i) => {
            const className = chunk.startsWith("+")
              ? "added"
              : chunk.startsWith("-")
              ? "removed"
              : "";
            return (
              <div key={i} className={className}>
                <code>{chunk}</code>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

function DiffLabel({ changeType }: { changeType: ChangeType }) {
  switch (changeType) {
    case ChangeType.ADD:
      return <span className={"text-success"}>+++</span>;
    case ChangeType.REMOVE:
      return <span className={"text-danger"}>---</span>;
    case ChangeType.UPDATE:
      return (
        <>
          <span className={"text-success"}>++</span>
          <span className={"text-danger"}>--</span>
        </>
      );
    case ChangeType.EMPTY_UPDATE:
      return <span className={"text-secondary"}>[unchanged]</span>;
  }
}

function recordsAreDifferent(a: ValidRecord, b: ValidRecord): boolean {
  return diff(a, b).filter(chunk => chunk.added || chunk.removed).length > 0;
}

interface RecordChange {
  id: string;
  source?: ValidRecord;
  target?: ValidRecord;
  changeType: ChangeType;
}

export function findChangeTypes(
  oldItems: Array<ValidRecord>,
  newItems: Array<ValidRecord>,
  fieldsToOmit?: Array<string>
): Array<RecordChange> {
  if (fieldsToOmit) {
    oldItems = oldItems.map(r => omit(r, fieldsToOmit));
    newItems = newItems.map(r => omit(r, fieldsToOmit));
  }

  let result: Array<RecordChange> = [];

  diffArrays(
    oldItems.map(r => r.id).sort(),
    newItems.map(r => r.id).sort()
  ).forEach(part => {
    const id = part.value[0];
    if (part.added) {
      result.push({
        id,
        target: newItems.find(r => r.id === id),
        changeType: ChangeType.ADD,
      });
    } else if (part.removed) {
      result.push({
        id,
        source: oldItems.find(r => r.id === id),
        changeType: ChangeType.REMOVE,
      });
    }
  });

  newItems.forEach(item => {
    const matchingOldItem = oldItems.find(r => r.id === item.id);

    if (!matchingOldItem) {
      return;
    }

    const hasChanges = recordsAreDifferent(matchingOldItem, item);
    const hasChangesWithoutExtraFields = item.last_modified
      ? recordsAreDifferent(
          omit(matchingOldItem, EXTRA_FIELDS),
          omit(item, EXTRA_FIELDS)
        )
      : hasChanges;

    if (hasChanges && !hasChangesWithoutExtraFields) {
      result.push({
        id: item.id,
        source: matchingOldItem,
        target: item,
        changeType: ChangeType.EMPTY_UPDATE,
      });
    } else if (hasChanges) {
      result.push({
        id: item.id,
        source: matchingOldItem,
        target: item,
        changeType: ChangeType.UPDATE,
      });
    }
  });

  return result.sort((a, b) => (a.id > b.id ? 1 : -1));
}
