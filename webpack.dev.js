var path = require("path");
var webpack = require("webpack");
var version = require("./package.json").version;
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: [
    "@babel/polyfill",
    "webpack-hot-middleware/client",
    path.resolve(__dirname, "src/index"),
  ],
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/",
  },
  optimization: {
    emitOnErrors: false,
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^(buffertools)$/, // unwanted "deeper" dependency
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        KINTO_ADMIN_VERSION: JSON.stringify(version),
        SINGLE_SERVER: JSON.stringify(process.env.SINGLE_SERVER),
      },
    }),
    new HtmlWebpackPlugin({
      template: __dirname + "/html/index.html",
      filename: "index.html",
      inject: "body",
      favicon: "images/favicon.png",
    }),
  ],
  resolve: {
    extensions: [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".css",
      ".eot",
      "png",
      ".woff",
      ".woff2",
      ".ttf",
      ".svg",
    ],
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        include: [path.join(__dirname), path.join(__dirname, "src")],
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      { test: /\.png$/, loader: "url-loader", options: { limit: 10000 } },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
      {
        test: /\.(woff|woff2)$/,
        loader: "url-loader",
        options: { prefix: "font/", limit: 5000 },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: { limit: 10000, mimetype: "application/octet-stream" },
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack", "url-loader"],
      },
    ],
  },
};
