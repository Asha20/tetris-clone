const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = (_, argv) => {
  const PROD = argv.mode === "production";

  return {
    mode: argv.mode || "none",
    devtool: PROD ? "source-map" : "inline-source-map",
    entry: "./src/index.ts",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/public",
      sourceMapFilename: "bundle.map.js",
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
    optimization: {
      minimize: PROD,
      minimizer: [
        new UglifyJsPlugin({
          sourceMap: true,
        }),
      ],
    },
    plugins: [new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/])],
  };
};
