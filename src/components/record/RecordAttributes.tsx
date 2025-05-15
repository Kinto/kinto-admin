import RecordForm from "./RecordForm";
import RecordTabs from "./RecordTabs";
import React from "react";
import { useParams } from "react-router";

export default function RecordAttributes() {
  const { bid, cid, rid } = useParams();

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}/{rid}
        </b>{" "}
        record attributes
      </h1>
      <RecordTabs bid={bid} cid={cid} rid={rid} selected="attributes">
        <RecordForm />
      </RecordTabs>
    </div>
  );
}
