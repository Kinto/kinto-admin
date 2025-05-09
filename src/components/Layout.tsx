import Breadcrumbs from "./Breadcrumbs";
import { SessionInfoBar } from "./SessionInfoBar";
import { HomePage } from "@src/components/HomePage";
import Notifications from "@src/components/Notifications";
import { Sidebar } from "@src/components/Sidebar";
import { BucketPermissions } from "@src/components/bucket/BucketPermissions";
import CollectionHistory from "@src/components/collection/CollectionHistory";
import { CollectionPermissions } from "@src/components/collection/CollectionPermissions";
import CollectionRecords from "@src/components/collection/CollectionRecords";
import { GroupPermissions } from "@src/components/group/GroupPermissions";
import RecordAttributes from "@src/components/record/RecordAttributes";
import RecordBulk from "@src/components/record/RecordBulk";
import RecordCreate from "@src/components/record/RecordCreate";
import { RecordPermissions } from "@src/components/record/RecordPermissions";
import BucketAttributesPage from "@src/containers/bucket/BucketAttributesPage";
import BucketCollectionsPage from "@src/containers/bucket/BucketCollectionsPage";
import BucketCreatePage from "@src/containers/bucket/BucketCreatePage";
import BucketGroupsPage from "@src/containers/bucket/BucketGroupsPage";
import BucketHistoryPage from "@src/containers/bucket/BucketHistoryPage";
import CollectionAttributesPage from "@src/containers/collection/CollectionAttributesPage";
import CollectionCreatePage from "@src/containers/collection/CollectionCreatePage";
import GroupAttributesPage from "@src/containers/group/GroupAttributesPage";
import GroupCreatePage from "@src/containers/group/GroupCreatePage";
import GroupHistoryPage from "@src/containers/group/GroupHistoryPage";
import RecordHistoryPage from "@src/containers/record/RecordHistoryPage";
import SimpleReviewPage from "@src/containers/signoff/SimpleReviewPage";
import { useAppSelector } from "@src/hooks/app";
import * as React from "react";
import { Navigate, Route, Routes } from "react-router";

export function Layout() {
  const authenticated = useAppSelector(store => store.session.authenticated);
  const contentClasses = `col-sm-9 content`;
  const version = KINTO_ADMIN_VERSION;

  if (!authenticated) {
    return (
      <div className="container-fluid main">
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
          <div className="col-sm-3 sidebar">
            <Routes>
              <Route
                path="/buckets?/:bid?/collections?/:cid?/*"
                Component={Sidebar}
              />
            </Routes>
          </div>
          <div className={contentClasses}>
            <Notifications />
            <Breadcrumbs separator=" / " />
            <Routes>
              <Route path="/" Component={HomePage} />
              <Route path="/auth/:payload/:token" Component={HomePage} />
              {/* /buckets */}
              <Route path="/buckets" element={<Navigate to="/" replace />} />
              <Route path="/buckets/create" Component={BucketCreatePage} />
              <Route path="/buckets/:bid/groups" Component={BucketGroupsPage} />
              <Route
                path="/buckets/:bid/groups/create"
                Component={GroupCreatePage}
              />
              <Route
                path="/buckets/:bid/groups/:gid/attributes?"
                Component={GroupAttributesPage}
              />
              <Route
                path="/buckets/:bid/groups/:gid/permissions"
                Component={GroupPermissions}
              />
              <Route
                path="/buckets/:bid/groups/:gid/history"
                Component={GroupHistoryPage}
              />
              <Route
                path="/buckets/:bid/attributes"
                Component={BucketAttributesPage}
              />
              <Route
                path="/buckets/:bid/permissions"
                Component={BucketPermissions}
              />
              <Route
                path="/buckets/:bid/history"
                Component={BucketHistoryPage}
              />
              <Route
                path="/buckets/:bid/collections?"
                Component={BucketCollectionsPage}
              />
              <Route
                path="/buckets/:bid/collections/create"
                Component={CollectionCreatePage}
              />
              <Route
                path="/buckets/:bid/collections/:cid/attributes"
                Component={CollectionAttributesPage}
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
                Component={SimpleReviewPage}
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
                Component={RecordHistoryPage}
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
