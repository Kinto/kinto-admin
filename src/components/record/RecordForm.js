import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";
import filesize from "filesize";

import Spinner from "../Spinner";
import JSONRecordForm from "../JSONRecordForm";
import { canCreateRecord, canEditRecord } from "../../permission";
import { cleanRecord, linkify } from "../../utils";


export function extendSchemaWithAttachment(schema, attachment, edit=false) {
  if (!attachment.enabled) {
    return schema;
  }
  const schemaRequired = schema.required || [];
  const required = attachment.required && !edit ?
                   schemaRequired.concat("__attachment__") :
                   schemaRequired;
  return {
    ...schema,
    required,
    properties: {
      ...schema.properties,
      __attachment__: {
        type: "string",
        format: "data-url",
        title: "File attachment",
      }
    }
  };
}

export function extendUiSchemaWithAttachment(uiSchema, attachment) {
  if (!attachment.enabled || !uiSchema.hasOwnProperty("ui:order")) {
    return uiSchema;
  }
  return {
    ...uiSchema,
    "ui:order": [...uiSchema["ui:order"], "__attachment__"]
  };
}

export function extendUiSchemaWhenDisabled(uiSchema, disabled) {
  return {...uiSchema, "ui:disabled": disabled};
}

function AttachmentPreview({attachment}) {
  const {mimetype, location} = attachment;
  if (mimetype.startsWith("image/")) {
    return (
      <div className="attachment-img">
        <a href={location} target="_blank"><img src={location} /></a>
      </div>
    );
  }
  return null;
}

function AttachmentInfo(props) {
  const {record, attachmentRequired, deleteAttachment} = props;
  const {data} = record;
  const {attachment} = data;
  if (!attachment) {
    return null;
  }
  return (
    <div className="panel panel-default attachment-info">
      <div className="panel-heading">
        <i className="glyphicon glyphicon-paperclip"/>
        <b>Attachment information</b>
      </div>
      <div className="panel-body">
        {!attachmentRequired ? null :
          <div className="alert alert-warning">
            <p>
              An attachment is required for records in this collection. To
              replace current attachment, use the <i>File attachment</i> field
              below.
            </p>
          </div>}
        <AttachmentPreview attachment={attachment} />
        <table className="table table-condensed">
          <tbody>
            <tr>
              <th>Location</th>
              <td>{linkify(attachment.location)}</td>
            </tr>
            <tr>
              <th>Filename</th>
              <td>{attachment.filename}</td>
            </tr>
            <tr>
              <th>Size</th>
              <td>{filesize(attachment.size)}</td>
            </tr>
            <tr>
              <th>Hash</th>
              <td>{attachment.hash}</td>
            </tr>
            <tr>
              <th>Mime-Type</th>
              <td>{attachment.mimetype}</td>
            </tr>
          </tbody>
        </table>
        {attachmentRequired ? null :
          <p className="text-right attachment-action">
            <input type="button" onClick={deleteAttachment}
              className="btn btn-danger" value="Delete this attachment"/>
          </p>}
      </div>
    </div>
  );
}

export default class RecordForm extends Component {
  constructor(props) {
    super(props);
    this.state = {asJSON: false};
  }

  onSubmit = ({formData}) => {
    this.props.onSubmit(formData);
  }

  get allowEditing() {
    const {session, collection, record} = this.props;
    if (record) {
      return canEditRecord(session, record);
    } else {
      return canCreateRecord(session, collection);
    }
  }

  deleteRecord = () => {
    const {deleteRecord, bid, cid, rid} = this.props;
    if (confirm("Are you sure?")) {
      deleteRecord(bid, cid, rid);
    }
  }

  getForm() {
    const {asJSON} = this.state;
    const {bid, cid, collection, record} = this.props;
    const {schema={}, uiSchema={}, attachment={}, busy} = collection;
    const recordData = record && record.data || {};
    const emptySchema = Object.keys(schema).length === 0;

    if (busy) {
      return <Spinner />;
    }

    const buttons = (
      <div className="row">
        <div className="col-sm-6">
          <input type="submit" className="btn btn-primary"
            disabled={!this.allowEditing} value={record ? "Update" : "Create"} />
          {" or "}
          <Link to={`/buckets/${bid}/collections/${cid}/records`}>Cancel</Link>
          {" | "}
          <a href="#" onClick={this.toggleJSON}>
            {asJSON ? "Edit form" : "Edit raw JSON"}
          </a>
        </div>
        <div className="col-sm-6 text-right">
          {this.allowEditing && record ?
            <button type="button" className="btn btn-danger"
                    onClick={this.deleteRecord}>
              Delete record
            </button> : null}
        </div>
      </div>
    );

    if (asJSON || emptySchema) {
      return (
        <div>
          {emptySchema ?
            <div className="alert alert-warning">
              This collection doesn't have any JSON schema defined, though you can
              create free-form records entering raw JSON.
            </div> : null}
          <JSONRecordForm
            disabled={!this.allowEditing}
            record={JSON.stringify(cleanRecord(recordData), null, 2)}
            onSubmit={this.onSubmit}>
            {buttons}
          </JSONRecordForm>
        </div>
      );
    }

    const _schema = extendSchemaWithAttachment(schema, attachment, !!record);
    let _uiSchema = extendUiSchemaWithAttachment(uiSchema, attachment);
    _uiSchema = extendUiSchemaWhenDisabled(_uiSchema, !this.allowEditing);

    return (
      <Form
        schema={_schema}
        uiSchema={_uiSchema}
        formData={cleanRecord(recordData)}
        onSubmit={this.onSubmit}>
        {buttons}
      </Form>
    );
  }

  deleteAttachment = () => {
    const {bid, cid, rid, deleteAttachment} = this.props;
    deleteAttachment(bid, cid, rid);
  }

  toggleJSON = (event) => {
    event.preventDefault();
    this.setState({asJSON: !this.state.asJSON});
  }

  render() {
    const {collection, record} = this.props;
    const {attachment={}} = collection;
    const creation = !record;

    const alert = this.allowEditing || collection.busy ? null : (
      <div className="alert alert-warning">
        You don't have the required permission to
        {creation ? " create a" : " edit this"} record.
      </div>
    );


    return (
      <div className="panel panel-default">
        <div className="panel-body">
          {alert}
          {creation ? null :
            <AttachmentInfo
              record={record}
              attachmentRequired={attachment.required}
              deleteAttachment={this.deleteAttachment} />}
          {this.getForm()}
        </div>
      </div>
    );
  }
}
