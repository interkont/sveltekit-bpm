
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [sveltekit()],
    css: {
      postcss: {
        plugins: [
          tailwindcss({ config: './tailwind.config.cjs' }),
          autoprefixer,
        ],
      },
    },
    
    optimizeDeps: {
      include: ['svelte-select'],
    },

    // Add this section to fix the Svelte Flow SSR issue
    ssr: {
      noExternal: ['@xyflow/svelte'],
    },

    server: {
      proxy: {
        '/api': {
          target: 'https://9000-firebase-my-bpm-back-express-1758069125362.cluster-4unnw5epovarsrg6rdhhbr2n4s.cloudworkstations.dev',
          changeOrigin: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              let firebaseCookie = env.FIREBASE_COOKIE?.replace(/^"|"$/g, '');
              // Read the cookie from the loaded environment variables
              // const firebaseCookie = env.FIREBASE_COOKIE;
              if (firebaseCookie) {
                // Add the cookie to the request header
                proxyReq.setHeader('Cookie', firebaseCookie);
              }
            });
          },
        },
      },
    },
  };
});
