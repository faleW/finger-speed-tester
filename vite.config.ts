import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
		watch: {
			ignored: ['**/src-tauri/**']
		}
	},
	envPrefix: ['VITE_', 'TAURI_ENV_*'],
	build: {
		target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
		minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG 
	}
});
