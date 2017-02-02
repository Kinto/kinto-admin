declare module "diff" {
  declare type DiffEntry = {
    added: boolean,
    removed: boolean,
    value: string,
  };
  declare function diffJson(a: Object, b: Object): DiffEntry[]
  declare var exports: diffJson
}
