import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";
import { useAppSelector } from "@src/hooks/app";
import type { Capabilities, RecordRouteMatch, SessionState } from "@src/types";
import React from "react";
import { useParams } from "react-router";

export type OwnProps = {
  match: RecordRouteMatch;
};

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export type Props = OwnProps & StateProps;

export default function RecordAttributes() {
  const { bid, cid, rid } = useParams();
  const session = useAppSelector(state => state.session);

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>{" "}
        record attributes
      </h1>
      <RecordTabs
        bid={bid}
        cid={cid}
        rid={rid}
        selected="attributes"
        capabilities={session.serverInfo.capabilities}
      >
        <RecordForm
          session={session}
          capabilities={session.serverInfo.capabilities}
        />
      </RecordTabs>
    </div>
  );
}
