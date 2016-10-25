/* @flow */

export type Action = {
  type: string
};

export type Attachment = {
  location: string,
  filename: string,
  size: number,
  hash: string,
  mimetype: string,
};

export type AuthData = BasicAuth | TokenAuth;

export type BasicAuth = {
  authType: "basicauth",
  server: string,
  credentials: {
    username: string,
    password: string,
  }
};

export type BucketState = {
  busy: boolean,
  data: BucketData,
  permissions: BucketPermissions,
  history: ResourceHistoryEntry[],
  historyLoaded: boolean,
  collections: CollectionData[],
  collectionsLoaded: boolean,
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
  attachements?: Object,
  changes?: Object,
  default_bucket?: Object,
  fxa?: Object,
  history?: Object,
  permissions_endpoint?: Object,
  schema?: Object,
};

export type ClientError = {
  message: string,
  data: {
    code: number,
    message: string,
    details: {
      existing: {
        id: string
      }
    }
  }
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
  history: ResourceHistoryEntry[],
  historyLoaded: boolean,
};

export type CollectionData = {
  id?: string,
  last_modified?: number,
  schema?: Object,
  uiSchema?: Object,
  attachment?: {
    enabled: boolean,
    required: boolean,
  },
  displayFields?: ?string[],
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

export type GroupState = {
  busy: boolean,
  data?: Object,
  permissions: GroupPermissions,
  history: ResourceHistoryEntry[],
  historyLoaded: boolean,
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

export type Permissions =
  BucketPermissions
  | GroupPermissions
  | CollectionPermissions
  | RecordPermissions;

export type RecordState = {
  busy: boolean,
  data: RecordData,
  permissions: RecordPermissions,
  history: ResourceHistoryEntry[],
  historyLoaded: boolean,
};

export type RecordData = {
  id?: string,
  last_modified?: number,
  schema?: number,
  attachment?: Attachment,
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
  target: Object,
  timestamp: number,
  uri: string,
  user_id: string,
};

export type EmptyRouteParams = {};

export type BucketRouteParams = {
  bid: string,
};

export type CollectionRouteParams = {
  bid: string,
  cid: string,
};

export type GroupRouteParams = {
  bid: string,
  gid: string,
};

export type RecordRouteParams = {
  bid: string,
  cid: string,
  rid: string,
};

export type RouteParams = {
  bid?: string,
  cid?: string,
  gid?: string,
  rid?: string,
};

export type RouteLocation = {
  pathname: string,
  query: {since?: string}
};

export type RouteResources = {
  bucket: BucketResource,
  groups: GroupData[],
  collection: ?CollectionResource,
  record: ?RecordResource,
  group: ?GroupResource,
};

export type SessionState = {
  busy: boolean,
  authenticated: boolean,
  server: ?string,
  credentials: Object,
  buckets: Object[],
  serverInfo: ServerInfo,
  redirectURL: ?string,
};

export type ServerInfo = {
  capabilities: Capabilities,
  user?: {
    id?: string,
    bucket?: string,
  }
};

export type SettingsState = {
  maxPerPage: number,
};

export type TokenAuth = {
  authType: "fxa",
  server: string,
  credentials: {
    token: string
  }
};
