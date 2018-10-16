declare module "diff" {
  declare type DiffEntry = {
    added: boolean,
    removed: boolean,
    value: string,
  };
  declare function diffJson(a: any, b: any): DiffEntry[];
  declare module.exports: { diffJson: typeof diffJson };
}
