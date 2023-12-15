const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		contentBase: 'public'
	},
	module: {
		rules: []
	},
	watchOptions: {
		poll: 1000,
		ignored: ['node_modules']
	}
});