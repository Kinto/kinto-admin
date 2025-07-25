import CollectionForm from "./CollectionForm";
import Spinner from "@src/components/Spinner";
import { useServerInfo } from "@src/hooks/session";
import React from "react";
import { useParams } from "react-router";

export default function CollectionCreate() {
  const { bid } = useParams();
  const serverInfo = useServerInfo();

  if (!serverInfo) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Create a new collection in <b>{bid}</b> bucket
      </h1>
      <div className="card">
        <div className="card-body">
          <CollectionForm />
        </div>
      </div>
    </div>
  );
}
