import { Configuration } from 'webpack';

const config: Partial<Configuration> = {
	devtool: 'cheap-module-eval-source-map',
	watchOptions: {
		aggregateTimeout: 1500,
		ignored: /node_modules/,
	},
};
export = config;
