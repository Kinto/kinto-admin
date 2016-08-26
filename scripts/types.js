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

export type Bucket = {
  busy: boolean,
  name: ?string,
  data: BucketData,
  permissions: BucketPermissions,
  history: Object[],
  groups: Object[],
  collections: Object[],
  listLoaded: boolean,
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

export type Collection = {
  bucket: ?string,
  name: ?string,
  busy: boolean,
  schema: ?Object,
  uiSchema: ?Object,
  attachment: {
    enabled: boolean,
    required: boolean,
  },
  displayFields: ?string[],
  records: RecordData[],
  hasNextRecords: boolean,
  listNextRecords: ?Function,
  sort: string,
  permissions: CollectionPermissions,
  history: Object[],
  listLoaded: boolean,
};

export type CollectionData = {
  id?: string,
  last_modified?: number,
  bucket?: string,
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

export type Notification = {
  type: string,
  persistent: boolean,
  message: string,
  details: string[],
};

export type Notifications = Array<Notification>;

export type Record = {
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

export type Session = {
  busy: boolean,
  authenticated: boolean,
  server: ?string,
  credentials: Object,
  buckets: Object[],
  serverInfo: SessionServerInfo,
  redirectURL: ?string,
};

export type SessionServerInfo = {
  capabilities: Object,
  user: {
    id?: string,
    bucket?: string,
  }
};

export type TokenAuth = {
  authType: "fxa",
  server: string,
  credentials: {
    token: string
  }
};
