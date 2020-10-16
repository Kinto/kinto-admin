/* @flow */
import type {
  SessionState,
  SettingsState,
  RouteParams,
  BucketEntry,
} from "../types";
import type { Location, Match } from "react-router-dom";

import { PureComponent } from "react";
import * as React from "react";

import { ReactComponent as PlusIcon } from "bootstrap-icons/icons/plus.svg";
import { ReactComponent as XCircleFillIcon } from "bootstrap-icons/icons/x-circle-fill.svg";
import { ReactComponent as Folder2Icon } from "bootstrap-icons/icons/folder2.svg";
import { ReactComponent as Folder2OpenIcon } from "bootstrap-icons/icons/folder2-open.svg";
import { ReactComponent as GearIcon } from "bootstrap-icons/icons/gear.svg";
import { ReactComponent as LockIcon } from "bootstrap-icons/icons/lock.svg";
import { ReactComponent as JustifyIcon } from "bootstrap-icons/icons/justify.svg";
import { ReactComponent as ThreeDotsIcon } from "bootstrap-icons/icons/three-dots.svg";
import { ReactComponent as ArrowRepeatIcon } from "bootstrap-icons/icons/arrow-repeat.svg";

import * as SessionActions from "../actions/session";
import Spinner from "./Spinner";
import AdminLink from "./AdminLink";
import url from "../url";
import { canCreateBucket } from "../permission";

type SideBarLinkProps = {
  currentPath: string,
  name: string,
  params: RouteParams,
  children: React.Node,
  className?: string,
};

function SideBarLink(props: SideBarLinkProps) {
  const {
    currentPath,
    name,
    params,
    children,
    className,
    ...otherProps
  } = props;
  const targetUrl = url(name, params);
  const active = currentPath === targetUrl ? "active" : "";
  const classes =
    className !== undefined
      ? className
      : `list-group-item list-group-item-action ${active}`;

  return (
    <AdminLink {...otherProps} name={name} params={params} className={classes}>
      {children}
    </AdminLink>
  );
}

function HomeMenu(props) {
  const { currentPath, onRefresh } = props;
  return (
    <div className="card home-menu">
      <div className="list-group list-group-flush">
        <SideBarLink name="home" currentPath={currentPath} params={{}}>
          Home
          <ArrowRepeatIcon onClick={onRefresh} className="icon" />
        </SideBarLink>
      </div>
    </div>
  );
}

function CollectionMenuEntry(props) {
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
    <div className={classes}>
      <SideBarLink
        name="collection:records"
        params={{ bid, cid }}
        currentPath={currentPath}
        className="">
        {collection.readonly ? (
          <LockIcon className="icon" />
        ) : (
          <JustifyIcon className="icon" />
        )}
        {cid}
      </SideBarLink>
      <SideBarLink
        name="collection:attributes"
        params={{ bid, cid }}
        currentPath={currentPath}
        className="collections-menu-entry-edit"
        title="Edit collection attributes">
        <GearIcon className="icon" />
      </SideBarLink>
    </div>
  );
}

function BucketCollectionsMenu(props) {
  const {
    currentPath,
    bucket,
    collections,
    bid,
    cid,
    sidebarMaxListedCollections,
    canCreateCollection,
  } = props;
  // Sort collections by id.
  const sortedCollections = collections.sort((a, b) => (a.id > b.id ? 1 : -1));
  // collections always contains one more item than what's configured in
  // sidebarMaxListedCollections, so we can render a link to the paginated list
  // of collections. Still, we only want to list that configured number of
  // collections for this bucket menu.
  const slicedCollections =
    sidebarMaxListedCollections !== null
      ? sortedCollections.slice(0, sidebarMaxListedCollections)
      : sortedCollections;
  return (
    <div className="collections-menu list-group list-group-flush">
      {slicedCollections.map((collection, index) => {
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
      {sidebarMaxListedCollections != null &&
        collections.length > sidebarMaxListedCollections && (
          <SideBarLink
            name="bucket:collections"
            params={{ bid: bucket.id }}
            currentPath={currentPath}>
            <ThreeDotsIcon className="icon" />
            See all collections
          </SideBarLink>
        )}
      {canCreateCollection && (
        <SideBarLink
          name="collection:create"
          params={{ bid: bucket.id }}
          currentPath={currentPath}>
          <PlusIcon className="icon" />
          Create collection
        </SideBarLink>
      )}
    </div>
  );
}

type BucketsMenuProps = {
  canCreateBucket: boolean,
  currentPath: string,
  busy: boolean,
  buckets: BucketEntry[],
  bid: ?string,
  cid: ?string,
  sidebarMaxListedCollections: ?number,
};

function filterBuckets(buckets, filters): BucketEntry[] {
  const { showReadOnly, search } = filters;
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
      const writableCollections = bucket.collections.filter(c => !c.readonly);
      if (bucket.readonly && writableCollections.length == 0) {
        return null;
      }
      return {
        ...bucket,
        collections: writableCollections,
      };
    })
    .filter(Boolean);
}

type BucketsMenuState = {
  showReadOnly: boolean,
  search: ?string,
};

class BucketsMenu extends PureComponent<BucketsMenuProps, BucketsMenuState> {
  constructor(props: BucketsMenuProps) {
    super(props);
    this.state = { showReadOnly: false, search: null };
  }

  toggleReadOnly = () => {
    this.setState({ showReadOnly: !this.state.showReadOnly });
  };

  resetSearch = event => {
    event.preventDefault();
    this.setState({ search: null });
  };

  updateSearch = event => {
    this.setState({ search: event.target.value || null });
  };

  render() {
    const {
      canCreateBucket,
      currentPath,
      busy,
      buckets,
      bid,
      cid,
      sidebarMaxListedCollections,
    } = this.props;
    const filteredBuckets = filterBuckets(buckets, this.state);
    // Sort buckets by id.
    const sortedBuckets = filteredBuckets.sort((a, b) =>
      a.id > b.id ? 1 : -1
    );
    return (
      <div>
        {canCreateBucket && (
          <div className="card bucket-create">
            <div className="list-group list-group-flush">
              <SideBarLink
                name="bucket:create"
                currentPath={currentPath}
                params={{}}>
                <PlusIcon className="icon" />
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
                  value={this.state.search || ""}
                  onChange={this.updateSearch}
                />
                <div className="input-group-append">
                  <button
                    href=""
                    className="btn btn-outline-secondary"
                    onClick={this.resetSearch}>
                    <XCircleFillIcon className="icon" />
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group form-check">
              <input
                className="form-check-input"
                id="read-only-toggle"
                type="checkbox"
                value={this.state.showReadOnly}
                onChange={this.toggleReadOnly}
              />
              <label className="form-check-label" htmlFor="read-only-toggle">
                Show readonly buckets/collections
              </label>
            </div>
          </form>
        </div>
        {busy ? (
          <Spinner />
        ) : (
          sortedBuckets.map((bucket, i) => {
            const { id, collections } = bucket;
            const current = bid === id;
            return (
              <div
                key={i}
                className={`card panel-${
                  current ? "info" : "default"
                } bucket-menu`}>
                <div className="card-header">
                  {bucket.readonly ? (
                    <LockIcon className="icon" />
                  ) : current ? (
                    <Folder2OpenIcon className="icon" />
                  ) : (
                    <Folder2Icon className="icon" />
                  )}
                  <strong>{id}</strong> bucket
                  <SideBarLink
                    name="bucket:attributes"
                    params={{ bid: id }}
                    currentPath={currentPath}
                    className="bucket-menu-entry-edit"
                    title="Manage bucket">
                    <GearIcon className="icon" />
                  </SideBarLink>
                </div>
                <BucketCollectionsMenu
                  bucket={bucket}
                  collections={collections}
                  currentPath={currentPath}
                  bid={bid}
                  cid={cid}
                  sidebarMaxListedCollections={sidebarMaxListedCollections}
                  canCreateCollection={bucket.canCreateCollection}
                />
              </div>
            );
          })
        )}
      </div>
    );
  }
}

export type OwnProps = {|
  match: Match,
  location: Location,
|};

export type StateProps = {|
  session: SessionState,
  settings: SettingsState,
|};

export type SidebarProps = {
  ...OwnProps,
  ...StateProps,
  listBuckets: typeof SessionActions.listBuckets,
};

export default class Sidebar extends PureComponent<SidebarProps> {
  // This is useful to identify wrapped component for plugin hooks when code is
  // minified; see https://github.com/facebook/react/issues/4915
  static displayName = "Sidebar";

  render() {
    const { session, settings, match, location, listBuckets } = this.props;
    const { params } = match;
    const { pathname: currentPath } = location;
    const { bid, cid } = params;
    const { busy, authenticated, buckets = [] } = session;
    const { sidebarMaxListedCollections } = settings;
    return (
      <div>
        <HomeMenu currentPath={currentPath} onRefresh={listBuckets} />
        {authenticated && (
          <BucketsMenu
            canCreateBucket={canCreateBucket(session)}
            busy={busy}
            buckets={buckets}
            currentPath={currentPath}
            bid={bid}
            cid={cid}
            sidebarMaxListedCollections={sidebarMaxListedCollections}
          />
        )}
      </div>
    );
  }
}
