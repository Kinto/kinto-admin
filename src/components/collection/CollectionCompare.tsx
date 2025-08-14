import Spinner from "../Spinner";
import PerRecordDiffView from "../signoff/SimpleReview/PerRecordDiffView";
import CollectionTabs from "./CollectionTabs";
import { useBucketList } from "@src/hooks/bucket";
import { useCollectionList } from "@src/hooks/collection";
import { useRecordList } from "@src/hooks/record";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

export function CollectionCompare() {
  const { bid, cid } = useParams();

  const [selectedBucket, setSelectedBucket] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const hasAutoSelected = useRef(false);

  const bucketsList = useBucketList();
  const loadingBuckets = bucketsList === undefined;

  // Fetch collections for the selected bucket
  const collectionsList = useCollectionList(selectedBucket);
  const loadingCollections = collectionsList === undefined;

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

  // Fetch record lists for comparison
  const leftRecords = useRecordList(bid, cid, "id");
  const rightRecords = useRecordList(selectedBucket, selectedCollection, "id");
  const loadingRecords = leftRecords === undefined || rightRecords == undefined;

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
          <span className="mr-2">With</span>

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
              disabled={loadingBuckets}
            >
              {loadingBuckets ? (
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
              disabled={!selectedBucket}
            >
              {loadingCollections && selectedBucket ? (
                <option value="">⏳ Loading...</option>
              ) : (
                <>
                  <option value="">Select...</option>
                  {collectionsList?.data
                    .sort(({ id: a }, { id: b }) => a.localeCompare(b))
                    .map(({ id }) => (
                      <option
                        key={id}
                        value={id}
                        disabled={selectedBucket === bid && id === cid}
                      >
                        {id}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>
        </div>
        {selectedBucket &&
          selectedCollection &&
          (loadingRecords ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner />
            </div>
          ) : (
            <>
              {!leftRecords.data?.length && !rightRecords.data?.length ? (
                <div className="text-center my-4 text-muted">
                  No records to compare.
                </div>
              ) : (
                <PerRecordDiffView
                  newRecords={leftRecords.data || []}
                  oldRecords={rightRecords.data || []}
                />
              )}
            </>
          ))}
      </CollectionTabs>
    </div>
  );
}
