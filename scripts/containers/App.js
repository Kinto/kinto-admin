import { connect } from "react-redux";
import App from "../components/App";

function mapStateToProps(state) {
  return {
    notificationList: state.notifications,
  };
}

export default connect(
  mapStateToProps
)(App);
