import * as React from "react";
import { BoxArrowRight } from "react-bootstrap-icons";
import { QuestionCircleFill } from "react-bootstrap-icons";
import { Clipboard } from "react-bootstrap-icons";

function UserInfo({ session }) {
  const {
    serverInfo: { user = {} },
  } = session;
  if (!user.id) {
    return <strong>Anonymous</strong>;
  }
  return (
    <span>
      Connected as <strong>{user.id}</strong>
    </span>
  );
}

export function SessionInfoBar({ session, logout, copyAuthenticationHeader }) {
  const {
    serverInfo: { url, project_name, project_docs },
  } = session;
  return (
    <div className="session-info-bar">
      <h1 className="kinto-admin-title">{project_name}</h1>
      <span className="user-info">
        <UserInfo session={session} />
        {" on "}
        <strong>{url}</strong>{" "}
        <a
          href=""
          className="btn btn-sm btn-link"
          title="Copy authentication header"
          onClick={event => {
            event.preventDefault();
            copyAuthenticationHeader();
          }}
        >
          <Clipboard className="icon" />
        </a>
        <a
          href={project_docs}
          target="_blank"
          className="spaced btn btn-sm btn-secondary project-docs"
        >
          <QuestionCircleFill className="icon" /> Documentation
        </a>
        <a
          href=""
          className="spaced btn btn-sm btn-success btn-logout"
          onClick={event => {
            event.preventDefault();
            logout();
          }}
        >
          <BoxArrowRight className="icon" /> Logout
        </a>
      </span>
    </div>
  );
}
