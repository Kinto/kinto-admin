import AdminLink from "./AdminLink";
import Spinner from "./Spinner";
import { SIDEBAR_MAX_LISTED_COLLECTIONS } from "@src/constants";
import { reloadBuckets, useBucketsCollectionsList } from "@src/hooks/bucket";
import {
  useSidebarFilter,
  useSidebarShowReadonly,
} from "@src/hooks/preferences";
import { useAuth, usePermissions, useServerInfo } from "@src/hooks/session";
import { canCreateBucket } from "@src/permission";
import type { BucketEntry, CollectionEntry, RouteParams } from "@src/types";
import url from "@src/url";
import * as React from "react";
import { Plus } from "react-bootstrap-icons";
import { XCircleFill } from "react-bootstrap-icons";
import { Folder2 } from "react-bootstrap-icons";
import { Folder2Open } from "react-bootstrap-icons";
import { Gear } from "react-bootstrap-icons";
import { Lock } from "react-bootstrap-icons";
import { Justify } from "react-bootstrap-icons";
import { ThreeDots } from "react-bootstrap-icons";
import { ArrowRepeat } from "react-bootstrap-icons";
import { useLocation, useParams } from "react-router";

interface SideBarLinkProps {
  currentPath: string;
  name: string;
  params: RouteParams;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

function SideBarLink(props: SideBarLinkProps) {
  const { currentPath, name, params, children, className, ...otherProps } =
    props;
  const targetUrl = url(name, params);
  const active = currentPath === targetUrl ? "active" : "";
  const classes =
    className ?? `list-group-item list-group-item-action ${active}`;

  return (
    <AdminLink {...otherProps} name={name} params={params} className={classes}>
      {children}
    </AdminLink>
  );
}

interface HomeMenuProps {
  currentPath: string;
}
const HomeMenu = ({ currentPath }: HomeMenuProps) => {
  const { bid } = useParams();
  const onHomePage = !bid; // if we do not have a bucket id, we are on the home page
  return (
    <div className="card home-menu">
      <div className="list-group list-group-flush">
        <SideBarLink
          name="home"
          currentPath={onHomePage ? "/" : currentPath}
          params={{}}
        >
          Home
          <ArrowRepeat onClick={() => reloadBuckets()} className="icon" />
        </SideBarLink>
      </div>
    </div>
  );
};

interface CollectionMenuEntryProps {
  bucket: BucketEntry;
  collection: CollectionEntry;
  currentPath: string;
  active: boolean;
}
function CollectionMenuEntry(props: CollectionMenuEntryProps) {
  const {
    bucket: { id: bid },
    collection,
    currentPath,
    active,
  } = props;
  const { id: cid } = collection;
  const classes = [
    "list-group-item",
    "collections-menu-entry",
    active ? "active" : "",
  ].join(" ");
  return (
    <div className={classes} data-testid="sidebar-menuEntry">
      <SideBarLink
        name="collection:records"
        params={{ bid, cid }}
        currentPath={currentPath}
        className=""
      >
        {collection.readonly ? (
          <Lock className="icon" />
        ) : (
          <Justify className="icon" />
        )}
        {cid}
      </SideBarLink>
      <SideBarLink
        name="collection:attributes"
        params={{ bid, cid }}
        currentPath={currentPath}
        className="collections-menu-entry-edit"
        title="Edit collection attributes"
      >
        <Gear className="icon" />
      </SideBarLink>
    </div>
  );
}

interface BucketCollectionsMenuProps {
  bucket: BucketEntry;
  collections: CollectionEntry[];
  currentPath: string;
  bid: string;
  cid: string;
  canCreateCollection: boolean;
}
function BucketCollectionsMenu(props: BucketCollectionsMenuProps) {
  const { currentPath, bucket, collections, bid, cid, canCreateCollection } =
    props;
  return (
    <div className="collections-menu list-group list-group-flush">
      {collections
        .sort((a, b) => (a.id > b.id ? 1 : -1))
        .slice(0, SIDEBAR_MAX_LISTED_COLLECTIONS)
        .map((collection, index) => {
          return (
            <CollectionMenuEntry
              key={index}
              currentPath={currentPath}
              active={bid === bucket.id && cid === collection.id}
              bucket={bucket}
              collection={collection}
            />
          );
        })}
      {collections.length > SIDEBAR_MAX_LISTED_COLLECTIONS && (
        <SideBarLink
          name="bucket:collections"
          params={{ bid: bucket.id }}
          currentPath={currentPath}
        >
          <ThreeDots className="icon" />
          See all collections
        </SideBarLink>
      )}
      {canCreateCollection && (
        <SideBarLink
          name="collection:create"
          params={{ bid: bucket.id }}
          currentPath={currentPath}
        >
          <Plus className="icon" />
          Create collection
        </SideBarLink>
      )}
    </div>
  );
}

interface BucketsMenuProps {
  currentPath: string;
  bid: string | null | undefined;
  cid: string | null | undefined;
}

function filterBuckets(buckets, filters): BucketEntry[] {
  if (!buckets) return [];
  const { showReadOnly, search, bid = null, cid = null } = filters;
  return buckets
    .slice(0)
    .reduce((acc, bucket) => {
      if (search == null || bucket.id.includes(search)) {
        return [...acc, bucket];
      } else if (bucket.collections.some(c => c.id.includes(search))) {
        return [
          ...acc,
          {
            ...bucket,
            collections: bucket.collections.filter(c => c.id.includes(search)),
          },
        ];
      } else {
        return acc;
      }
    }, [])
    .map(bucket => {
      if (showReadOnly) {
        return bucket;
      }
      const visibleCollections = bucket.collections.filter(
        c => !c.readonly || (bucket.id === bid && c.id === cid) // always return the current bucket/collection we're on
      );
      if (bucket.readonly && visibleCollections.length == 0) {
        return null;
      }
      return {
        ...bucket,
        collections: visibleCollections,
      };
    })
    .filter(Boolean);
}

const BucketsMenu = (props: BucketsMenuProps) => {
  const [showReadOnly, setShowReadOnly] = useSidebarShowReadonly();
  const [search, setSearch] = useSidebarFilter();
  const serverInfo = useServerInfo();
  const permissions = usePermissions();
  const buckets = useBucketsCollectionsList(
    permissions,
    serverInfo?.user?.bucket
  );
  const { currentPath, bid, cid } = props;

  const toggleReadOnly = () => {
    setShowReadOnly(!showReadOnly);
  };

  const resetSearch = event => {
    event.preventDefault();
    setSearch(null);
  };

  const updateSearch = event => {
    setSearch(event.target.value ?? null);
  };

  const filteredBuckets = filterBuckets(buckets, {
    showReadOnly,
    search,
    bid,
    cid,
  });
  // Sort buckets by id.
  const sortedBuckets = filteredBuckets.sort((a, b) => (a.id > b.id ? 1 : -1));
  return (
    <div>
      {canCreateBucket(permissions) && (
        <div className="card bucket-create">
          <div className="list-group list-group-flush">
            <SideBarLink
              name="bucket:create"
              currentPath={currentPath}
              params={{}}
            >
              <Plus className="icon" />
              Create bucket
            </SideBarLink>
          </div>
        </div>
      )}
      <div className="card sidebar-filters">
        <div className="card-header">
          <strong>Filters</strong>
        </div>
        <form className="form card-body">
          <div className="form-group">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Filter bucket/collection name"
                value={search || ""}
                onChange={updateSearch}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  onClick={resetSearch}
                >
                  <XCircleFill className="icon" />
                </button>
              </div>
            </div>
          </div>
          <div className="form-group form-check">
            <input
              className="form-check-input"
              id="read-only-toggle"
              type="checkbox"
              checked={showReadOnly}
              onChange={toggleReadOnly}
            />
            <label className="form-check-label" htmlFor="read-only-toggle">
              Show readonly buckets/collections
            </label>
          </div>
        </form>
      </div>
      {!permissions || !buckets ? (
        <Spinner />
      ) : (
        sortedBuckets.map((bucket, i) => {
          const { id, collections } = bucket;
          const current = bid === id;
          return (
            <div
              key={i}
              data-testid="sidebar-bucketMenu"
              className={`card panel-${
                current ? "info" : "default"
              } bucket-menu`}
            >
              <div className="card-header">
                {bucket.readonly ? (
                  <Lock className="icon" />
                ) : current ? (
                  <Folder2Open className="icon" />
                ) : (
                  <Folder2 className="icon" />
                )}
                <strong>{id}</strong> bucket
                <SideBarLink
                  name="bucket:attributes"
                  params={{ bid: id }}
                  currentPath={currentPath}
                  className="bucket-menu-entry-edit"
                  title="Manage bucket"
                >
                  <Gear className="icon" />
                </SideBarLink>
              </div>
              <BucketCollectionsMenu
                bucket={bucket}
                collections={collections}
                currentPath={currentPath}
                bid={bid}
                cid={cid}
                canCreateCollection={bucket.canCreateCollection}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export const Sidebar = () => {
  const auth = useAuth();
  const { bid, cid } = useParams();
  const { pathname } = useLocation();
  return (
    <div>
      <HomeMenu currentPath={pathname} />
      {auth !== undefined && (
        <BucketsMenu currentPath={pathname} bid={bid} cid={cid} />
      )}
    </div>
  );
};
