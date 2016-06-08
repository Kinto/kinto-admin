export type Action = Object;

export type Bucket = {
  busy: boolean,
  name: ?string,
  data: BucketData,
  permissions: BucketPermissions,
};

export type BucketData = {
  id?: string,
  last_modified?: number,
};

export type BucketPermissions = {
  write: Array<string>,
  read?: Array<string>,
  "collection:create"?: Array<string>,
  "group:create"?: Array<string>,
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
  displayFields: ?Array<string>,
  records: Array<RecordData>,
  permissions: CollectionPermissions,
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
  displayFields?: ?Array<string>,
};

export type CollectionPermissions = {
  write: Array<string>,
  read?: Array<string>,
  "record:create"?: Array<string>,
};

export type Notification = {
  type: string,
  persistent: boolean,
  message: string,
  details: Array<string>
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
  write: Array<string>,
  read?: Array<string>,
};

export type Session = {
  busy: boolean,
  authenticated: boolean,
  server: ?string,
  credentials: Object,
  buckets: Array<Object>,
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
