const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./client/src/client_main.tsx",
	devtool: "inline-source-map",
	output: {
		path: path.resolve(__dirname, "public"),
		publicPath: "/public",
		filename: "app.js"
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			},
			{
				test: /\.s(a|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					{
						loader: "sass-loader",
						options: {
							sourceMap: false
						}
					}
				]
			},
			{
				test: /\.(png|jpg|svg)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[path][name].[ext]"
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css"
		}),
		new HtmlWebpackPlugin({
			title: "PIDebug",
			template: "client/html/index.html",
			meta: {viewport: "width=device-width, initial-scale=1, shrink-to-fit=no"}
		})
	]
};
