import Spinner from "../Spinner";
import HomePageTabs from "./HomePageTabs";
import { useServerInfo } from "@src/hooks/session";
import { isObject } from "@src/utils";
import * as React from "react";

function ServerProps({ node }: { node: any }) {
  const nodes = Array.isArray(node)
    ? node.map((n, i) => [i, n])
    : Object.keys(node).map(key => [key, node[key]]);
  return (
    <table className="table table-condensed">
      <tbody>
        {nodes.map(([key, childNode], i) => {
          return (
            <tr key={i}>
              <th data-testid="home-th">{key}</th>
              <td style={{ width: "100%" }}>
                {isObject(childNode) || Array.isArray(childNode) ? (
                  <ServerProps node={childNode} />
                ) : typeof childNode === "string" &&
                  childNode.startsWith("http") ? (
                  <a href={childNode} target="_blank" rel="noreferrer">
                    {childNode}
                  </a>
                ) : (
                  String(childNode)
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SessionInfo() {
  const serverInfo = useServerInfo();
  if (!serverInfo) {
    return (
      <div>
        <div className="alert alert-info">Fetching server information...</div>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="card server-info-panel">
        <div className="card-header">
          <b>Properties</b>
        </div>
        <div className="card-body">
          <ServerProps node={serverInfo} />
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const serverInfo = useServerInfo();

  return (
    <div>
      <h1>{`${serverInfo?.project_name ?? "Kinto"} Administration`}</h1>
      <HomePageTabs selected="serverinfo">
        <SessionInfo />
      </HomePageTabs>
    </div>
  );
}
