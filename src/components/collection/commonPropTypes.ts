import * as CollectionActions from "@src/actions/collection";
import * as RouteActions from "@src/actions/route";
import type { Capabilities } from "@src/types";

export type CommonStateProps = {
  capabilities: Capabilities;
};

export type CommonProps = CommonStateProps & {
  deleteRecord: typeof CollectionActions.deleteRecord;
  redirectTo: typeof RouteActions.redirectTo;
};
