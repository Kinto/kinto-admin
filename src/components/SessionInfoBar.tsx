import * as HeartbeatActions from "@src/actions/heartbeat";
import * as SessionActions from "@src/actions/session";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import React, { useEffect } from "react";
import {
  BoxArrowRight,
  CircleFill,
  Clipboard,
  ExclamationCircleFill,
  QuestionCircleFill,
} from "react-bootstrap-icons";

export function SessionInfoBar() {
  const { heartbeat, url, project_name, project_docs, user } = useAppSelector(
    store => {
      return {
        ...store.session.serverInfo,
        heartbeat: store.heartbeat,
      };
    }
  );
  const dispatch = useAppDispatch();

  const checkHeartbeat = async () => {
    dispatch(HeartbeatActions.heartbeatRequest());
    setTimeout(checkHeartbeat, 60000);
  };

  useEffect(() => {
    checkHeartbeat();
  }, []);

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
              dispatch(SessionActions.copyAuthenticationHeader());
            }}
          >
            <Clipboard className="icon" />
          </a>
        )}
        <a href={`${url}__heartbeat__`} target="_blank">
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
}
