declare module "timeago.js" {
  declare class timeagoApi {
    format(date: Date): string;
  }
  declare function timeago(): timeagoApi

  declare var exports: typeof timeago
}
