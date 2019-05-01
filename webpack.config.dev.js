/*eslint-env node */
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
	template: './dev/html/index.html',
	// template: './dev/js/index.html',
	filename: './index.html',
	inject: 'head',
	lang: 'cs',
});
const envPlugin = new webpack.EnvironmentPlugin(['NODE_ENV']);

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './src/js/dev.js',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'ludanton.js',
		libraryTarget: 'umd',
		globalObject: 'this',
		// libraryExport: 'default',
		library: 'Ludanton',
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: /(node_modules|bower_components)/,
				use: 'babel-loader',
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
						},
					},
					'postcss-loader',
				],
			},
		],
	},
	plugins: [
		htmlPlugin,
		envPlugin,
	],
};