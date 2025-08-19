import Spinner from "../Spinner";
import PerRecordDiffView from "../signoff/SimpleReview/PerRecordDiffView";
import CollectionTabs from "./CollectionTabs";
import { useBucketList } from "@src/hooks/bucket";
import { useCollectionList } from "@src/hooks/collection";
import { useRecordList, useRecordListAt } from "@src/hooks/record";
import { useServerInfo } from "@src/hooks/session";
import { hasHistoryDisabled } from "@src/utils";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";

const JANUARY_2015 = 1420070400000;

export function CollectionCompare() {
  const { bid, cid } = useParams();
  const [params, _] = useSearchParams();
  const target = params.get("target");
  const [targetBucket, targetCollectionAndTimestamp] = target?.split("/") || [];
  const [targetCollection, targetTimestampStr] =
    targetCollectionAndTimestamp?.split("@") || [];

  const [selectedBucket, setSelectedBucket] = useState(targetBucket);
  const [selectedCollection, setSelectedCollection] =
    useState(targetCollection);
  const hasAutoSelected = useRef(false);

  // Some collections have history disabled.
  const serverInfo = useServerInfo();
  const historyDisabled = hasHistoryDisabled(
    serverInfo,
    selectedBucket,
    selectedCollection
  );

  // Read timestamp from URL and set it as if user enter a raw string.
  const [selectedTimestampStr, setSelectedTimestampStr] = useState(
    historyDisabled ? "" : targetTimestampStr || ""
  );

  const bucketsList = useBucketList();
  // Check that selectedBucket is valid.
  if (
    bucketsList &&
    selectedBucket &&
    !bucketsList.find(b => b.id === selectedBucket)
  ) {
    setSelectedBucket("");
    setSelectedCollection("");
  }

  const collectionsList = useCollectionList(selectedBucket);
  // Check that selectedCollection is valid.
  if (
    collectionsList &&
    selectedCollection &&
    !collectionsList.data?.find(c => c.id === selectedCollection)
  ) {
    setSelectedCollection("");
  }

  // Auto-select same collection if bucket is different than current.
  useEffect(() => {
    if (
      !hasAutoSelected.current &&
      !selectedCollection &&
      selectedBucket &&
      selectedBucket !== bid &&
      collectionsList?.data.find(c => c.id === cid)
    ) {
      setSelectedCollection(cid);
      // We use a flag to avoid interferring with the user selection.
      hasAutoSelected.current = true;
    }
  }, [bid, cid, selectedBucket, collectionsList, selectedCollection]);

  // Parse selected timestamp. If not correct ignore it.
  const selectedTimestampInt = selectedTimestampStr
    ? parseInt(selectedTimestampStr.replace('"', ""), 10)
    : undefined;
  const invalidTimestamp =
    selectedTimestampStr &&
    (isNaN(selectedTimestampInt) ||
      selectedTimestampInt < JANUARY_2015 ||
      selectedTimestampInt > Date.now());
  const selectedTimestamp = invalidTimestamp ? undefined : selectedTimestampInt;

  function onTimestampChange(timestampStr) {
    setSelectedTimestampStr(timestampStr);
  }

  useEffect(() => {
    // Refresh location bar with params for users to copy and share.
    if (!bid || !cid || !selectedBucket || !selectedCollection) return;
    const baseUrl = window.location.toString().split("?")[0];
    window.history.replaceState(
      null,
      "",
      baseUrl +
        `?target=${selectedBucket}/${selectedCollection}${selectedTimestamp ? `@${selectedTimestamp}` : ""}`
    );
  }, [bid, cid, selectedBucket, selectedCollection, selectedTimestampStr]);

  // Fetch record lists for comparison
  const leftRecords = useRecordList(bid, cid, "id");
  const rightRecords = useRecordListAt(
    selectedBucket,
    selectedCollection,
    "id",
    selectedTimestamp
  );

  const recordsLoading =
    selectedBucket &&
    selectedCollection &&
    (!leftRecords?.data || !rightRecords?.data);

  function onBucketChange(bucketId) {
    setSelectedBucket(bucketId);
    setSelectedCollection("");
  }

  return (
    <div>
      <h1>
        Compare{" "}
        <b>
          {bid}/{cid}
        </b>{" "}
        records
      </h1>
      <CollectionTabs bid={bid} cid={cid} selected="compare">
        <div className="d-flex justify-content-center align-items-center mb-4">
          <span>With</span>

          {/* Bucket Select */}
          <div className="input-group mx-2" style={{ maxWidth: "220px" }}>
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="bucketSelect">
                Bucket
              </label>
            </div>
            <select
              id="bucketSelect"
              className="custom-select"
              value={selectedBucket}
              onChange={e => onBucketChange(e.target.value)}
              disabled={!bucketsList || recordsLoading}
            >
              {!bucketsList ? (
                <option value="">⏳ Loading...</option>
              ) : (
                <>
                  <option value="">Select...</option>
                  {bucketsList
                    ?.sort(({ id: a }, { id: b }) => a.localeCompare(b))
                    .map(({ id }) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>

          {/* Collection Select */}
          <div className="input-group mx-2" style={{ maxWidth: "240px" }}>
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="collectionSelect">
                Collection
              </label>
            </div>
            <select
              id="collectionSelect"
              className="custom-select"
              value={selectedCollection}
              onChange={e => setSelectedCollection(e.target.value)}
              disabled={!selectedBucket || recordsLoading}
            >
              {selectedBucket && !collectionsList ? (
                <option value="">⏳ Loading...</option>
              ) : (
                <>
                  <option value="">Select...</option>
                  {collectionsList?.data
                    .sort(({ id: a }, { id: b }) => a.localeCompare(b))
                    .map(({ id }) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>
          <span>at</span>
          <div className="input-group mx-2" style={{ maxWidth: "150px" }}>
            <input
              data-testid="timestampSelect"
              type="text"
              className={`form-control ${invalidTimestamp ? "is-invalid" : ""}`}
              value={selectedTimestampStr}
              onChange={e => onTimestampChange(e.target.value)}
              placeholder="latest"
              disabled={
                !selectedBucket || !selectedCollection || historyDisabled
              }
              title={
                historyDisabled ? "History is disabled for this collection" : ""
              }
            />
          </div>
          <span>timestamp</span>
        </div>
        {!selectedBucket || !selectedCollection ? (
          <div className="text-center my-4 text-muted">
            Pick a bucket and collection to compare with.
          </div>
        ) : recordsLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner />
          </div>
        ) : (
          <>
            {leftRecords.totalRecords == 0 && rightRecords.totalRecords == 0 ? (
              <div className="text-center my-4 text-muted">
                No records to compare.
              </div>
            ) : (
              <PerRecordDiffView
                newRecords={leftRecords.data}
                oldRecords={rightRecords.data}
              />
            )}
          </>
        )}
      </CollectionTabs>
    </div>
  );
}
