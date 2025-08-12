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
  const [loadingBuckets, setLoadingBuckets] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const hasAutoSelected = useRef(false);

  const bucketsList = useBucketList();
  useEffect(() => {
    if (bucketsList) {
      setLoadingBuckets(false);
    }
  }, [bucketsList]);

  const foundBucket = bucketsList?.find(({ id }) => id === selectedBucket);

  // Safety check to reset selected bucket if it's no longer found (should not happen)
  useEffect(() => {
    if (bucketsList && selectedBucket && !foundBucket) {
      setSelectedBucket("");
    }
  }, [bucketsList, selectedBucket, foundBucket]);

  // Fetch collections for the selected bucket
  const collectionsList = useCollectionList(selectedBucket);
  useEffect(() => {
    if (collectionsList) {
      setLoadingCollections(false);
    }
  }, [collectionsList]);

  // Reset `loadingRecords` state when bucket/collection is changed
  useEffect(() => {
    setLoadingRecords(true);
  }, [selectedBucket, selectedCollection]);

  // Auto-select same collection if bucket is different than current.
  useEffect(() => {
    if (
      !hasAutoSelected.current &&
      !selectedCollection &&
      foundBucket &&
      foundBucket.id !== bid &&
      collectionsList?.data.find(c => c.id === cid)
    ) {
      setSelectedCollection(cid);
      hasAutoSelected.current = true;
    }
  }, [foundBucket, collectionsList, selectedCollection, cid, bid]);

  // Fetch record lists for comparison
  const leftRecords = useRecordList(bid, cid, "id");
  const rightRecords = useRecordList(selectedBucket, selectedCollection, "id");

  // Wait for both record lists to load
  useEffect(() => {
    if (leftRecords.data && rightRecords.data) {
      setLoadingRecords(false);
    }
  }, [leftRecords.data, rightRecords.data]);

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
