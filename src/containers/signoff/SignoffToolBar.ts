import * as SignoffActions from "@src/actions/signoff";
import SignoffToolBar from "@src/components/signoff/SignoffToolBar";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

function mapStateToProps(state) {
  const { session: sessionState, signoff } = state;
  return {
    sessionState,
    signoff,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SignoffActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SignoffToolBar);
