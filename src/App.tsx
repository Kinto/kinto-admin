import "../css/styles.css";
import { Layout } from "@src/components/Layout";
import "bootstrap/dist/css/bootstrap.css";
import { HashRouter } from "react-router";

export const App = () => {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
};
