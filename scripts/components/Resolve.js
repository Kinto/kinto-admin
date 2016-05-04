import React from "react";


function NotFound(props) {
  return (
    <div>
      <h1>No pending conflict found</h1>
      <p>Please resynchronize the <em>{props.collection}</em> collection.</p>
    </div>
  );
}

function VersionPicker(props) {
  const {heading, type, record, pick} = props;
  return (
    <div className="panel panel-default">
      <div className="panel-heading">{heading}</div>
      <div className="panel-body">
        <pre className="json-record">{JSON.stringify(record, null, 2)}</pre>
      </div>
      <div className="panel-footer text-center">
        <button type="button" className="btn btn-success"
          onClick={() => pick(record)}>Pick {type} version</button>
      </div>
    </div>
  );
}

export default function Resolve(props) {
  const {params, conflicts} = props;
  const conflict = conflicts[params.id];

  if (!conflict) {
    return <NotFound collection={params.name} />;
  }

  const {type, local, remote} = conflict;
  return (
    <div>
      <h1>Resolve {type} conflict</h1>
      <div className="row">
        <div className="col-sm-6">
          <VersionPicker heading="Local" type="local" record={local}
            pick={(record) => props.resolve(conflict, record)} />
        </div>
        <div className="col-sm-6">
          <VersionPicker heading="Remote" type="remote" record={remote}
            pick={(record) => props.resolve(conflict, record)} />
        </div>
      </div>
    </div>
  );
}
