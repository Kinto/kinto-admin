import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";

function mapStateToProps(state) {
  return {
    collections: state.collections,
    session: state.session,
  };
}

export default connect(mapStateToProps)(Sidebar);
