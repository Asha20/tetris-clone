const webpack = require("webpack");
const path = require("path");

const PROD = process.env.NODE_ENV === "production";

module.exports = {
  mode: PROD ? "production" : "development",
  devtool: PROD ? "source-map" : "inline-source-map",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/public",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/])],
};
