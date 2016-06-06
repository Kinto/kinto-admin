import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";
import filesize from "filesize";

import Spinner from "./Spinner";
import JSONRecordForm from "./JSONRecordForm";
import { linkify } from "../utils";


export function extendSchemaWithAttachment(schema, attachment) {
  if (!attachment.enabled) {
    return schema;
  }
  const schemaRequired = schema.required || [];
  const required = attachment.required ?
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
  const {attachment} = record;
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
  onSubmit = ({formData}) => {
    this.props.onSubmit(formData);
  }

  getForm() {
    const {bid, cid, collection, record} = this.props;
    const {schema={}, uiSchema={}, attachment={}, busy} = collection;

    if (busy) {
      return <Spinner />;
    }

    const buttons = (
      <div>
        <input type="submit" className="btn btn-primary"
          value={record ? "Update" : "Create"} />
        {" or "}
        <Link to={`/buckets/${bid}/collections/${cid}`}>Cancel</Link>
      </div>
    );

    if (Object.keys(schema).length === 0) {
      return (
        <JSONRecordForm
          record={JSON.stringify(record, null, 2)}
          onSubmit={this.onSubmit}>
          {buttons}
        </JSONRecordForm>
      );
    }

    return (
      <Form
        schema={extendSchemaWithAttachment(schema, attachment)}
        uiSchema={extendUiSchemaWithAttachment(uiSchema, attachment)}
        formData={record}
        onSubmit={this.onSubmit}>
        {buttons}
      </Form>
    );
  }

  deleteAttachment = () => {
    const {bid, cid, rid, deleteAttachment} = this.props;
    deleteAttachment(bid, cid, rid);
  }

  render() {
    const {record, collection} = this.props;
    const {attachment={}} = collection;
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          {!record ? null :
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
