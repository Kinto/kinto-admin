import { Reducer, Store } from "redux";

export type ActionType<T extends (...args: any[]) => any> = ReturnType<T>;

export type AppState = {
  router: any;
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
  group: GroupState;
  record: RecordState;
  notifications: Notifications;
  servers: ServerEntry[];
  settings: SettingsState;
};

export type Attachment = {
  location: string;
  filename: string;
  size: number;
  hash: string;
  mimetype: string;
  original?: {
    filename: string;
    size: number;
    hash: string;
    mimetype: string;
  };
};

export type BucketState = {
  busy: boolean;
  data: BucketData;
  permissions: BucketPermissions;
  history: Paginator<ResourceHistoryEntry>;
  collections: Paginator<CollectionData>;
  groups: GroupData[];
};

export type BucketData = {
  id?: string;
  last_modified?: number;
};

export type BucketPermissions = {
  write: string[];
  read?: string[];
  "collection:create"?: string[];
  "group:create"?: string[];
};

export type BucketResource = {
  data: BucketData;
  permissions: BucketPermissions;
};

export type BucketUpdate =
  | {
      data: BucketData;
      permissions?: BucketPermissions;
    }
  | {
      data?: BucketData;
      permissions: BucketPermissions;
    };

export type Capabilities = {
  attachments?: any;
  changes?: any;
  default_bucket?: any;
  fxa?: any;
  openid?: any;
  history?: any;
  permissions_endpoint?: any;
  schema?: any;
  signer?: {
    resources: any[];
    editors_group: string;
    reviewers_group: string;
  };
};

export type ClientErrorData = {
  code: number;
  message: string;
  details: {
    existing: {
      id: string;
    };
  };
};

export type ClientError = {
  message: string;
  data?: ClientErrorData;
};

export type HistoryFilters = {
  since?: string;
  resource_name?: string;
  exclude_user_id?: string;
};

export type CollectionState = {
  busy: boolean;
  data: CollectionData;
  permissions: CollectionPermissions;
  currentSort: string;
  records: RecordData[];
  recordsLoaded: boolean;
  hasNextRecords: boolean;
  listNextRecords: (...args: any) => any | null | undefined;
  totalRecords: number | null | undefined;
  history: Paginator<ResourceHistoryEntry>;
};

export type CollectionData = {
  id?: string;
  last_modified?: number;
  schema?: any;
  uiSchema?: any;
  attachment?: {
    enabled: boolean;
    required: boolean;
  };
  displayFields?: string[] | null | undefined;
  sort?: string;
  cache_expires?: number;
  status?: string;
  last_review_request_by?: string;
  last_editor_comment?: string;
  last_reviewer_comment?: string;
};

export type CollectionPermissions = {
  write: string[];
  read?: string[];
  "record:create"?: string[];
};

export type CollectionResource = {
  data: CollectionData;
  permissions: CollectionPermissions;
};

export type CollectionUpdate =
  | {
      data: CollectionData;
      permissions?: CollectionPermissions;
    }
  | {
      data?: CollectionData;
      permissions: CollectionPermissions;
    };

export type GetStateFn = () => AppState;

export type GroupState = {
  busy: boolean;
  data: GroupData | null | undefined;
  permissions: GroupPermissions;
  history: Paginator<ResourceHistoryEntry>;
  historyLoaded: boolean;
  hasNextHistory: boolean;
  listNextHistory: boolean;
};

export type GroupData = {
  id: string;
  last_modified: number;
  members: string[];
  [key: string]: any;
};

export type GroupPermissions = {
  write: string[];
  read?: string[];
};

export type GroupResource = {
  data: GroupData;
  permissions: GroupPermissions;
};

export type GroupUpdate =
  | {
      data: GroupData;
      permissions?: GroupPermissions;
    }
  | {
      data?: GroupData;
      permissions: GroupPermissions;
    };

export type Notification = {
  type: string;
  message: string;
  details: string[];
};

export type Notifications = Notification[];

export type Paginator<T> = {
  entries: T[];
  loaded: boolean;
  hasNextPage: boolean;
  next: (...args: any) => any | null | undefined;
};

export type Permissions =
  | BucketPermissions
  | GroupPermissions
  | CollectionPermissions
  | RecordPermissions;

export type Plugin = {
  hooks?: any;
  routes?: any[];
  reducers?: {
    [key: string]: Reducer<any, any>;
  };
  sagas: [][];
  register: (store: Store<AppState, any>) => {
    hooks?: any;
    routes?: any[];
  };
};

export type PluginSagas = Array<Array<any>>;

export type RecordState = {
  busy: boolean;
  data: RecordData;
  permissions: RecordPermissions;
  history: Paginator<ResourceHistoryEntry>;
};

export type RecordData = {
  id?: string;
  last_modified?: number;
  schema?: number;
  attachment?: Attachment;
  __attachment__?: string;
};

export interface ValidRecord extends RecordData {
  id: string;
  [key: string]: any;
}

export type RecordPermissions = {
  write: string[];
  read?: string[];
};

export type RecordResource = {
  data: RecordData;
  permissions: RecordPermissions;
};

export type RecordUpdate =
  | {
      data: RecordData;
      permissions?: RecordPermissions;
    }
  | {
      data?: RecordData;
      permissions: RecordPermissions;
    };

export type ResourceHistoryEntry = {
  action: "create" | "update" | "delete";
  collection_id?: string;
  group_id?: string;
  record_id?: string;
  date: string;
  id: string;
  last_modified: number;
  resource_name: string;
  target: {
    data: any;
    permissions: any;
  };
  timestamp: number;
  uri: string;
  user_id: string;
};

export type EmptyRouteParams = {};

export type HomePageRouteMatch = {
  params: { payload: string; token: string };
  isExact: boolean;
  path: string;
  url: string;
};

export type BucketRouteMatch = {
  params: { bid: string };
  isExact: boolean;
  path: string;
  url: string;
};

export type BucketRoute = {
  match: BucketRouteMatch;
};

export type CollectionRouteParams = {
  bid: string;
  cid: string;
};

export type CollectionRouteMatch = {
  params: CollectionRouteParams;
  isExact: boolean;
  path: string;
  url: string;
};

export type CollectionRoute = {
  params: CollectionRouteMatch;
};

export type GroupRouteMatch = {
  params: {
    bid: string;
    gid: string;
  };
  isExact: boolean;
  path: string;
  url: string;
};

export type GroupRoute = {
  params: GroupRouteMatch;
};

export type RecordRouteMatch = {
  params: {
    bid: string;
    cid: string;
    rid: string;
  };
  isExact: boolean;
  path: string;
  url: string;
};

export type RecordRoute = {
  params: RecordRouteMatch;
};

export type RouteParams = {
  bid?: string;
  cid?: string;
  gid?: string;
  rid?: string;
};

export type RouteLocation = {
  pathname: string;
  query: HistoryFilters;
};

export type RouteResources = {
  bucket: BucketResource;
  groups: GroupData[];
  collection: CollectionResource | null | undefined;
  record: RecordResource | null | undefined;
  group: GroupResource | null | undefined;
};

export type AuthMethod =
  | "anonymous"
  | "accounts"
  | "fxa"
  | "ldap"
  | "basicauth"
  | "portier"
  | "openid";

export type SettingsState = {
  maxPerPage: number;
  singleServer: string | null | undefined;
  sidebarMaxListedCollections: number;
};

export type AuthData =
  | AnonymousAuth
  | LDAPAuth
  | AccountAuth
  | BasicAuth
  | PortierAuth
  | TokenAuth
  | OpenIDAuth;

export type AnonymousAuth = {
  authType: "anonymous";
  server: string;
};

export type LDAPAuth = {
  authType: "ldap";
  server: string;
  credentials: {
    username: string;
    password: string;
  };
};

export type AccountAuth = {
  authType: "account";
  server: string;
  credentials: {
    username: string;
    password: string;
  };
};

export type BasicAuth = {
  authType: "basicauth";
  server: string;
  credentials: {
    username: string;
    password: string;
  };
};

export type PortierAuth = {
  authType: "portier";
  server: string;
  credentials: {
    token: string;
  };
};

export type TokenAuth = {
  authType: "fxa";
  server: string;
  credentials: {
    token: string;
  };
};

export type OpenIDAuth = {
  authType: "openid";
  server: string;
  provider: string;
  tokenType: string;
  credentials: {
    token: string;
  };
};

export type SagaGen = Generator<any, void, any>;

export type CollectionEntry = {
  id: string;
  permissions: string[];
  readonly: boolean;
  last_modified: number;
};

export type BucketEntry = {
  id: string;
  permissions: string[];
  collections: CollectionEntry[];
  readonly: boolean;
  canCreateCollection: boolean;
  last_modified: number;
};

export type SessionState = {
  busy: boolean;
  authenticating: boolean;
  auth: AuthData | null | undefined;
  authenticated: boolean;
  permissions: PermissionsListEntry[] | null | undefined;
  buckets: BucketEntry[];
  serverInfo: ServerInfo;
  redirectURL: string | null | undefined;
};

export type ServerEntry = {
  server: string;
  authType: string;
};

export type ServerInfo = {
  url: string;
  project_name: string;
  project_docs: string;
  capabilities: Capabilities;
  user?: {
    id: string;
    principals: string[];
    bucket?: string;
  };
};

export type PermissionsListEntry = {
  bucket_id: string;
  collection_id?: string;
  group_id?: string;
  record_id?: string;
  id: string;
  permissions: string[];
  resource_name: string;
  uri: string;
};

export type CollectionsInfo = {
  source: SourceInfo;
  destination: DestinationInfo;
  preview: PreviewInfo | null | undefined;
  // List of changes, present or absent depending on status.
  // If work-in-progress, show changes since the last review request. It will be
  // null if no changes were made.
  changesOnSource?: ChangesList | null | undefined;
  // If to-review, show changes since the last approval. It will be null if no
  // changes were made.
  changesOnPreview?: ChangesList | null | undefined;
};

export type SignoffState = {
  collectionsInfo: CollectionsInfo | null | undefined;
  pendingConfirmReviewRequest: boolean;
  pendingConfirmDeclineChanges: boolean;
  pendingConfirmRollbackChanges: boolean;
};

export type ChangesList = {
  since: number;
  deleted: number;
  updated: number;
};

export type CollectionStatus =
  | "signed"
  | "to-review"
  | "to-rollback"
  | "to-sign"
  | "work-in-progress";

export type SourceInfo = {
  // Basic Info (before loading from info server)
  bid: string;
  cid: string;
  // Full info.
  status?: CollectionStatus;
  lastEditBy?: string;
  lastEditDate?: number;
  lastReviewRequestBy?: string;
  lastReviewRequestDate?: number;
  lastEditorComment?: string;
  lastReviewBy?: string;
  lastReviewDate?: number;
  lastReviewerComment?: string;
  lastSignatureBy?: string;
  lastSignatureDate?: number;
  editors_group?: string;
  reviewers_group?: string;
};

export type PreviewInfo = {
  bid: string;
  cid: string;
};

export type DestinationInfo = {
  bid: string;
  cid: string;
};
