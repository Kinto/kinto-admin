import * as React from "react";
import { BoxArrowRight } from "react-bootstrap-icons";
import { QuestionCircleFill } from "react-bootstrap-icons";
import { Clipboard } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks";
import * as SessionActions from "../actions/session";

export const SessionInfoBar = () => {
  const { url, project_name, project_docs, user } = useAppSelector(
    store => store.session.serverInfo
  );
  const dispatch = useDispatch();
  return (
    <div className="session-info-bar">
      <h1 className="kinto-admin-title">{project_name}</h1>
      <span className="user-info">
        {!user?.id ? (
          <strong>Anonymous</strong>
        ) : (
          <span>
            Connected as <strong>{user.id}</strong>
          </span>
        )}
        {" on "}
        <strong>{url}</strong>{" "}
        <a
          href=""
          className="btn btn-sm btn-link"
          title="Copy authentication header"
          onClick={event => {
            event.preventDefault();
            dispatch(SessionActions.copyAuthenticationHeader());
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
            dispatch(SessionActions.logout());
          }}
        >
          <BoxArrowRight className="icon" /> Logout
        </a>
      </span>
    </div>
  );
};
