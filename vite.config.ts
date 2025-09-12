
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
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
    exclude: ['bpmn-js', 'bpmn-js-properties-panel'],
    include: [
      'path-intersection',
      'object-refs',
      'hammerjs',
      'classnames',
      'array-move',
      '@bpmn-io/extract-process-variables',
      '@bpmn-io/extract-process-variables/zeebe'
    ]
  }
});
