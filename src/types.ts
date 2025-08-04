import { PaginationResult } from "kinto/lib/http/base";
import { HistoryEntry } from "kinto/lib/types";

export type ActionType<T extends (...args: any[]) => any> = ReturnType<T>;

export interface Attachment {
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
}

export interface ListResult<T> {
  data?: T[];
  hasNextPage?: boolean;
  next?: () => Promise<PaginationResult<T>> | null;
}

export interface ListHistoryResult {
  data?: HistoryEntry<any>[];
  hasNextPage?: boolean;
  next?: Promise<PaginationResult<HistoryEntry<any>>> | null;
}

export interface BucketData {
  id?: string;
  last_modified?: number;
}

export interface BucketPermissions {
  write: string[];
  read?: string[];
  "collection:create"?: string[];
  "group:create"?: string[];
}

export interface SignerCapabilityResource {
  source: SignerCapabilityResourceEntry;
  destination: SignerCapabilityResourceEntry;
  preview?: SignerCapabilityResourceEntry;
  editors_group?: string;
  reviewers_group?: string;
  to_review_enabled?: boolean;
}

export interface SignerCapabilityResourceEntry {
  bucket: string | null;
  collection: string;
  editors_group?: string;
  reviewers_group?: string;
}

export interface OpenIDProvider {
  name: string;
}

export interface Capabilities {
  attachments?: any;
  changes?: any;
  default_bucket?: any;
  openid?: {
    providers: OpenIDProvider[];
  };
  history?: any;
  permissions_endpoint?: any;
  schema?: any;
  signer?: {
    resources: SignerCapabilityResource[];
    editors_group: string;
    reviewers_group: string;
    to_review_enabled: boolean;
    plugin_user_id?: string;
  };
}

export interface ClientErrorData {
  code: number;
  message: string;
  details: {
    existing: {
      id: string;
    };
  };
}

export interface ClientError {
  message: string;
  data?: ClientErrorData;
}

export interface HistoryFilters {
  since?: string;
  resource_name?: string;
  exclude_user_id?: string;
  show_signer_plugin?: boolean;
  show_non_humans?: boolean;
}

export interface CollectionData {
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
}

export interface CollectionPermissions {
  write: string[];
  read?: string[];
  "record:create"?: string[];
}

export interface GroupData {
  id: string;
  last_modified: number;
  members: string[];
  [key: string]: any;
}

export interface GroupPermissions {
  write: string[];
  read?: string[];
}

export interface Notification {
  type: string;
  message: string;
  details: string[];
}

export type Notifications = Notification[];

export interface Paginator<T> {
  entries: T[];
  loaded: boolean;
  hasNextPage: boolean;
  next: (...args: any) => any | null | undefined;
}

export type Permissions =
  | BucketPermissions
  | GroupPermissions
  | CollectionPermissions
  | RecordPermissions;

export interface RecordData {
  id: string;
  last_modified: number;
  schema?: number;
  attachment?: Attachment;
  __attachment__?: string;
  [key: string]: any;
}

export type LocalRecordData = RecordData & {
  // Local records don't have server fields yet.
  id?: string;
  last_modified?: number;
};

export interface RecordPermissions {
  write: string[];
  read?: string[];
}

export interface RecordResource {
  data: RecordData;
  permissions: RecordPermissions;
}

export interface ResourceHistoryEntry {
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
}

export interface RouteParams {
  bid?: string;
  cid?: string;
  gid?: string;
  rid?: string;
}

export interface RouteLocation {
  pathname: string;
  query: HistoryFilters;
}

export type AuthMethod =
  | "anonymous"
  | "accounts"
  | "ldap"
  | "basicauth"
  | "openid";

export interface AuthData {
  authType: AuthMethod;
  server: string;
  expiresAt?: number;
  redirectURL?: string;
}

export type AnonymousAuth = {
  authType: "anonymous";
} & AuthData;

export type CredentialsAuth = {
  credentials: {
    username: string;
    password: string;
  };
} & AuthData;

export type LDAPAuth = {
  authType: "ldap";
} & CredentialsAuth;

export type AccountAuth = {
  authType: "account";
} & CredentialsAuth;

export type BasicAuth = {
  authType: "basicauth";
} & CredentialsAuth;

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

export interface CollectionEntry {
  id: string;
  permissions: string[];
  readonly: boolean;
  last_modified: number;
}

export interface BucketEntry {
  id: string;
  permissions: string[];
  collections: CollectionEntry[];
  readonly: boolean;
  canCreateCollection: boolean;
  last_modified: number;
}

export interface SessionState {
  busy: boolean;
  authenticating: boolean;
  auth: AuthData | null | undefined;
  authenticated: boolean;
  permissions: PermissionsListEntry[] | null | undefined;
  buckets: BucketEntry[];
  serverInfo: ServerInfo;
  redirectURL: string | null | undefined;
}

export interface ServerEntry {
  server: string;
  authType: string;
}

export interface ServerInfo {
  url: string;
  project_name: string;
  project_docs: string;
  capabilities: Capabilities;
  user?: {
    id: string;
    principals: string[];
    bucket?: string;
  };
}

export interface PermissionsListEntry {
  bucket_id: string;
  collection_id?: string;
  group_id?: string;
  record_id?: string;
  id: string;
  permissions: string[];
  resource_name: string;
  uri: string;
}

export type SignedCollectionData = CollectionData & {
  status?: string;
  last_review_request_by?: string;
  last_editor_comment?: string;
  last_reviewer_comment?: string;
  last_edit_by?: string;
  last_edit_date?: string;
  last_review_by?: string;
  last_review_date?: string;
  last_review_request_date?: string;
  last_signature_by?: string;
  last_signature_date?: string;
};

export interface SignoffCollectionsInfo {
  source: SignoffSourceInfo;
  destination: SignerCapabilityResourceEntry;
  preview?: SignerCapabilityResourceEntry;
  // List of changes, present or absent depending on status.
  // If work-in-progress, show changes since the last review request. It will be
  // null if no changes were made.
  changesOnSource?: ChangesList | null;
  // If to-review, show changes since the last approval. It will be null if no
  // changes were made.
  changesOnPreview?: ChangesList | null;
}

export interface SignoffState {
  collectionsInfo: SignoffCollectionsInfo | null | undefined;
  pendingConfirmReviewRequest: boolean;
  pendingConfirmDeclineChanges: boolean;
  pendingConfirmRollbackChanges: boolean;
}

export interface ChangesList {
  since: number;
  deleted: number;
  updated: number;
}

export type SignoffCollectionStatus =
  | "signed"
  | "to-review"
  | "to-rollback"
  | "to-sign"
  | "work-in-progress";

export type SignoffSourceInfo = SignerCapabilityResourceEntry & {
  // Full info once we fetch attributes from server
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
};

export interface HeartbeatState {
  success: boolean;
  response?: Record<string, any>;
  details?: any;
}
