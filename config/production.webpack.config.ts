import { Configuration } from 'webpack';

// tslint:disable-next-line:variable-name no-var-requires
const FaviconPlugin: any = require('favicons-webpack-plugin');

const config: Partial<Configuration> = {
	plugins: [ new FaviconPlugin('./favicon.png') ],
	mode: 'production',
};
export = config;
