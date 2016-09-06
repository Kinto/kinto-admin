import React from "react";
import { render } from "react-dom";

import KintoAdmin from "./src";
import * as signoffPlugin from "./plugins/signoff";


const corePlugins = [
  signoffPlugin
];

const settings = {
  maxPerPage: 200,
};

render(<KintoAdmin plugins={corePlugins} settings={settings} />,
       document.getElementById("app"));
