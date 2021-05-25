import type { AppState, ValidRecord } from "../../types";
import type { Dispatch } from "redux";
import type { StateProps } from "../../components/simpleReview/SimpleReview";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import SimpleReview from "../../components/simpleReview/SimpleReview";
import * as SignoffActions from "../../plugins/signoff/actions";
import { getClient } from "../../client";

function fetchRecords(bid: string, cid: string): Promise<ValidRecord[]> {
  const coll = getClient().bucket(bid).collection(cid);
  return coll.listRecords().then(({ data: records }) => {
    return records.sort((a, b) => (a.id > b.id ? 1 : -1));
  });
}

function mapStateToProps(state: AppState): StateProps {
  return {
    session: state.session,
    bucket: state.bucket,
    collection: state.collection,
    fetchRecords,
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
