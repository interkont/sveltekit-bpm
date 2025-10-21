import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

const supportedLocales = ['en', 'es'];
const fallbackLocale = 'es';

register('en', () => import('./en.json'));
register('es', () => import('./es.json'));

// Función para determinar el idioma inicial
function getInitialLocale(): string {
    if (typeof window !== 'undefined') {
        // 1. Priorizar el idioma guardado en localStorage
        const savedLocale = window.localStorage.getItem('user-locale');
        if (savedLocale && supportedLocales.includes(savedLocale)) {
            return savedLocale;
        }

        // 2. Usar el idioma del navegador si es soportado
        const browserLocale = getLocaleFromNavigator();
        if (browserLocale && supportedLocales.includes(browserLocale.split('-')[0])) {
            return browserLocale.split('-')[0];
        }
    }
    // 3. Como último recurso, usar el idioma por defecto
    return fallbackLocale;
}


init({
  fallbackLocale: fallbackLocale,
  initialLocale: getInitialLocale(),
});
