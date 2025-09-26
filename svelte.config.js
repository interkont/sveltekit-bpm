import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		// PostCSS configuration is now handled directly in vite.config.ts
	}),

	kit: {
		adapter: adapter()
	}
};

export default config;
