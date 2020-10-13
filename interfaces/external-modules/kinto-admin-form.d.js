declare module "kinto-admin-form" {
  declare function mergeObjects(
    obj1: Object,
    obj2: Object,
    concatArrays: boolean
  ): Object;
  declare export var utils: { mergeObjects: typeof mergeObjects };
  declare export default React.Component;
}
