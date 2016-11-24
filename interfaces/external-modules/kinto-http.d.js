declare module "kinto-http" {
  declare type ObjectResponseBody = {
    data: Object,
    permissions: Object,
  }

  declare type ListResponseBody = {
    data: Object[],
  }

  declare type Options = Object;
  declare type Permissions = Object;

  declare class KintoClient {
    remote: string;
    defaultReqOptions: {
      headers: Object
    };
    constructor(): void;
    bucket(): Bucket;
    createBucket(id: string, options?: Options): Promise<ObjectResponseBody>,
    deleteBucket(id: string, options?: Options): Promise<ObjectResponseBody>,
  }

  declare class Bucket {
    constructor(): void;
    collection(): Collection;
    setData(): Promise<*>;
    setPermissions(permissions: Permissions): Promise<ObjectResponseBody>,
    createCollection(id: string, options?: Options): Promise<ObjectResponseBody>,
    deleteCollection(id: string, options?: Options): Promise<ObjectResponseBody>,
    listCollections(options?: Options): Promise<ListResponseBody>,
    setData(data: Object, options?: Options): Promise<Object>,
    listHistory(): Promise<ListResponseBody>,
    createGroup(id: string, options?: Options): Promise<ObjectResponseBody>,
    updateGroup(group: Object, options?: Options): Promise<ObjectResponseBody>,
    deleteGroup(id: string, options?: Options): Promise<ObjectResponseBody>,
  }

  declare class Collection {
    constructor(): void;
    setData(data: Object, options?: Options): Promise<Object>,
    setPermissions(permissions: Permissions): Promise<ObjectResponseBody>,
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
