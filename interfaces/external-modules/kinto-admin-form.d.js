declare module "kinto-admin-form" {
  declare function mergeObjects(
    obj1: Object,
    obj2: Object,
    concatArrays: boolean
  ): Object;
  declare export var utils: { mergeObjects: typeof mergeObjects };
  declare export type FormProps = {|
    className?: string,
    validate?: Function,
    uiSchema?: any,
    schema?: any,
    onSubmit?: Function,
    onChange?: Function,
    formData?: any,
    children?: any,
    fields?: any,
  |};
  declare export default class KintoAdminForm
    extends React$Component<FormProps> {}
}
