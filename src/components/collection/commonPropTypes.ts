import * as CollectionActions from "../../actions/collection";
import * as RouteActions from "../../actions/route";
import type { Capabilities } from "../../types";

export type CommonStateProps = {
  capabilities: Capabilities;
};

export type CommonProps = CommonStateProps & {
  deleteRecord: typeof CollectionActions.deleteRecord;
  redirectTo: typeof RouteActions.redirectTo;
};
