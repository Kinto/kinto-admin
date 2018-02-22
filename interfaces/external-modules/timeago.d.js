declare module "timeago.js" {
  declare class timeagoApi {
    format(date: Date | number | string): string;
  }
  declare function timeago(now: ?Date | number): timeagoApi

  declare var exports: typeof timeago
}
