import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['lucide-react', '@public/assets/icons']
	},
	images: {
		domains: ['api.test.chat.ktsf.ru']
	},
	turbopack: {
		rules: {
			'*.svg': {
				loaders: [
					{
						loader: '@svgr/webpack',
						options: {
							icon: true
						}
					}
				],
				as: '*.js'
			}
		}
	}
};

export default nextConfig;
