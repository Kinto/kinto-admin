import * as SignoffActions from "../../actions/signoff";
import SignoffToolBar from "../../components/signoff/SignoffToolBar";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state) {
  const {
    session: sessionState,
    bucket: bucketState,
    collection: collectionState,
    signoff,
  } = state;
  return {
    sessionState,
    bucketState,
    collectionState,
    signoff,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SignoffActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SignoffToolBar);
