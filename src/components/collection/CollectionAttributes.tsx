import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";
import React from "react";
import { useParams } from "react-router";

export default function CollectionAttributes() {
  const { bid, cid } = useParams();

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}
        </b>{" "}
        collection attributes
      </h1>
      <CollectionTabs bid={bid} cid={cid} selected="attributes">
        <CollectionForm />
      </CollectionTabs>
    </div>
  );
}
