import React from "react";

import * as CollectionActions from "../../actions/collection";
import Spinner from "../Spinner";
import RecordTabs from "./RecordTabs";
import PermissionsForm from "../PermissionsForm";
import { canEditRecord } from "../../permission";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { useAppSelector } from "../../hooks";

interface RouteParams {
  bid: string;
  cid: string;
  rid: string;
}
export const RecordPermissions = () => {
  const bucket = useAppSelector(state => state.bucket);
  const session = useAppSelector(state => state.session);
  const collection = useAppSelector(state => state.collection);
  const record = useAppSelector(state => state.record);
  const dispatch = useDispatch();
  const { bid, cid, rid } = useParams<RouteParams>();

  const onSubmit = ({ formData }: { formData: any }) => {
    dispatch(
      CollectionActions.updateRecord(bid, cid, rid, { permissions: formData })
    );
  };
  const { groups } = bucket;
  const { busy, permissions } = record;
  const acls = ["read", "write"];
  if (busy) {
    return <Spinner />;
  }
  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>{" "}
        record permissions
      </h1>
      <RecordTabs
        bid={bid}
        cid={cid}
        rid={rid}
        capabilities={session.serverInfo.capabilities}
        selected="permissions"
      >
        <PermissionsForm
          bid={bid}
          groups={groups}
          permissions={permissions}
          acls={acls}
          readonly={!canEditRecord(session, bucket, collection, record)}
          onSubmit={onSubmit}
        />
      </RecordTabs>
    </div>
  );
};
