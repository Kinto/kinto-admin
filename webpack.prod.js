var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "scripts/index.js"),
    vendors: ["react", "kinto", "jsonschema"]
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("vendors", "vendors.js"),
    new ExtractTextPlugin("styles.css", {allChunks: true}),
  ],
  resolve: {
    extensions: ["", ".js", ".jsx", ".css"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ["babel"],
        include: [
          path.join(__dirname, "scripts"),
          path.join(__dirname, "schema")
        ]
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("css-loader"),
        include: path.join(__dirname, "css")
      }
    ]
  }
};
