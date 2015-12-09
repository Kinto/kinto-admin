import React, { Component } from "react";
import GenericForm from "./GenericForm";
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
    this.state = {saved: false, serverToTest: null};
  }

  onChange({formData}) {
    this.props.resetServerInfo();
    this.setState({saved: false, serverToTest: formData.server});
  }

  onSave({formData}) {
    this.props.clearNotifications();
    this.props.saveSettings(formData);
    this.setState({saved: true, serverToTest: formData.server});
  }

  render() {
    const { settings, serverInfo, loadServerInfo } = this.props;
    return (
      <div>
        <h1>Settings</h1>
        <GenericForm
          schema={settingsSchema}
          formData={Object.keys(settings).length ? settings : null}
          onChange={this.onChange.bind(this)}
          onSubmit={this.onSave.bind(this)} />
        {!this.state.saved ? null :
          <ServerInfo
            serverInfo={serverInfo}
            server={this.state.serverToTest || settings.server}
            loadServerInfo={loadServerInfo} />}
      </div>
    );
  }
}
