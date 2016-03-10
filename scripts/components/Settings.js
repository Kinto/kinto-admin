import React, { Component } from "react";
import Form from "react-jsonschema-form";
import BusyIndicator from "./BusyIndicator";

const settingsSchema = {
  type: "object",
  title: "Settings",
  required: ["server", "bucket"],
  properties: {
    server:   {title: "Server", type: "string"},
    bucket:   {title: "Bucket", type: "string"},
    username: {title: "Username", type: "string"},
    password: {title: "Password", type: "string"},
  }
};

class ServerInfo extends Component {
  componentDidMount() {
    this.props.loadServerInfo(this.props.server);
  }

  render() {
    const { serverInfo } = this.props;
    return (
      <div className="server-info">
        <h3>Server information</h3>
        {Object.keys(serverInfo).length > 0 ?
          <pre>{JSON.stringify(serverInfo, null, 2)}</pre> :
          <div>Loading<BusyIndicator /></div>}
      </div>
    );
  }
}

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saved: false,
      formData: this.props.settings
    };
  }

  onChange({formData}) {
    this.props.resetServerInfo();
    this.setState({saved: false, formData});
  }

  onSave({formData}) {
    this.props.clearNotifications();
    this.props.saveSettings(formData);
    this.setState({saved: true});
  }

  render() {
    const { serverInfo, loadServerInfo } = this.props;
    const { formData } = this.state;
    return (
      <div>
        <h1>Settings</h1>
        <Form
          schema={settingsSchema}
          formData={formData}
          onChange={this.onChange.bind(this)}
          onSubmit={this.onSave.bind(this)} />
        {!this.state.saved ? null :
          <ServerInfo
            serverInfo={serverInfo}
            server={this.state.formData.server}
            loadServerInfo={loadServerInfo} />}
      </div>
    );
  }
}
