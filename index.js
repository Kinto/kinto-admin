import React from "react";
import { render } from "react-dom";

import KintoAdmin from "./src";

const settings = {
  // Enforce a hard limit of 200 max items per page for records and history
  // entries. We may revisit this strategy as this override any server
  // configuration.
  maxPerPage: 200,
};

render(<KintoAdmin settings={settings} />, document.getElementById("app"));
