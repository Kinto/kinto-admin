var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var version = require("./package.json").version;

module.exports = {
  devServer: {
    stats: "errors-only",
  },
  entry: [
    "babel-polyfill",
    path.resolve(__dirname, "index.js"),
  ],
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/kinto-admin/",
  },
  plugins: [
    new webpack.IgnorePlugin(/^(buffertools)$/), // unwanted "deeper" dependency
    new ExtractTextPlugin({filename: "styles.css", allChunks: true}),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        KINTO_ADMIN_VERSION: JSON.stringify(version),
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".css", ".png"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        include: [
          path.join(__dirname),
          path.join(__dirname, "src"),
        ]
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("css-loader"),
      },
      { test: /\.png$/, loader: "url-loader", options: {"limit": 10000} },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
      { test: /\.(woff|woff2)$/, loader:"url-loader", options: {"prefix": "font/", "limit": 5000} },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader", options: {limit: 10000, mimetype: "application/octet-stream"} },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader", options: {limit: 10000, mimetype: "image/svg+xml"} }
    ]
  }
};
