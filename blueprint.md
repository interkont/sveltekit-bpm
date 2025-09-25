# Blueprint del Proyecto: Editor de Modelos BPMN

## 1. Descripción General

Esta es una aplicación web construida con **SvelteKit**, **Vite** y **TypeScript**. Su propósito principal es permitir a los usuarios visualizar, crear y editar modelos de procesos de negocio utilizando el estándar BPMN 2.0. La aplicación integra las librerías `bpmn-js` para el renderizado y modelado de los diagramas, y utiliza Tailwind CSS para el estilizado.

El diseño se centra en una interfaz limpia y reactiva, diseñada para funcionar exclusivamente en el lado del cliente (navegador).

---

## 2. Características Implementadas

- **Visualización y Edición de Modelos BPMN:** Renderizado de diagramas existentes y un modo de edición con lienzo y panel de propiedades.
- **Creación de Nuevos Modelos:** Funcionalidad para iniciar diagramas desde una plantilla.
- **Componente de Detalle Dinámico:** Panel lateral para ver y editar detalles del modelo.
- **Carga Dinámica de Dependencias:** Las librerías `bpmn-js` se cargan dinámicamente en el navegador (`onMount`) para evitar errores de SSR y optimizar la carga inicial.
- **Gestión Local de Estilos:** Los CSS de las librerías externas se almacenan localmente para garantizar la estabilidad.

---

## 3. Dependencias Externas (Vendor)

Para garantizar la estabilidad y el control, los siguientes archivos CSS se han descargado y se sirven localmente desde `src/lib/vendor/bpmn-styles/`.

- **`diagram-js.css`**
  - **Versión:** `11.5.0`
  - **URL de Origen:** `https://unpkg.com/bpmn-js@11.5.0/dist/assets/diagram-js.css`

- **`bpmn-embedded.css`** (Fuente de iconos BPMN)
  - **Versión:** `11.5.0`
  - **URL de Origen:** `https://unpkg.com/bpmn-js@11.5.0/dist/assets/bpmn-font/css/bpmn-embedded.css`

- **`bpmn-js-properties-panel.css`**
  - **Versión:** `5.42.0`
  - **URL de Origen:** `https://unpkg.com/bpmn-js-properties-panel@5.42.0/dist/bpmn-js-properties-panel.css`

---

## 4. Configuración de Vite para `bpmn-js`

La integración de `bpmn-js` en un entorno de Vite + SvelteKit requirió una configuración específica en `vite.config.ts` para manejar sus dependencias complejas.

La sección `optimizeDeps` es crucial para instruir a Vite sobre cómo pre-compilar las dependencias:

```typescript
// vite.config.ts
export default defineConfig({
  // ...
  optimizeDeps: {
    // 1. Exclusión de la Pre-compilación:
    // Se excluyen las librerías principales para permitir su carga dinámica con `import(...)`
    // y para evitar que Vite intente procesarlas en el servidor (SSR).
    exclude: ['bpmn-js', 'bpmn-js-properties-panel'],

    // 2. Inclusión Forzada en la Pre-compilación:
    // Se fuerza la inclusión de sub-dependencias que usan formatos de módulo incompatibles (CommonJS).
    // Vite las convierte a ES Modules estándar para que funcionen correctamente en el navegador.
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
```

---

## 5. Integración de Tailwind CSS

Se integró el framework de utilidad Tailwind CSS para el estilizado moderno de la aplicación.

### A. Desafío Principal
El obstáculo fue lograr que el proceso de build de Vite procesara las directivas `@tailwind` en el archivo CSS global (`src/app.css`). La configuración inicial a través de `svelte-preprocess` o `postcss.config.js` fracasó, ya que las directivas se inyectaban en el navegador sin ser convertidas a CSS.

### B. Solución: Centralización en `vite.config.ts`
La solución fue configurar PostCSS explícitamente dentro del archivo `vite.config.ts`, que es el responsable de manejar los assets CSS globales.

1.  **Centralización de la Configuración**: Se añadió una sección `css.postcss` a `vite.config.ts` donde se cargaron los plugins `tailwindcss` y `autoprefixer`.

    ```typescript
    // vite.config.ts
    import tailwindcss from 'tailwindcss';
    import autoprefixer from 'autoprefixer';

    export default defineConfig({
      // ...
      css: {
        postcss: {
          plugins: [
            tailwindcss({ config: './tailwind.config.cjs' }),
            autoprefixer,
          ],
        },
      },
      // ...
    });
    ```

2.  **Limpieza y Estandarización**: Se eliminó el archivo `postcss.config.js` para evitar conflictos y se estandarizaron los archivos de configuración a la sintaxis CommonJS (`.cjs`) para asegurar la compatibilidad.

---

## 6. Módulo de Administración de Usuarios y Roles

Se ha añadido una nueva vista de "Administración" accesible desde la navegación principal. Esta sección centraliza la gestión de la plataforma y utiliza una interfaz moderna basada en pestañas y paneles deslizantes para una experiencia de usuario fluida.

- **Componente Central:** `src/lib/components/UserManagementView.svelte`.
- **Arquitectura de Paneles:** La creación y edición de usuarios/roles se realiza a través de paneles (`UserEditPanel`, `RoleEditPanel`, `AddMemberPanel`) que se deslizan desde el lateral, evitando la recarga de la página y manteniendo el contexto.
- **Gestión de Estado Reactiva:** El estado de los usuarios y roles se gestiona a través de Svelte Stores (`userStore`, `processRoleStore`), asegurando que la interfaz se actualice automáticamente cuando los datos cambian.

### A. Gestión de Usuarios
- Muestra una tabla de usuarios con búsqueda en tiempo real.
- Permite la creación y edición de usuarios, incluyendo la asignación de roles de sistema y de proceso.

### B. Gestión de Roles
- Muestra una lista de los roles de proceso existentes y el número de miembros en cada uno.
- Permite la creación/edición de roles y la asignación/eliminación de miembros de un rol.

---

## 7. Depuración de Código (Refactorización)

Se realizó una sesión de limpieza de código para eliminar componentes y lógica que se habían vuelto obsoletos tras la implementación del nuevo módulo de administración.

- **Objetivo:** Centralizar la lógica de edición de usuarios y eliminar redundancias.
- **Archivos Eliminados:**
  - `src/lib/stores/userDetailStore.ts`: Store para un panel de detalles que fue reemplazado.
  - `src/lib/components/UserDetailPanel.svelte`: Componente de panel obsoleto.
- **Limpieza Adicional:**
  - Se eliminaron las referencias a los archivos borrados en `src/routes/+page.svelte`.
  - Se refactorizó `UserManagementView.svelte` para obtener los nombres de los roles de forma reactiva desde `processRoleStore`, eliminando una variable estática propensa a errores.

---

## 8. Análisis y Alistamiento para Integración Backend

Se ha realizado un análisis de la estructura de datos actual en el prototipo para evaluar su preparación para la integración con un backend. La estructura de los datos locales simula la forma en que se espera recibir los datos de las APIs backend para iniciar la integración.

### Análisis de Estructuras de Datos

- **`/src/lib/data/users.ts`**:
  - **Estructura:** Array de objetos `User` con propiedades `uid` (string), `displayName` (string), `email` (string), `systemRole` (string), `processRoles` (string[]), y `avatarUrl` (string).
  - **Identificadores:** Utiliza `uid` como identificador único, que es adecuado para mapear a IDs de backend.
  - **Relaciones:** Define la relación usuario-rol de proceso a través de un array de strings (`processRoles`).
  - **Preparación:** La estructura es clara y utiliza IDs únicos, lo que facilita la adaptación para consumir datos de un endpoint de usuarios.

- **`/src/lib/data/processModels.ts`**:
  - **Estructura:** Array de objetos con propiedades `id` (string), `name` (string), `description` (string), `version` (string), `lastModified` (string), y `bpmnXml` (string).
  - **Identificadores:** Utiliza `id` como identificador único para los modelos, adecuado para referenciar recursos de backend.
  - **Relaciones:** Centrado en los metadatos y el contenido XML del modelo; no define explícitamente relaciones con otras entidades fuera del modelo BPMN.
  - **Preparación:** La estructura es simple y utiliza IDs únicos. El principal punto a considerar es el manejo del `bpmnXml`, que puede ser grande.

- **`/src/lib/data/process-roles.ts`**:
  - **Estructura:** Array de objetos `ProcessRole` con propiedades `key` (string), `name` (string), y `description` (string).
  - **Identificadores:** Utiliza `key` como identificador, que puede mapearse a IDs de backend si es necesario.
  - **Relaciones:** Define la lista de roles disponibles, pero la asignación de roles a usuarios se maneja en `/src/lib/data/users.ts`.
  - **Preparación:** La estructura es sencilla y funcional para obtener una lista de roles.

**Conclusión del Análisis:**

La estructura de datos actual en el prototipo es un buen punto de partida para la integración backend. La mayoría de las entidades utilizan identificadores únicos y la separación de datos en archivos dedicados (`/src/lib/data/`) facilita su adaptación.

### 8.1 Modificaciones Propuestas al Prototipo

Para validar el alistamiento del frontend y prepararlo mejor para interactuar con un backend real, se proponen las siguientes modificaciones al prototipo:

1.  **Crear Servicios de Datos Simulados con Latencia y Manejo de Errores:**
    - **Objetivo:** Reemplazar el acceso directo a los arrays de datos locales en `/src/lib/data/` por funciones asíncronas que simulen llamadas a una API.
    - **Implementación:** Estas funciones introducirán retardos artificiales (simulando latencia de red) y, ocasionalmente, devolverán errores para permitir probar el manejo de estados de carga y error en la interfaz de usuario.
    - **Impacto:** Obligará a los componentes a manejar estados `loading` y `error` al obtener datos, mejorando la resiliencia del frontend.

2.  **Refactorizar la Carga de Modelos de Proceso para Carga a Demanda del XML:**
    - **Objetivo:** Optimizar la carga inicial de la lista de modelos de proceso y simular un escenario de backend donde el XML se obtiene por separado.
    - **Implementación:** Modificar la lógica para que el "servicio" simulado que lista los modelos de proceso devuelva solo los metadatos (sin `bpmnXml`). Crear una nueva función en el servicio simulado para "obtener modelo por ID", que incluya el `bpmnXml` y simule una llamada separada.
    - **Impacto:** La vista de lista de modelos será más rápida. La vista de detalle/editor de modelos deberá invocar la nueva función para cargar el XML completo solo cuando se necesite.

Estas modificaciones no cambian la estructura de datos esperada en el frontend, sino la forma en que se obtienen y manejan, alineándola más con la interacción con un sistema distribuido (backend). Una vez implementadas y validadas, servirán como base sólida para definir los requerimientos funcionales y técnicos del backend.