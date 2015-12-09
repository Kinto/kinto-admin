import { connect } from "react-redux";
import Sidebar from "../components/Sidebar";

function mapStateToProps(state) {
  return {
    collections: state.collections
  };
}

export default connect(mapStateToProps)(Sidebar);
