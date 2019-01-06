const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
	template: './dev/webpack/index.html',
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
		library: 'Ludanton'
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: /(node_modules|bower_components)/,
				use: 'babel-loader'
			}
		]
	},
	plugins: [
		htmlPlugin,
	],
};