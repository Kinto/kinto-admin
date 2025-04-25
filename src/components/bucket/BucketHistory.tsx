import BucketTabs from "./BucketTabs";
import * as BucketActions from "@src/actions/bucket";
import HistoryTable from "@src/components/HistoryTable";
import { useBucketHistory } from "@src/hooks/bucket";
import type { Capabilities, SessionState } from "@src/types";
import React from "react";
import { useParams } from "react-router";

export type StateProps = {
  capabilities: Capabilities;
  session: SessionState;
};

type Props = StateProps & {
  listBucketHistory: typeof BucketActions.listBucketHistory;
  listBucketNextHistory: typeof BucketActions.listBucketNextHistory;
};

export default function BucketHistory(props: Props) {
  const { bid } = useParams();
  const history = useBucketHistory(bid);

  const { capabilities, listBucketNextHistory } = props;

  return (
    <div>
      <h1>
        History for <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="history" capabilities={capabilities}>
        <HistoryTable
          bid={bid}
          historyLoaded={!!history.data}
          history={history.data || []}
          hasNextHistory={history.hasNextPage}
          listNextHistory={history.next}
        />
      </BucketTabs>
    </div>
  );
}
