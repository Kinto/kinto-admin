import React, { Component } from "react";
import { diffJson } from "diff";
import stringify from "json-stable-stringify";


function NotFound(props) {
  return (
    <div>
      <h1>No pending conflict found</h1>
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
    const {heading, type, content, compare, pick} = this.props;
    const {diff} = this.state;
    return (
      <div className={`panel panel-default picker-${type}`}>
        <div className="panel-heading">{heading}</div>
        <div className="panel-body">{
          diff ?
            <DiffView source={content} target={compare} /> :
            <pre className="json-record">{
              stringify(content, {space: "  "})
            }</pre>
        }</div>
        <div className="panel-footer text-center">
          <div className="btn-group">
            <button type="button" className="btn btn-success btn-pick"
              onClick={() => pick(content)}>Pick {type} version</button>
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

export default function ConflictPage(props) {
  const {params, conflict} = props;

  if (!conflict) {
    return <NotFound />;
  }

  const {local, remote} = conflict;
  return (
    <div>
      <h1>Resolve conflict</h1>
      <div className="row">
        <div className="col-sm-6">
          <VersionPicker
            heading="Local"
            type="local"
            record={local}
            compare={remote}
            pick={(content) => props.resolve(conflict, content)} />
        </div>
        <div className="col-sm-6">
          <VersionPicker
            heading="Remote"
            type="remote"
            record={remote}
            compare={local}
            pick={(content) => props.resolve(conflict, content)} />
        </div>
      </div>
    </div>
  );
}
