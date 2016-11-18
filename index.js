import React from "react";
import { render } from "react-dom";

import KintoAdmin from "./src";
import * as signoffPlugin from "./src/plugins/signoff";


const corePlugins = [
  signoffPlugin
];

const settings = {};

render(<KintoAdmin plugins={corePlugins} settings={settings} />,
       document.getElementById("app"));
