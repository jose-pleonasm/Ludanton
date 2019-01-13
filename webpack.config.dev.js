/*eslint-env node */
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlTemplate = './dev/html/index.html';
const jsTemplate = './dev/js/index.html';

const htmlPlugin = new HtmlWebPackPlugin({
	template: jsTemplate,
	filename: './index.html',
	inject: 'head',
	lang: 'cs',
});

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
	],
};