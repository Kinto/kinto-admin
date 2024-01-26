import CollectionTabs from "./CollectionTabs";
import RecordTable from "./RecordTable";
import { ListActions } from "./RecordTable";
import { CommonProps, CommonStateProps } from "./commonPropTypes";
import * as CollectionActions from "@src/actions/collection";
import * as RouteActions from "@src/actions/route";
import AdminLink from "@src/components/AdminLink";
import Spinner from "@src/components/Spinner";
import { storageKeys, useLocalStorage } from "@src/hooks/storage";
import type {
  BucketState,
  CollectionRouteMatch,
  CollectionState,
  SessionState,
} from "@src/types";
import React, { useCallback, useEffect } from "react";
import { Shuffle } from "react-bootstrap-icons";

type OwnProps = {
  match: CollectionRouteMatch;
  location: Location;
};

export type StateProps = CommonStateProps & {
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
};

type Props = CommonProps &
  OwnProps &
  StateProps & {
    deleteRecord: typeof CollectionActions.deleteRecord;
    listRecords: typeof CollectionActions.listRecords;
    listNextRecords: typeof CollectionActions.listNextRecords;
    redirectTo: typeof RouteActions.redirectTo;
  };

export default function CollectionRecords(props: Props) {
  const {
    match,
    session,
    bucket,
    collection,
    deleteRecord,
    listNextRecords,
    redirectTo,
    capabilities,
    listRecords,
  } = props;

  const {
    params: { bid, cid },
  } = match;

  const updateSort = useCallback(
    sort => {
      listRecords(bid, cid, sort);
    },
    [bid, cid, listRecords]
  );

  const {
    busy,
    data,
    currentSort,
    records,
    recordsLoaded,
    hasNextRecords,
    totalRecords,
  } = collection;
  const { schema, displayFields } = data;

  const [useSimpleReview, setUseSimpleReview] = useLocalStorage(
    storageKeys.useSimpleReview,
    true
  );
  useEffect(() => {
    if (!session.authenticated || !data?.last_modified) {
      return;
    }
    const { currentSort } = collection;
    listRecords(bid, cid, currentSort);
  }, [bid, cid, data.last_modified || 0]);

  const listActions = (
    <ListActions
      bid={bid}
      cid={cid}
      bucket={bucket}
      session={session}
      collection={collection}
    />
  );

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
        capabilities={capabilities}
        totalRecords={totalRecords}
      >
        {listActions}
        {busy ? (
          <Spinner />
        ) : (
          <RecordTable
            bid={bid}
            cid={cid}
            records={records}
            recordsLoaded={recordsLoaded}
            hasNextRecords={hasNextRecords}
            listNextRecords={listNextRecords}
            currentSort={currentSort}
            schema={schema || {}}
            displayFields={
              displayFields?.length ? displayFields : ["id", "__json"]
            }
            deleteRecord={deleteRecord}
            updateSort={updateSort}
            redirectTo={redirectTo}
            capabilities={capabilities}
          />
        )}
        {listActions}
        {capabilities.signer && !useSimpleReview && (
          <AdminLink
            className="btn btn-secondary"
            params={{ bid, cid }}
            name="collection:simple-review"
            onClick={() => {
              setUseSimpleReview(true);
            }}
            style={{
              float: "right",
              marginTop: "1.5em",
            }}
          >
            <Shuffle className="icon" /> Switch to Default Review UI
          </AdminLink>
        )}
      </CollectionTabs>
    </div>
  );
}
