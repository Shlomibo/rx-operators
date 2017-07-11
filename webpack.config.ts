import { resolve } from 'path';
import { Configuration } from 'webpack';

const conf: Configuration = {
	entry: './app.ts',
	context: __dirname,
	output: {
		filename: 'app.js',
		path: resolve(__dirname, 'public'),
	},
	resolve: {
		// alias: {
		// 	'rx-utils': resolve(__dirname, 'rx-utils'),
		// },
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		modules: [
			// resolve(__dirname, 'client', 'scripts'),
			// __dirname,
			'node_modules',
		],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
				],
			}, {
				test: /\.(jpg|png|bmp|svg|gif)$/,
				use: [
					'file-loader',
				],
			}, {
				test: /\.(ts|tsx|js|jsx)$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	devtool: 'cheap-module-source-map',
};
export default conf;
