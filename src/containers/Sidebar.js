import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";

function mapStateToProps(state) {
  return {
    session: state.session,
  };
}

export default connect(mapStateToProps)(Sidebar);
