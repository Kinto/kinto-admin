var path = require("path");
var webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var version = require("./package.json").version;

const ASSET_PATH = process.env.ASSET_PATH || "/";

module.exports = {
  mode: "production",
  devServer: {
    stats: "errors-only",
  },
  entry: ["@babel/polyfill", path.resolve(__dirname, "index.js")],
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
      "process.env.KINTO_ADMIN_VERSION": JSON.stringify(version),
      "process.env.ASSET_PATH": JSON.stringify(ASSET_PATH),
    }),
    new HtmlWebpackPlugin({
      template: __dirname + "/html/index.html",
      filename: "index.html",
      inject: "body",
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
