import CollectionTabs from "./CollectionTabs";
import RecordTable from "./RecordTable";
import { ListActions } from "./RecordTable";
import { CommonProps, CommonStateProps } from "./commonPropTypes";
import AdminLink from "@src/components/AdminLink";
import Spinner from "@src/components/Spinner";
import { DEFAULT_SORT } from "@src/constants";
import { useAppSelector } from "@src/hooks/app";
import { useCollection } from "@src/hooks/collection";
import { useRecordList } from "@src/hooks/record";
import { storageKeys, useLocalStorage } from "@src/hooks/storage";
import React, { useEffect, useState } from "react";
import { Shuffle } from "react-bootstrap-icons";
import { useParams } from "react-router";

export default function CollectionRecords() {
  const session = useAppSelector(state => state.session);
  const { bid, cid } = useParams();
  const [sort, setSort] = useState(null);
  const collection = useCollection(bid, cid);
  const [cacheVal, setCacheVal] = useState(0);

  const [useSimpleReview, setUseSimpleReview] = useLocalStorage(
    storageKeys.useSimpleReview,
    true
  );

  useEffect(() => {
    if (!session.authenticated || !collection?.last_modified) {
      return;
    }
    setSort(collection.sort || DEFAULT_SORT);
  }, [bid, cid, collection?.last_modified || 0]);

  const records = useRecordList(bid, cid, sort, false, cacheVal);

  const listActions = <ListActions session={session} collection={collection} />;

  return (
    <div className="list-page">
      <h1>
        Records of{" "}
        <b>
          {bid}/{cid}
        </b>
      </h1>
      <CollectionTabs
        bid={bid}
        cid={cid}
        selected="records"
        capabilities={session.serverInfo.capabilities}
        totalRecords={records?.totalRecords}
      >
        {session.serverInfo.capabilities.signer && !useSimpleReview && (
          <AdminLink
            className="btn btn-secondary"
            params={{ bid, cid }}
            name="collection:simple-review"
            onClick={() => {
              setUseSimpleReview(true);
            }}
            style={{
              float: "right",
              marginTop: "0em",
            }}
          >
            <Shuffle className="icon" /> Switch to Default Review UI
          </AdminLink>
        )}
        {listActions}
        {!collection?.id || !records.data ? (
          <Spinner />
        ) : (
          <RecordTable
            bid={bid}
            cid={cid}
            records={records.data || []}
            recordsLoaded={!!records.data}
            hasNextRecords={records.hasNextPage}
            listNextRecords={records.next}
            currentSort={sort}
            schema={collection?.schema || {}}
            displayFields={
              collection?.displayFields?.length
                ? collection.displayFields
                : ["id", "__json"]
            }
            updateSort={setSort}
            capabilities={session.serverInfo.capabilities}
            callback={() => {
              setCacheVal(cacheVal + 1);
            }}
          />
        )}
        {listActions}
      </CollectionTabs>
    </div>
  );
}
