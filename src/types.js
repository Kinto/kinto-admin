/* @flow */
import type { Reducer, Store } from "redux";

type _$ReturnType<B, F: (...args: any[]) => B> = B; // eslint-disable-line
export type $ReturnType<F> = _$ReturnType<*, F>;

export type ActionType<T> = $ReturnType<T>;

export type AppState = {
  routing: Object,
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  group: GroupState,
  record: RecordState,
  notifications: Notifications,
  history: string[],
  settings: SettingsState,
};

export type Attachment = {
  location: string,
  filename: string,
  size: number,
  hash: string,
  mimetype: string,
};

export type BucketState = {
  busy: boolean,
  data: BucketData,
  permissions: BucketPermissions,
  history: Paginator<ResourceHistoryEntry>,
  collections: Paginator<CollectionData>,
  groups: GroupData[],
};

export type BucketData = {
  id?: string,
  last_modified?: number,
};

export type BucketPermissions = {
  write: string[],
  read?: string[],
  "collection:create"?: string[],
  "group:create"?: string[],
};

export type BucketResource = {
  data: BucketData,
  permissions: BucketPermissions,
};

export type Capabilities = {
  attachments?: Object,
  changes?: Object,
  default_bucket?: Object,
  fxa?: Object,
  history?: Object,
  permissions_endpoint?: Object,
  schema?: Object,
  signer?: Object,
};

export type ClientError = {
  message: string,
  data: {
    code: number,
    message: string,
    details: {
      existing: {
        id: string,
      },
    },
  },
};

export type HistoryFilters = {
  since?: string,
  resource_name?: string,
};

export type CollectionState = {
  busy: boolean,
  data: CollectionData,
  permissions: CollectionPermissions,
  currentSort: string,
  records: RecordData[],
  recordsLoaded: boolean,
  hasNextRecords: boolean,
  listNextRecords: ?Function,
  history: Paginator<ResourceHistoryEntry>,
};

export type CollectionData = {
  id?: string,
  last_modified?: number,
  schema?: Object,
  uiSchema?: Object,
  attachment?: {
    enabled: boolean,
    required: boolean,
    gzipped: boolean,
  },
  displayFields?: ?(string[]),
  sort?: string,
  cache_expires?: number,
  status?: string,
};

export type CollectionPermissions = {
  write: string[],
  read?: string[],
  "record:create"?: string[],
};

export type CollectionResource = {
  data: CollectionData,
  permissions: CollectionPermissions,
};

export type GetStateFn = () => AppState;

export type GroupState = {
  busy: boolean,
  data: Object,
  permissions: GroupPermissions,
  history: Paginator<ResourceHistoryEntry>,
};

export type GroupData = {
  id: string,
  last_modified: number,
  members: string[],
};

export type GroupPermissions = {
  write: string[],
  read?: string[],
};

export type GroupResource = {
  data: GroupData,
  permissions: GroupPermissions,
};

export type Notification = {
  type: string,
  persistent: boolean,
  message: string,
  details: string[],
};

export type Notifications = Notification[];

export type Paginator<T> = {
  entries: T[],
  loaded: boolean,
  hasNextPage: boolean,
  next: ?Function,
};

export type Permissions =
  | BucketPermissions
  | GroupPermissions
  | CollectionPermissions
  | RecordPermissions;

export type Plugin = {
  hooks?: Object,
  routes?: Object[],
  reducers?: { [key: string]: Reducer<any, any> },
  sagas: [][],
  register: (store: Store) => {
    hooks?: Object,
    routes?: Object[],
  },
};

export type PluginSagas = Array<Array<any>>;

export type RecordState = {
  busy: boolean,
  data: RecordData,
  permissions: RecordPermissions,
  history: Paginator<ResourceHistoryEntry>,
};

export type RecordData = {
  id?: string,
  last_modified?: number,
  schema?: number,
  attachment?: Attachment,
  __attachment__?: string,
};

export type RecordPermissions = {
  write: string[],
  read?: string[],
};

export type RecordResource = {
  data: RecordData,
  permissions: RecordPermissions,
};

export type ResourceHistoryEntry = {
  action: "create" | "update" | "delete",
  collection_id?: string,
  group_id?: string,
  record_id?: string,
  date: string,
  id: string,
  last_modified: number,
  resource_name: string,
  target: {
    data: Object,
    permissions: Object,
  },
  timestamp: number,
  uri: string,
  user_id: string,
};

export type EmptyRouteParams = {};

export type BucketRouteParams = {
  bid: string,
};

export type BucketRoute = {
  params: BucketRouteParams,
};

export type CollectionRouteParams = {
  bid: string,
  cid: string,
};

export type CollectionRoute = {
  params: CollectionRouteParams,
};

export type GroupRouteParams = {
  bid: string,
  gid: string,
};

export type GroupRoute = {
  params: GroupRouteParams,
};

export type RecordRouteParams = {
  bid: string,
  cid: string,
  rid: string,
};

export type RecordRoute = {
  params: RecordRouteParams,
};

export type RouteParams = {
  bid?: string,
  cid?: string,
  gid?: string,
  rid?: string,
};

export type RouteLocation = {
  pathname: string,
  query: {
    since?: string,
    resource_name?: string,
  },
};

export type RouteResources = {
  bucket: BucketResource,
  groups: GroupData[],
  collection: ?CollectionResource,
  record: ?RecordResource,
  group: ?GroupResource,
};

export type AuthMethod = "anonymous" | "fxa" | "ldap" | "basicauth" | "portier";

export type SettingsState = {
  maxPerPage: number,
  singleServer: ?string,
  authMethods: AuthMethod[],
  sidebarMaxListedCollections: number,
};

export type AuthData = AnonymousAuth | LDAPAuth | BasicAuth | TokenAuth;

export type AnonymousAuth = {
  authType: "anonymous",
  server: string,
};

export type LDAPAuth = {
  authType: "ldap",
  server: string,
  credentials: {
    username: string,
    password: string,
  },
};

export type BasicAuth = {
  authType: "basicauth",
  server: string,
  credentials: {
    username: string,
    password: string,
  },
};

export type TokenAuth = {
  authType: "fxa",
  server: string,
  credentials: {
    token: string,
  },
};

export type SagaGen = Generator<*, void, *>;

export type CollectionEntry = {
  id: string,
  permissions: string[],
  readonly: boolean,
  last_modified: number,
};

export type BucketEntry = {
  id: string,
  permissions: string[],
  collections: CollectionEntry[],
  readonly: boolean,
  last_modified: number,
};

export type SessionState = {
  busy: boolean,
  auth: ?AuthData,
  authenticated: boolean,
  permissions: ?(PermissionsListEntry[]),
  buckets: BucketEntry[],
  serverInfo: ServerInfo,
  redirectURL: ?string,
};

export type ServerInfo = {
  url: string,
  capabilities: Capabilities,
  user?: {
    id: string,
    bucket?: string,
  },
};

export type PermissionsListEntry = {
  bucket_id: string,
  collection_id?: string,
  group_id?: string,
  record_id?: string,
  id: string,
  permissions: string[],
  resource_name: string,
  uri: string,
};
