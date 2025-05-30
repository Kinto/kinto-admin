import RecordForm from "./RecordForm";
import React from "react";
import { useParams } from "react-router";

export default function RecordCreate() {
  const { bid, cid } = useParams();

  return (
    <div>
      <h1>
        Add a new record in{" "}
        <b>
          {bid}/{cid}
        </b>
      </h1>
      <div className="card">
        <div className="card-body">
          <RecordForm />
        </div>
      </div>
    </div>
  );
}
