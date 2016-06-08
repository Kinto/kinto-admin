declare module "kinto-client" {
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
    setData(): Promise;
  }

  declare class Collection {
    constructor(): void;
  }

  declare var exports: typeof KintoClient
}

declare module "kinto-client/lib/endpoint" {
  declare function endpoint(): string;
  declare var exports: endpoint;
}
