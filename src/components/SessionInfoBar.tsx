import * as SessionActions from "@src/actions/session";
import { getClient } from "@src/client";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import React, { useEffect, useState } from "react";
import {
  BoxArrowRight,
  CircleFill,
  Clipboard,
  ExclamationCircleFill,
  QuestionCircleFill,
} from "react-bootstrap-icons";

export function SessionInfoBar() {
  const { url, project_name, project_docs, user } = useAppSelector(
    store => store.session.serverInfo
  );
  const dispatch = useAppDispatch();
  const [isHealthy, setIsHealthy] = useState(true);
  const client = getClient();

  const checkHeartbeat = async () => {
    try {
      let response: Record<string, any> = await client.execute({
        path: "/__heartbeat__",
        headers: undefined,
      });
      for (let prop in response) {
        if (response[prop] === false) {
          setIsHealthy(false);
          return;
        }
      }
      setIsHealthy(true);
    } catch (ex) {
      setIsHealthy(false);
    } finally {
      setTimeout(checkHeartbeat, 60000);
    }
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
        <a href={`${url}__heartbeat__`} target="_blank">
          {isHealthy ? (
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
