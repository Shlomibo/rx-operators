import { Configuration, DefinePlugin } from 'webpack';

const config: Partial<Configuration> = {
	devtool: 'cheap-module-eval-source-map',
	watchOptions: {
		aggregateTimeout: 1500,
		ignored: /node_modules/,
	},
	mode: 'development',
	plugins: [
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
	],
};
export = config;
