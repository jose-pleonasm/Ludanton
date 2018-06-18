const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/js/index.js',
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
};