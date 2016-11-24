declare module "kinto-http" {
  declare type Options = Object;
  declare type PermissionType =
      "write"
    | "read"
    | "bucket:create"
    | "group:create"
    | "collection:create"
    | "record:create";
  declare type Principal = string;
  declare type Permissions = {[key: PermissionType]: Principal[]};

  declare type Resource = {
    id: string,
    last_modified: number,
    [key: string]: any,
  };

  declare type ObjectResponseBody<T> = {
    data: T,
    permissions: Permissions,
  }

  declare type ListResponseBody<T> = {
    data: T[],
  }

  declare class KintoClient {
    remote: string;
    defaultReqOptions: {
      headers: Object
    };
    constructor(): void;
    bucket(): Bucket;
    createBucket(id: string, options?: Options): Promise<ObjectResponseBody<Resource>>,
    deleteBucket(id: string, options?: Options): Promise<ObjectResponseBody<Resource>>,
  }

  declare class Bucket {
    constructor(): void;
    collection(): Collection;
    setData(): Promise<*>;
    setPermissions(permissions: Permissions): Promise<ObjectResponseBody<Resource>>,
    createCollection(id: string, options?: Options): Promise<ObjectResponseBody<Resource>>,
    deleteCollection(id: string, options?: Options): Promise<ObjectResponseBody<Resource>>,
    listCollections(options?: Options): Promise<ListResponseBody<Resource>>,
    setData(data: Object, options?: Options): Promise<Object>,
    listHistory(): Promise<ListResponseBody<Object>>,
    createGroup(id: string, options?: Options): Promise<ObjectResponseBody<Resource>>,
    updateGroup(group: Object, options?: Options): Promise<ObjectResponseBody<Resource>>,
    deleteGroup(id: string, options?: Options): Promise<ObjectResponseBody<Resource>>,
  }

  declare class Collection {
    constructor(): void;
    setData(data: Object, options?: Options): Promise<Object>,
    setPermissions(permissions: Permissions): Promise<ObjectResponseBody<Resource>>,
  }

  declare var exports: typeof KintoClient
}

declare module "kinto-http/lib/endpoint" {
  declare function endpoint(): string;
  declare var exports: endpoint;
}

declare module "kinto-http/lib/utils" {
  declare function checkVersion(
    version: string,
    minVersion: string,
    maxVersion: string
  ): boolean;
}
