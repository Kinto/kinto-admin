var express = require("express");
var webpack = require("webpack");
var config = require("../webpack.dev");

var app = express();
var compiler = webpack(config);
const PORT = process.env.PORT || 3000;

app.use(
  require("webpack-dev-middleware")(compiler, {
    publicPath: config.output.publicPath,
    headers: { "Access-Control-Allow-Origin": "*" },
  })
);
app.use(require("webpack-hot-middleware")(compiler));

app.listen(PORT, "0.0.0.0", function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log("Listening at http://0.0.0.0:" + PORT);
});
