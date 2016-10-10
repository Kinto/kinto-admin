/* @flow */

export type Action = {
  type: string
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
  history: Object[],
  historyLoaded: boolean,
  collections: CollectionData[],
  collectionsLoaded: boolean,
  groups: GroupData[],
  groupsLoaded: boolean,
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

export type CollectionState = {
  busy: boolean,
  data: CollectionData,
  permissions: CollectionPermissions,
  currentSort: string,
  records: RecordData[],
  recordsLoaded: boolean,
  hasNextRecords: boolean,
  listNextRecords: ?Function,
  history: Object[],
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
  data?: Object,
  permissions: GroupPermissions,
  history: Object[],
  historyLoaded: boolean,
};

export type GroupData = {
  id?: string,
  last_modified?: number,
  members?: ?string[],
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

export type RecordState = {
  busy: boolean,
  data: RecordData,
  permissions: RecordPermissions,
};

export type RecordData = {
  id?: string,
  last_modified?: number,
  schema?: number
};

export type RecordPermissions = {
  write: string[],
  read?: string[],
};

export type RecordResource = {
  data: RecordData,
  permissions: RecordPermissions,
};

export type RouteParams = {
  bid: ?string,
  cid: ?string,
  gid: ?string,
  rid: ?string,
};

export type RouteResources = {
  bucket: BucketResource,
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
  capabilities: Object,
  user: {
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
