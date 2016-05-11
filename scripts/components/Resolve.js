import React, { Component } from "react";
import { diffJson } from "diff";
import stringify from "json-stable-stringify";


function NotFound(props) {
  return (
    <div>
      <h1>No pending conflict found</h1>
      <p>Please resynchronize the <em>{props.collection}</em> collection.</p>
    </div>
  );
}

class VersionPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {diff: false};
  }

  showDiff = (event) => {
    event.preventDefault();
    this.setState({diff: true});
  }

  hideDiff = (event) => {
    event.preventDefault();
    this.setState({diff: false});
  }

  render() {
    const {heading, type, record, compare, pick} = this.props;
    const {diff} = this.state;
    return (
      <div className={`panel panel-default picker-${type}`}>
        <div className="panel-heading">{heading}</div>
        <div className="panel-body">{
          diff ?
            <DiffView source={record} target={compare} /> :
            <pre className="json-record">{
              stringify(record, {space: "  "})
            }</pre>
        }</div>
        <div className="panel-footer text-center">
          <div className="btn-group">
            <button type="button" className="btn btn-success btn-pick"
              onClick={() => pick(record)}>Pick {type} version</button>
            {diff ?
              <button className="btn btn-info btn-diff"
                onClick={this.hideDiff}>Hide diff</button> :
              <button className="btn btn-info btn-diff"
                onClick={this.showDiff}>Show diff</button>}
          </div>
        </div>
      </div>
    );
  }
}

function DiffView({source, target}) {
  const diff = diffJson(target, source);
  return (
    <pre className="json-record">{
      diff.map((chunk, i) => {
        const color = chunk.added ? "green" : chunk.removed ? "red" : "inherit";
        const prefixedChunk = chunk.value.split("\n")
          .filter(part => part !== "")
          .map((part) => {
            const prefix = chunk.added ? "+ " : chunk.removed ? "- " : "  ";
            return prefix + part;
          })
          .join("\n");
        return (
          <div key={i}>
            <code style={{color}}>{prefixedChunk}</code>
          </div>
        );
      })
    }</pre>
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
          <VersionPicker
            heading="Local"
            type="local"
            record={local}
            compare={remote}
            pick={(record) => props.resolve(conflict, record)} />
        </div>
        <div className="col-sm-6">
          <VersionPicker
            heading="Remote"
            type="remote"
            record={remote}
            compare={local}
            pick={(record) => props.resolve(conflict, record)} />
        </div>
      </div>
    </div>
  );
}
