import * as CollectionActions from "../../actions/collection";
import * as SignoffActions from "../../actions/signoff";
import { getClient } from "../../client";
import type { StateProps } from "../../components/signoff/SimpleReview";
import SimpleReview from "../../components/signoff/SimpleReview";
import type { AppState, ValidRecord } from "../../types";
import { SignoffState } from "../../types";
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
    fetchRecords,
  };
}

function mapDispatchToProps(dispatch: Dispatch): typeof SignoffActions {
  return bindActionCreators(
    {
      ...SignoffActions,
      ...CollectionActions,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleReview);
