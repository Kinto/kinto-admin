import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";

function mapStateToProps(state) {
  return {
    collections: state.collections,
    session: state.session,
    capabilities: state.session.serverInfo.capabilities,
  };
}

export default connect(mapStateToProps)(Sidebar);
