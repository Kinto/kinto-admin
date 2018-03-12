declare module "react-jsonschema-form" {
  declare module.exports: React.Component;
}

declare module "react-jsonschema-form/lib/utils" {
  declare function mergeObjects(): Object;
  declare module.exports: mergeObjects;
}
