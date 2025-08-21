import CollectionTabs from "./CollectionTabs";
import RecordTable from "./RecordTable";
import { ListActions } from "./RecordTable";
import Spinner from "@src/components/Spinner";
import { DEFAULT_SORT } from "@src/constants";
import { useCollection } from "@src/hooks/collection";
import { useRecordList } from "@src/hooks/record";
import { useServerInfo } from "@src/hooks/session";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function CollectionRecords() {
  const serverInfo = useServerInfo();
  const { bid, cid } = useParams();
  const [sort, setSort] = useState(null);
  const [cacheVal, setCacheVal] = useState(0);
  const collection = useCollection(bid, cid, cacheVal);
  const records = useRecordList(bid, cid, sort, false, cacheVal);

  useEffect(() => {
    if (!serverInfo || !collection?.last_modified) {
      return;
    }
    setSort(collection.sort ?? DEFAULT_SORT);
  }, [bid, cid, collection?.last_modified ?? 0]);

  const listActions = (
    <ListActions
      serverInfo={serverInfo}
      collection={collection}
      callback={() => {
        setCacheVal(cacheVal + 1);
      }}
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
        totalRecords={records?.totalRecords}
      >
        {listActions}
        {!collection?.id || !records.data ? (
          <Spinner />
        ) : (
          <RecordTable
            bid={bid}
            cid={cid}
            records={records.data ?? []}
            recordsLoaded={!!records.data}
            hasNextRecords={records.hasNextPage}
            listNextRecords={records.next}
            currentSort={sort}
            schema={collection?.schema ?? {}}
            displayFields={
              collection?.displayFields?.length
                ? collection.displayFields
                : ["id", "__json"]
            }
            updateSort={setSort}
            capabilities={serverInfo?.capabilities}
            callback={() => {
              setCacheVal(cacheVal + 1);
            }}
          />
        )}
        {
          records.data?.length > 10
            ? listActions
            : null /* Show actions in bottom only if there are more than 10 records */
        }
      </CollectionTabs>
    </div>
  );
}
