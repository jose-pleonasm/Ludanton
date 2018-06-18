const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
	template: './dev/index.html',
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
	externals: [{
		'py-logging': {
			commonjs: 'py-logging',
			commonjs2: 'py-logging',
			amd: 'py-logging',
			root: 'logging'
		},
	}, {
		'py-logging-browserkit': {
			commonjs: 'py-logging-browserkit',
			commonjs2: 'py-logging-browserkit',
			amd: 'py-logging-browserkit',
			root: 'py_logging_browserkit'
		},
	}],
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