import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";
import React from "react";
import { useParams } from "react-router";

export default function BucketAttributes() {
  const { bid } = useParams();

  return (
    <div>
      <h1>
        Edit <b>{bid}</b> bucket attributes
      </h1>
      <BucketTabs bid={bid} selected="attributes">
        <BucketForm />
      </BucketTabs>
    </div>
  );
}
