import * as CollectionActions from "@src/actions/collection";
import type { Capabilities } from "@src/types";

export type CommonStateProps = {
  capabilities: Capabilities;
};

export type CommonProps = CommonStateProps & {
  deleteRecord: (rid: string, last_modified: number) => void;
};
