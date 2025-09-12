import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
        // Excluimos los paquetes principales para que la importación dinámica (`import(...)`) funcione
        // y para evitar que se intenten cargar en el servidor (SSR).
		exclude: ['bpmn-js', 'bpmn-js-properties-panel'],
        // Forzamos la inclusión de sub-dependencias que usan formatos de módulo incompatibles (CommonJS).
        // Vite las pre-compilará a ES Modules estándar para que funcionen en el navegador.
        // Algunos paquetes requieren que se especifiquen rutas profundas si tienen múltiples puntos de entrada.
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
