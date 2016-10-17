declare module "kinto-http" {
  declare class KintoClient {
    remote: string;
    defaultReqOptions: {
      headers: Object
    };
    constructor(): void;
    bucket(): Bucket;
  }

  declare class Bucket {
    constructor(): void;
    collection(): Collection;
    setData(): Promise<*>;
  }

  declare class Collection {
    constructor(): void;
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
