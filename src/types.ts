import { store } from "@src/store/configureStore";
import { PaginationResult } from "kinto/lib/http/base";
import { HistoryEntry } from "kinto/lib/types";

export type ActionType<T extends (...args: any[]) => any> = ReturnType<T>;

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

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

export type ListResult<T> = {
  data?: T[];
  hasNextPage?: boolean;
  next?: Promise<PaginationResult<T>> | null;
};

export type ListHistoryResult = {
  data?: HistoryEntry<any>[];
  hasNextPage?: boolean;
  next?: Promise<PaginationResult<HistoryEntry<any>>> | null;
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
    to_review_enabled: boolean;
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

export type GetStateFn = typeof store.getState;

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

export type AuthMethod =
  | "anonymous"
  | "accounts"
  | "fxa"
  | "ldap"
  | "basicauth"
  | "portier"
  | "openid";

export type AuthData = {
  authType: AuthMethod;
  server: string;
  expiresAt?: number;
};

export type AnonymousAuth = {
  authType: "anonymous";
} & AuthData;

export type LDAPAuth = {
  authType: "ldap";
  credentials: {
    username: string;
    password: string;
  };
} & AuthData;

export type AccountAuth = {
  authType: "account";
  credentials: {
    username: string;
    password: string;
  };
} & AuthData;

export type BasicAuth = {
  authType: "basicauth";
  credentials: {
    username: string;
    password: string;
  };
} & AuthData;

export type PortierAuth = {
  authType: "portier";
  credentials: {
    token: string;
  };
} & AuthData;

export type TokenAuth = {
  authType: "fxa";
  credentials: {
    token: string;
  };
} & AuthData;

export type OpenIDAuth = {
  authType: "openid";
  provider: string;
  tokenType: string;
  credentials: {
    token: string;
    expiresAt?: number;
  };
} & AuthData;

export type SagaGen = Generator<any, void, any>;

export type SagaNextFunction = (...args: any[]) => any;

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

export type SignoffCollectionsInfo = {
  source?: SignoffSourceInfo;
  destination?: DestinationInfo;
  preview?: PreviewInfo | null;
  // List of changes, present or absent depending on status.
  // If work-in-progress, show changes since the last review request. It will be
  // null if no changes were made.
  changesOnSource?: ChangesList | null;
  // If to-review, show changes since the last approval. It will be null if no
  // changes were made.
  changesOnPreview?: ChangesList | null;
};

export type SignoffState = {
  collectionsInfo: SignoffCollectionsInfo | null | undefined;
  pendingConfirmReviewRequest: boolean;
  pendingConfirmDeclineChanges: boolean;
  pendingConfirmRollbackChanges: boolean;
};

export type ChangesList = {
  since: number;
  deleted: number;
  updated: number;
};

export type SignoffCollectionStatus =
  | "signed"
  | "to-review"
  | "to-rollback"
  | "to-sign"
  | "work-in-progress";

export type SignoffSourceInfo = {
  // Basic Info (before loading from info server)
  bucket: string;
  collection: string;
  // Full info.
  status?: SignoffCollectionStatus;
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
  bucket: string;
  collection: string;
};

export type DestinationInfo = {
  bucket: string;
  collection: string;
};

export type HeartbeatState = {
  success: boolean;
  response?: Record<string, any>;
  details?: any;
};
