declare module "kinto-client" {
  declare class KintoClient {
    remote: string;
    defaultReqOptions: {
      headers: Object
    };
    constructor(): void;
  }

  declare var exports: typeof KintoClient
}

declare module "kinto-client/lib/endpoint" {
  declare function endpoint(): string;
  declare var exports: endpoint;
}
