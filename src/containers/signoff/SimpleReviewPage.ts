import * as SignoffActions from "@src/actions/signoff";
import { getClient } from "@src/client";
import type { StateProps } from "@src/components/signoff/SimpleReview";
import SimpleReview from "@src/components/signoff/SimpleReview";
import type { AppState, ValidRecord } from "@src/types";
import { SignoffState } from "@src/types";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { bindActionCreators } from "redux";

function fetchRecords(bid: string, cid: string): Promise<ValidRecord[]> {
  const coll = getClient().bucket(bid).collection(cid);
  return coll.listRecords().then(({ data: records }) => {
    return records.sort((a, b) => (a.id > b.id ? 1 : -1));
  });
}

function mapStateToProps(
  state: AppState & { signoff: SignoffState }
): StateProps {
  return {
    session: state.session,
    signoff: state.signoff,
    collection: state.collection,
    capabilities: state.session.serverInfo.capabilities,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof SignoffActions {
  return bindActionCreators(
    {
      ...SignoffActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleReview);
