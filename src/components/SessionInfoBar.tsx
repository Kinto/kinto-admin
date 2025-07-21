import Spinner from "./Spinner";
import { getAuthHeader } from "@src/client";
import { useHeartbeat } from "@src/hooks/heartbeat";
import { notifySuccess } from "@src/hooks/notifications";
import { logout, useAuth, useServerInfo } from "@src/hooks/session";
import { copyToClipboard } from "@src/utils";
import React from "react";
import {
  BoxArrowRight,
  CircleFill,
  Clipboard,
  ExclamationCircleFill,
  QuestionCircleFill,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router";

export function SessionInfoBar() {
  const navigate = useNavigate();
  const auth = useAuth();
  const heartbeat = useHeartbeat();
  const serverInfo = useServerInfo();

  if (!serverInfo) {
    return <Spinner />;
  }
  const { url, project_name, project_docs, user } = serverInfo;

  const copyAuthenticationHeader = async () => {
    if (!auth) {
      return;
    }
    const authHeader = getAuthHeader(auth);
    await copyToClipboard(authHeader);
    notifySuccess("Header copied to clipboard");
  };

  return (
    <div className="session-info-bar" data-testid="sessionInfo-bar">
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
        {user?.id && (
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
        )}
        <a href={`${url}__heartbeat__`} target="_blank" rel="noreferrer">
          {heartbeat.success !== false ? (
            <CircleFill
              color="green"
              title="Server heartbeat status is healthy"
            />
          ) : (
            <ExclamationCircleFill
              color="red"
              title="Server heartbeat status IS NOT healthy"
            />
          )}
        </a>
        <a
          href={project_docs}
          target="_blank"
          rel="noreferrer"
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
            navigate("/");
          }}
        >
          <BoxArrowRight className="icon" /> Logout
        </a>
      </span>
    </div>
  );
}
