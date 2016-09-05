import React from "react";
import { render } from "react-dom";

import KintoAdmin from "./scripts";
import * as signoffPlugin from "./plugins/signoff";


const corePlugins = [
  signoffPlugin
];

render(<KintoAdmin plugins={corePlugins} />, document.getElementById("app"));
