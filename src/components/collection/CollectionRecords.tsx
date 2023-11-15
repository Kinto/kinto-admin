import React, { useEffect, useCallback } from "react";

import type {
  CollectionRouteMatch,
  SessionState,
  BucketState,
  CollectionState,
} from "../../types";

import CollectionTabs from "./CollectionTabs";
import Spinner from "../Spinner";
import RecordTable from "./RecordTable";
import { ListActions } from "./RecordTable";
import { CommonProps, CommonStateProps } from "./commonPropTypes";

import * as CollectionActions from "../../actions/collection";
import * as RouteActions from "../../actions/route";

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
      </CollectionTabs>
    </div>
  );
}
