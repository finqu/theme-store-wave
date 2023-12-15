const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { merge } = require('webpack-merge');

module.exports = merge(common, {
	mode: 'production',
	module: {
		rules: []
	},
	optimization: {
		moduleIds: 'deterministic'
	},
	plugins: [
		new BundleAnalyzerPlugin()
	]
});