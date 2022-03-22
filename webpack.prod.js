var path = require("path");
var webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var version = require("./package.json").version;

// used to set the relative path from which we expect to serve the admin's
// static bundle on the server:
// GH Pages:     /kinto-admin/
// Kinto plugin: /v1/admin/
const ASSET_PATH = process.env.ASSET_PATH || "/";

module.exports = {
  mode: "production",
  devServer: {
    stats: "errors-only",
  },
  entry: ["@babel/polyfill", path.resolve(__dirname, "src/index")],
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
    publicPath: ASSET_PATH,
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^(buffertools)$/, // unwanted "deeper" dependency
    }),
    new MiniCssExtractPlugin({ filename: "styles.css" }),
    new webpack.DefinePlugin({
      "process.env": {
        ASSET_PATH: JSON.stringify(ASSET_PATH),
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
    extensions: [".js", ".jsx", ".ts", ".tsx", ".css", ".png"],
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
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      { test: /\.png$/, type: "asset/resource" },
      {
        test: /\.(woff|woff2|eot(\?v=\d+\.\d+\.\d+)?|ttf(\?v=\d+\.\d+\.\d+)?)$/,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack", "url-loader"],
      },
    ],
  },
};
