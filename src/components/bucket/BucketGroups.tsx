import BucketTabs from "./BucketTabs";
import { DataList, ListActions } from "./GroupDataList";
import { useGroupList } from "@src/hooks/group";
import React from "react";
import { useParams } from "react-router";

export default function BucketGroups() {
  const { bid } = useParams();
  const groups = useGroupList(bid);

  const listActions = <ListActions bid={bid} busy={!groups} />;

  return (
    <div className="list-page">
      <h1>
        Groups of <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="groups">
        {listActions}
        {groups && groups.length === 0 ? (
          <div className="alert alert-info">
            <p>This bucket has no groups.</p>
          </div>
        ) : (
          <DataList bid={bid} groups={groups} showSpinner={!groups} />
        )}
        {listActions}
      </BucketTabs>
    </div>
  );
}
