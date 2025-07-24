import Breadcrumbs from "./Breadcrumbs";
import { SessionInfoBar } from "./SessionInfoBar";
import { HomePage } from "@src/components/HomePage";
import Notifications from "@src/components/Notifications";
import { Sidebar } from "@src/components/Sidebar";
import BucketAttributes from "@src/components/bucket/BucketAttributes";
import BucketCollections from "@src/components/bucket/BucketCollections";
import BucketCreate from "@src/components/bucket/BucketCreate";
import BucketGroups from "@src/components/bucket/BucketGroups";
import BucketHistory from "@src/components/bucket/BucketHistory";
import { BucketPermissions } from "@src/components/bucket/BucketPermissions";
import CollectionAttributes from "@src/components/collection/CollectionAttributes";
import CollectionCreate from "@src/components/collection/CollectionCreate";
import CollectionHistory from "@src/components/collection/CollectionHistory";
import { CollectionPermissions } from "@src/components/collection/CollectionPermissions";
import CollectionRecords from "@src/components/collection/CollectionRecords";
import GroupAttributes from "@src/components/group/GroupAttributes";
import GroupCreate from "@src/components/group/GroupCreate";
import GroupHistory from "@src/components/group/GroupHistory";
import { GroupPermissions } from "@src/components/group/GroupPermissions";
import RecordAttributes from "@src/components/record/RecordAttributes";
import RecordBulk from "@src/components/record/RecordBulk";
import RecordCreate from "@src/components/record/RecordCreate";
import RecordHistory from "@src/components/record/RecordHistory";
import { RecordPermissions } from "@src/components/record/RecordPermissions";
import SimpleReview from "@src/components/signoff/SimpleReview";
import { usePreferences } from "@src/hooks/preferences";
import { useServerInfo } from "@src/hooks/session";
import * as React from "react";
import { LayoutSidebar, LayoutSidebarInset } from "react-bootstrap-icons";
import { Navigate, Route, Routes } from "react-router";

export function Layout() {
  const serverInfo = useServerInfo();

  const [preferences, setPreferences] = usePreferences();
  const { showSidebar } = preferences;

  const toggleSideBar = () => {
    setPreferences({ ...preferences, showSidebar: !preferences.showSidebar });
  };

  const contentClasses = `col-sm-${showSidebar ? 9 : 12} content`;
  const version = KINTO_ADMIN_VERSION;

  if (!serverInfo) {
    return (
      <div className="container-fluid main">
        <Notifications />
        <div className="row">
          <div className="col-sm-3 sidebar"></div>
          <div className={contentClasses}>
            <Routes>
              <Route path="/auth/:payload/:token" Component={HomePage} />
              <Route path="/*" Component={HomePage} />
            </Routes>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SessionInfoBar />
      <div className="container-fluid main">
        <div className="row">
          {showSidebar ? (
            <div className="col-sm-3 sidebar">
              <Routes>
                <Route
                  path="/buckets?/:bid?/collections?/:cid?/*"
                  Component={Sidebar}
                />
              </Routes>
            </div>
          ) : null}
          <div className={contentClasses}>
            <Notifications />
            <button className={"btn toggle-sidebar"} onClick={toggleSideBar}>
              {showSidebar ? (
                <LayoutSidebar className="icon" />
              ) : (
                <LayoutSidebarInset className="icon" />
              )}
            </button>
            <Breadcrumbs separator=" / " />
            <Routes>
              <Route path="/" Component={HomePage} />
              <Route path="/auth/:payload/:token" Component={HomePage} />
              {/* /buckets */}
              <Route path="/buckets" element={<Navigate to="/" replace />} />
              <Route path="/buckets/create" Component={BucketCreate} />
              <Route path="/buckets/:bid/groups" Component={BucketGroups} />
              <Route
                path="/buckets/:bid/groups/create"
                Component={GroupCreate}
              />
              <Route
                path="/buckets/:bid/groups/:gid/attributes?"
                Component={GroupAttributes}
              />
              <Route
                path="/buckets/:bid/groups/:gid/permissions"
                Component={GroupPermissions}
              />
              <Route
                path="/buckets/:bid/groups/:gid/history"
                Component={GroupHistory}
              />
              <Route
                path="/buckets/:bid/attributes"
                Component={BucketAttributes}
              />
              <Route
                path="/buckets/:bid/permissions"
                Component={BucketPermissions}
              />
              <Route path="/buckets/:bid/history" Component={BucketHistory} />
              <Route
                path="/buckets/:bid/collections?"
                Component={BucketCollections}
              />
              <Route
                path="/buckets/:bid/collections/create"
                Component={CollectionCreate}
              />
              <Route
                path="/buckets/:bid/collections/:cid/attributes"
                Component={CollectionAttributes}
              />
              <Route
                path="/buckets/:bid/collections/:cid/permissions"
                Component={CollectionPermissions}
              />
              <Route
                path="/buckets/:bid/collections/:cid/history"
                Component={CollectionHistory}
              />
              <Route
                path="/buckets/:bid/collections/:cid/simple-review"
                Component={SimpleReview}
              />
              <Route
                path="/buckets/:bid/collections/:cid/records?"
                Component={CollectionRecords}
              />
              <Route
                path="/buckets/:bid/collections/:cid/records/create"
                Component={RecordCreate}
              />
              <Route
                path="/buckets/:bid/collections/:cid/records/bulk"
                Component={RecordBulk}
              />
              <Route
                path="/buckets/:bid/collections/:cid/records/:rid/attributes?"
                Component={RecordAttributes}
              />
              <Route
                path="/buckets/:bid/collections/:cid/records/:rid/permissions"
                Component={RecordPermissions}
              />
              <Route
                path="/buckets/:bid/collections/:cid/records/:rid/history"
                Component={RecordHistory}
              />
              <Route path="*" Component={_ => <h1>Page not found.</h1>} />
            </Routes>
          </div>
        </div>
        <hr />
        <p className="text-center">
          <a href="https://github.com/Kinto/kinto-admin">
            Powered by kinto-admin
          </a>
          {!version ? null : (
            <span>
              &nbsp;v
              <a
                href={`https://github.com/Kinto/kinto-admin/releases/tag/v${version}`}
              >
                {version}
              </a>
            </span>
          )}
          .
        </p>
      </div>
    </div>
  );
}
