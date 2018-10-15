declare module "react-jsonschema-form" {
  declare module.exports: React.Component;
}

declare module "react-jsonschema-form/lib/utils" {
  declare function mergeObjects(
    obj1: Object,
    obj2: Object,
    concatArrays: boolean
  ): Object;
  declare module.exports: { mergeObjects: typeof mergeObjects };
}
