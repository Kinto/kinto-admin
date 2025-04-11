import CollectionTabs from "./CollectionTabs";
import RecordTable from "./RecordTable";
import { ListActions } from "./RecordTable";
import { CommonProps, CommonStateProps } from "./commonPropTypes";
import * as CollectionActions from "@src/actions/collection";
import * as RouteActions from "@src/actions/route";
import AdminLink from "@src/components/AdminLink";
import Spinner from "@src/components/Spinner";
import { DEFAULT_SORT } from "@src/constants";
import { useRecords } from "@src/hooks/record";
import { storageKeys, useLocalStorage } from "@src/hooks/storage";
import type {
  BucketState,
  CollectionRouteMatch,
  CollectionState,
  SessionState,
} from "@src/types";
import React, { useState } from "react";
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
    redirectTo: typeof RouteActions.redirectTo;
  };

export default function CollectionRecords(props: Props) {
  const {
    match,
    session,
    bucket,
    collection,
    deleteRecord,
    redirectTo,
    capabilities,
  } = props;

  const {
    params: { bid, cid },
  } = match;

  const [sort, setSort] = useState(DEFAULT_SORT);
  const records = useRecords(bid, cid, sort);

  const { busy, data, totalRecords } = collection;
  const { schema, displayFields } = data;

  const [useSimpleReview, setUseSimpleReview] = useLocalStorage(
    storageKeys.useSimpleReview,
    true
  );

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
              marginTop: "0em",
            }}
          >
            <Shuffle className="icon" /> Switch to Default Review UI
          </AdminLink>
        )}
        {listActions}
        {busy ? (
          <Spinner />
        ) : (
          <RecordTable
            bid={bid}
            cid={cid}
            records={records.data || []}
            recordsLoaded={records.data !== undefined}
            hasNextRecords={records.hasNextPage}
            listNextRecords={records.next}
            currentSort={sort}
            schema={schema || {}}
            displayFields={
              displayFields?.length ? displayFields : ["id", "__json"]
            }
            deleteRecord={deleteRecord}
            updateSort={setSort}
            redirectTo={redirectTo}
            capabilities={capabilities}
          />
        )}
        {listActions}
      </CollectionTabs>
    </div>
  );
}
