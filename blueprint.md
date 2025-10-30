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

## 10. Fase 2: Integración con Backend y Transición a Aplicación Funcional

En esta fase, el proyecto ha evolucionado de ser un prototipo basado en maquetas a una aplicación web completamente funcional, conectada a un backend real de Node.js/Express.js. Se ha establecido una arquitectura de comunicación robusta y se han integrado las funcionalidades operacionales clave del MVP.

### 10.1. Arquitectura de Comunicación y Entorno

- **Conexión a Backend Real:** Se estableció una conexión exitosa con el backend desplegado en un entorno de previsualización de Firebase Studio.
- **Resolución de CORS en Desarrollo:** Se implementó una solución de **proxy en Vite (`vite.config.ts`)** para resolver el bloqueo de dominios cruzados inherente al entorno de previsualización de Firebase Studio. Esto permite un desarrollo local fluido sin modificar la lógica de la aplicación para producción.
- **Gestión de Entorno Centralizada:** Se consolidó el uso de archivos `.env` para gestionar las URLs del backend y las credenciales de autenticación (cookies) para el entorno de desarrollo, utilizando las convenciones de SvelteKit (`PUBLIC_...`) y Vite (`loadEnv`).
- **Capa de Servicios de API:** Se implementó un `apiService.ts` robusto, responsable de todas las peticiones `fetch`. Este servicio centraliza la adición de cabeceras (como `Authorization` para el futuro), el manejo de respuestas y la **generación automática de notificaciones de error** para el usuario a través de un `toastStore`.

### 10.2. Módulos Funcionales Integrados

Los siguientes módulos ahora operan con datos 100% reales provenientes del backend:

- **Ciclo de Autenticación Completo:**
    - **Login:** El formulario de inicio de sesión se comunica con `POST /api/auth/login`, recibe un token JWT y los datos del usuario.
    - **Gestión de Estado:** El `authStore` gestiona de forma reactiva el estado del usuario en toda la aplicación.
    - **Persistencia de Sesión:** La sesión se restaura al recargar la página gracias al uso de `localStorage` y la función `initializeAuth`.
    - **Logout:** La funcionalidad de cierre de sesión limpia el estado y el almacenamiento local, redirigiendo al usuario de forma segura.
    - **UI Reactiva:** Los componentes principales (`Header`, `Sidebar`, `ProfilePanel`) reaccionan al estado de autenticación, mostrando la información del usuario conectado.

- **Bandeja de Tareas (`Mis Tareas`):**
    - La vista se alimenta del endpoint `GET /api/tasks/my-tasks`.
    - Muestra una lista de tareas asignadas al usuario autenticado, incluyendo detalles como el nombre del proceso, la descripción y la versión.
    - Gestiona estados de carga, error y cuando no hay tareas pendientes.

- **Lista de Instancias de Proceso (`Instancias`):**
    - La vista se alimenta del endpoint `GET /api/process-instances`.
    - Muestra y filtra las instancias "En Ejecución" e "Históricas".
    - Permite la navegación al detalle de cada instancia.

- **Detalle de Instancia de Proceso:**
    - Se activa al hacer clic en una tarea o en una instancia de la lista, llamando a `GET /api/process-instances/:id`.
    - Muestra información general del proceso y los **Datos de Negocio** (`businessDataFields`) de forma dinámica, tal como los define el backend.
    - **Trazabilidad:** Renderiza una línea de tiempo del proceso, extrayendo los nombres de las tareas y el orden directamente del array `taskInstances` de la respuesta.
    - **Observaciones:** Muestra un historial de comentarios, extrayéndolos de cada `taskInstance`.

- **Inicio de Nuevos Procesos:**
    - La vista `NewProcessView` carga la lista de procesos que se pueden iniciar desde `GET /api/processes`.
    - **Formulario de Inicio Dinámico:** Al seleccionar un proceso, se llama a `GET /api/processes/:id/start-form` para obtener la definición de los campos.
    - El componente `StartProcessFormView` renderiza dinámicamente un formulario con soporte para campos `TEXT`, `NUMBER`, `DATE` y `TEXTAREA`, respetando las validaciones de `isRequired`.
    - **Creación de Instancia:** El formulario, una vez validado y confirmado por el usuario, envía los datos a `POST /api/process-instances` para crear un nuevo caso.

- **Ejecución de Tareas:**
    - **Formulario de Tarea Dinámico:** Al abrir el panel de una tarea, se llama a `GET /api/tasks/:id/form` para obtener la definición del formulario.
    - El `TaskDetailPanel` renderiza los campos del formulario, respetando los valores pre-poblados y el estado de solo lectura (`isReadonly`).
    - **Completar Tarea:** El formulario permite al usuario seleccionar una acción y añadir comentarios, y envía la información al endpoint `POST /api/tasks/:id/complete` para avanzar el proceso.

---

## 11. Fase 3: Refactorización a Modelador Nativo con Svelte Flow

En esta fase, el proyecto realizó un pivote estratégico, abandonando la librería `bpmn-js` en favor de una solución de modelado nativa, más ligera y alineada con la arquitectura de Svelte, utilizando **`@xyflow/svelte`**. El objetivo fue eliminar la dependencia del estándar BPMN 2.0 XML y trabajar directamente con un modelo de datos JSON que mapea 1 a 1 con la estructura de la base de datos del backend.

### 11.1. Arquitectura y Funcionalidades Clave

- **Proveedor Global (`SvelteFlowProvider`):** La aplicación principal se envolvió en este proveedor en `src/routes/+page.svelte`, haciendo que el contexto de Svelte Flow (hooks como `useSvelteFlow`) esté disponible en todas las vistas, crucial para el funcionamiento del editor.

- **Vista del Editor (`NewProcessView.svelte`):** Este componente se convirtió en el centro neurálgico del modelador, integrando:
  - **Paleta de Nodos:** Un `PaletteSidebar` con 6 tipos de nodos arrastrables (Start, End, User Task, Auto Task, Exclusive Gateway, Parallel Gateway).
  - **Lienzo Interactivo:** Un lienzo de Svelte Flow que soporta la adición de nodos por `drag-and-drop`, creación de conexiones, y selección y eliminación de elementos (nodos y flechas).
  - **Paneles de Propiedades Dinámicos:** Una columna de propiedades que renderiza un panel específico según el elemento seleccionado:
    - **Panel de Proceso (Default):** Permite editar metadatos del proceso como `name`, `description`, `category` y `status`.
    - **Paneles de Nodos:** Paneles para `UserTask`, `AutoTask`, `Gateways`, etc., permitiendo configurar sus propiedades (rol, webhook, etiqueta, descripción, ID).
    - **Panel de Flechas (`Edge`):** Panel para secuencias de flujo, que muestra un campo para la `condition` si la flecha sale de un `ExclusiveGateway`.

- **Comunicación por Contexto y Stores:** Se implementó un sistema de comunicación robusto y desacoplado:
  - Un contexto de Svelte (`dnd-context`) para gestionar el estado del `drag-and-drop` entre la paleta y el lienzo.
  - Stores de Svelte (`writable`) para gestionar el estado de los nodos, las flechas y los metadatos del proceso.

### 11.2. Mejoras de UX y Lógica de Negocio

- **Flujos Condicionales:** Las condiciones se movieron de los nodos `Gateway` a las **flechas**, alineándose con el backend. Las flechas que salen de un `ExclusiveGateway` ahora tienen un estilo visual proactivo:
  - **Rojo y punteado:** Si la condición está vacía, alertando al usuario.
  - **Azul y sólido:** Si la condición ha sido rellenada.
- **Roles en Nodos:** Los nodos `UserTask` y `StartEvent` muestran un badge con el rol asignado, cargado dinámicamente desde el backend a través del `processRoleStore`.
- **Modo Oscuro:** Se integró el `colorMode` de Svelte Flow con el `theme` store existente en la aplicación, logrando una consistencia visual completa en ambos temas.
- **Flujo de Guardado:** Se implementó un flujo de guardado que, a través de un botón "Guardar", utiliza un modal de confirmación (`ConfirmModal`) y notificaciones (`Toast`) para recolectar todos los datos del modelo (metadatos, nodos y flechas) en un único `payload` JSON, listo para ser enviado al backend.

Con estos cambios, la maqueta del modelador se considera funcionalmente completa para la creación de nuevos procesos, finalizando la Fase 3 del desarrollo del frontend.

### 11.1. Nota de Corrección: Restauración de `NewProcessView`

Durante la implementación inicial de la Fase 3, el componente `NewProcessView.svelte` fue erróneamente modificado para albergar el nuevo editor de modelos. Este fue un error conceptual, ya que la función original de `NewProcessView` (documentada en la Fase 2) es la de listar procesos para **iniciar una nueva instancia**, no para **modelar una nueva definición**.

Este error fue identificado y corregido. La funcionalidad del editor de modelos se consolidó en su propia vista (`/#new-process-model`), y los archivos `NewProcessView.svelte` y `src/routes/+page.svelte` fueron restaurados a su estado funcional anterior, preservando la capacidad de iniciar nuevos procesos. Esta corrección asegura la coherencia del proyecto y separa correctamente las responsabilidades de cada componente.

---

## 12. Internacionalización (i18n)

Se ha implementado una estrategia de internacionalización gradual utilizando la librería `svelte-i18n` para permitir que la aplicación soporte múltiples idiomas.

- **Dependencia:** `svelte-i18n`
- **Configuración:**
  - **Archivos de Idioma:** Se han creado archivos JSON para cada idioma en `src/lib/i18n/` (e.g., `es.json`, `en.json`).
  - **Inicialización:** Un archivo `src/lib/i18n/index.ts` centraliza la configuración, registrando los idiomas y estableciendo `es` como el idioma por defecto (`fallbackLocale`).
  - **Carga Global:** La librería se inicializa en el layout raíz (`src/routes/+layout.svelte`) para asegurar que el contexto de i18n esté disponible globalmente. Se utiliza `waitLocale()` para prevenir que la aplicación se renderice antes de que se haya cargado el archivo de idioma inicial.

- **Patrón de Uso:**
  - **Importación:** En cada componente, se debe importar el store `_` de `svelte-i18n`.
  - **Sintaxis:** Los textos estáticos se reemplazan con `{$_('clave.de.traduccion')}`.
  - **Ejemplo:** `<h2>{$_('process_list.title')}</h2>`
- **Migración Gradual:** La estrategia consiste en migrar componentes uno por uno, comenzando con `ProcessListView.svelte` como prueba de concepto. Este enfoque permite una transición suave sin interrumpir el desarrollo.

---

## 13. Mejora de UX: Validación de Formularios en el Editor de Procesos

Se ha implementado una validación en tiempo real en el panel de propiedades del editor de procesos para mejorar la experiencia de usuario y la integridad de los datos.

- **Componentes Afectados:**
  - `src/lib/components/ProcessEditorView.svelte`
  - `src/lib/components/properties/ProcessPropertiesPanel.svelte`

- **Lógica Implementada:**
  1.  **Validación de Campos Obligatorios:** El `ProcessPropertiesPanel.svelte` ahora verifica que los campos "Business Process Key", "Nombre del Proceso" y "Descripción" no estén vacíos.
  2.  **Comunicación Padre-Hijo:** El panel de propiedades emite un evento `validation` en cada cambio (`on:input`) para notificar al editor principal (`ProcessEditorView.svelte`) sobre el estado de validez del formulario.
  3.  **Deshabilitación de Botones:**
      - El botón "Guardar Cambios" en la barra de acciones principal se deshabilita si el formulario de propiedades del proceso no es válido.
      - El botón "Actualizar Propiedades" dentro del propio panel también se deshabilita, asegurando una consistencia visual y funcional.

- **Solución Técnica al Desafío de Reactividad:**
  - **Problema:** Se encontró un desafío en el que la reactividad de Svelte (`$:`) no actualizaba el estado del botón local "Actualizar Propiedades" de manera consistente.
  - **Resolución:** La solución final fue abandonar las declaraciones reactivas (`$:`) para el control del botón y, en su lugar, asignar el estado de validez **imperativamente** a una variable local (`isValid`) dentro del manejador de eventos `handleUpdate`, que se ejecuta con cada pulsación de tecla. Esto garantiza que Svelte detecte el cambio y actualice la interfaz de usuario de forma fiable.
---

## 14. Avance en Internacionalización y Unificación Conceptual

Se ha continuado con la implementación de la internacionalización (i18n), aplicando las traducciones a la vista de creación de nuevas instancias y, al mismo tiempo, realizando un ajuste conceptual clave para unificar el lenguaje en toda la aplicación.

- **Componente Afectado:** `src/lib/components/NewProcessView.svelte`

- **Ajuste Conceptual:**
  - Se redefinió el propósito del componente `NewProcessView` para reflejar que su función es crear **instancias (casos)** a partir de **procesos**, y no "nuevos procesos".
  - Para estandarizar la terminología, se ha hecho un uso estratégico de la sección `concepts` en los archivos de idioma, que contiene las formas singular y plural de entidades clave como "Proceso", "Caso", "Tarea", etc.

- **Implementación de i18n:**
  1.  **Nuevas Traducciones:** Se creó una nueva sección `new_instance` en `en.json` y `es.json` para albergar los textos específicos de esta vista.
  2.  **Composición de Textos:** Se ha implementado una composición dinámica de textos para mejorar la reutilización y consistencia. Por ejemplo, el título se construye combinando `new_instance.title_prefix` y `concepts.instance_singular` para generar "Crear Nuevo Caso" o "Create New Case".
  3.  **Sintaxis Correcta:** Se ha aplicado la sintaxis correcta `{$_('clave.de.traduccion')}` para acceder a las traducciones desde el store de `svelte-i18n`.
  4.  **Actualización del Componente:** Todos los textos estáticos en `NewProcessView.svelte` han sido reemplazados por sus respectivas claves de i18n, haciendo que el componente sea completamente multilingüe y conceptualmente coherente con el resto de la aplicación.

## 15. Avances en Internacionalización (i18n) y estabilidad de formularios
  Se ha continuado de manera exhaustiva con la internacionalización de la aplicación, enfocándose en la reutilización de claves de idioma y la aplicación consistente de la terminología unificada a través de concepts.

  Estrategia de Reutilización:

  Se consolidó la práctica de complementar secciones de idioma existentes. Específicamente, todos los textos para los componentes de gestión de roles (RoleManagementContent.svelte y RoleEditPanel.svelte) se integraron dentro de la sección user_management, aprovechando su contexto compartido y evitando la duplicación.
  Componentes Adicionales Internacionalizados:

  StartProcessFormView.svelte: Se tradujo por completo el formulario para iniciar nuevas instancias de proceso.
  UserEditPanel.svelte: Se completó la internacionalización del panel de edición de usuarios.
  RoleManagementContent.svelte y RoleEditPanel.svelte: Se tradujeron las vistas y paneles para la gestión de roles.
  Solución de Bug Crítico de Reactividad en Formularios:

  Problema: Se detectó y diagnosticó un error de comportamiento en UserEditPanel.svelte donde el uso de la tienda {$_} dentro de las etiquetas <option> de un <select> con bind:value provocaba fallos en la renderización y funcionalidad del formulario.
  Solución Implementada: Se aplicó el patrón recomendado por Svelte para manejar opciones dinámicas. Se creó un array reactivo en el bloque <script> que contiene los objetos de las opciones (con value y label traducido). El <select> en el HTML fue modificado para iterar sobre este array con un bloque #each. Esta solución desacopla la reactividad de svelte-i18n del mecanismo de bind:value de Svelte, garantizando un comportamiento estable y predecible del formulario en todos los idiomas.

## 16. Visibilidad de Módulos Dinámica y Controlada por Backend
  Se ha implementado una mejora de arquitectura para que la visibilidad de los módulos en la barra de navegación lateral (Sidebar) sea controlada dinámicamente por los permisos definidos en el backend, en lugar de ser estática.

  Respuesta de API Modificada:
  Se adaptó el frontend para procesar la nueva respuesta del endpoint /auth/login, que ahora incluye un array modules al mismo nivel que user y token. Este array contiene los códigos de los módulos a los que el usuario autenticado tiene acceso (ej. ["DASH", "TASK", "ORG"]).

  Adaptación del Flujo de Autenticación:
  Tipo User Actualizado: La interfaz User en src/lib/types.ts fue extendida para incluir la propiedad opcional modules: string[].
  Lógica en authService: Se modificó authService.ts para que, tras un login exitoso, combine la información del user y el array modules en un único objeto de usuario antes de pasarlo al authStore.
  Persistencia de Sesión: Se robusteció el authStore.ts para asegurar que el objeto de usuario completo, incluyendo los modules, sea guardado y recuperado de localStorage, manteniendo la visibilidad de los módulos de forma persistente.

  Componente Sidebar Dinámico:
  El componente Sidebar.svelte ahora lee los modules del usuario desde el authStore.
  Cada elemento de la navegación está envuelto en una lógica condicional ({#if}). El elemento solo se renderiza si el código de módulo correspondiente está presente en la lista de permisos del usuario.

  Nota de Implementación:
  Se identificó y solucionó un caso inicial donde, después de la implementación, el Sidebar aparecía vacío. La causa era la persistencia de un objeto de usuario "antiguo" (sin modules) en localStorage. La solución consiste en cerrar y volver a iniciar sesión una vez para actualizar la estructura de datos en el navegador.

---
## 17. Gestión Avanzada de Campos de Formulario para Tareas

Se ha reemplazado la edición de `formFields` vía JSON por una interfaz de usuario interactiva y completa en el panel de propiedades del editor. Esta mejora permite a los usuarios gestionar los campos de formulario de una tarea de manera intuitiva, conectándose a una biblioteca de campos centralizada.

### 17.1. Arquitectura de Datos y Servicios

- **Capa de Datos Centralizada**: Se creó una nueva capa de abstracción para la "Biblioteca de Campos" del sistema.
    - **Servicio (`fieldDefinitionService.ts`)**: Responsable de comunicarse con el nuevo endpoint `GET /api/fields` para obtener todos los campos disponibles.
    - **Store (`fieldDefinitionStore.ts`)**: Un store de Svelte que gestiona el estado de la biblioteca de campos (carga, errores y datos), cachea los resultados y proporciona un `Map` para búsquedas rápidas por ID.
- **Modelo de Datos Enriquecido**:
    - El tipo `FormFieldPayload` fue actualizado para incluir el objeto `fieldDefinition` completo de forma anidada. Esto permite a la UI acceder a toda la información del campo (label, tipo, etc.) sin necesidad de búsquedas adicionales.
    - La lógica de carga en `ProcessEditorView` ahora popula el estado local con esta estructura de datos enriquecida.

### 17.2. Interfaz de Usuario Interactiva

El `textarea` para editar JSON en `TaskPropertiesPanel.svelte` fue eliminado y reemplazado por una interfaz rica y funcional:

- **Panel Expansible**: El panel de propiedades ahora se expande hacia la izquierda, mostrando una nueva sección dedicada a la gestión de formularios sin ocultar las propiedades originales del nodo. Esta animación es orquestada por el componente padre `ProcessEditorView.svelte`.
- **Selector de Campos**: Un dropdown con funcionalidad de búsqueda (`svelte-select`) permite a los usuarios buscar y añadir campos desde la biblioteca de campos cargada en el `fieldDefinitionStore`.
- **Lista Reordenable**:
    - Los campos vinculados a una tarea se muestran en una lista clara.
    - Se utiliza la librería `SortableJS` a través de un *action* de Svelte para permitir el reordenamiento de los campos mediante *drag-and-drop*. El `displayOrder` se recalcula automáticamente.
- **Controles en Línea**: Cada campo en la lista tiene controles directos para:
    - **Eliminar** el campo de la tarea.
    - Alternar las propiedades `isRequired` y `isReadonly` mediante checkboxes.
    - **Validaciones Contextuales**: Un botón de "código" despliega un `textarea` tipo acordeón para que el usuario pueda definir reglas de validación específicas en formato JSON para ese campo en el contexto de esa tarea.
- **Internacionalización**: Todos los nuevos textos de la interfaz han sido añadidos a los archivos `es.json` y `en.json`.

### 17.3. Lógica de Guardado Inteligente

- **Payload Limpio**: La función de guardado `executeSave` en `ProcessEditorView` fue actualizada para "limpiar" el array `formFields` antes de enviarlo a la API.
- **Manejo de IDs**: La lógica respeta las reglas del backend para operaciones CRUD:
    - **Crear**: Los campos nuevos se envían sin la propiedad `id`.
    - **Actualizar**: Los campos existentes se envían con su `id` correspondiente.
    - **Eliminar**: Los campos que se eliminan de la lista en la UI simplemente no se incluyen en el array `formFields` del payload final.
    - El objeto anidado `fieldDefinition` se elimina del payload, ya que es solo para uso del frontend.

## 18. Módulo de Gestión de Biblioteca de Datos

Se ha implementado un nuevo módulo completo, accesible desde la barra de navegación, para gestionar una "Biblioteca de Datos" (Data Library) centralizada. Esta biblioteca contiene las definiciones maestras de todos los campos de formulario (field definitions) que pueden ser reutilizados a lo largo de la aplicación, principalmente en los formularios de tareas del editor de procesos.

### 18.1. Arquitectura y Componentes Clave
Vista Principal (DataLibraryView.svelte):

Muestra una tabla con todos los campos de la biblioteca, incluyendo su etiqueta, nombre técnico y tipo.
Implementa una barra de búsqueda para filtrado en tiempo real.
Sigue la arquitectura visual y funcional establecida por UserManagementView, asegurando la consistencia en la UX.

Panel de Edición (FieldEditorPanel.svelte):

Un panel deslizante que permite la creación y edición de campos.
Validación Avanzada en Tiempo Real: Se implementó una lógica de validación robusta que habilita el botón de guardado solo si se cumplen todas las condiciones necesarias, incluyendo la configuración completa de campos complejos.
Limpieza de Inputs: Utiliza una nueva función utilitaria (sanitizeTechnicalName) para limpiar automáticamente el campo "Nombre Técnico", eliminando espacios y caracteres especiales.
Interfaz Dinámica para Tipos Complejos: El panel renderiza una interfaz de usuario específica según el tipo de campo seleccionado:
SELECT: Muestra un botón "Configurar Opciones" que abre un modal para definir las etiquetas y valores de las opciones.
GRID: Muestra un campo para dataSource y una lista para definir las columnas, permitiendo especificar el nombre, etiqueta y tipo de cada una.
SELECT dentro de GRID: De forma anidada, si una columna es de tipo SELECT, también muestra un botón para configurar sus opciones a través de un modal, reutilizando la misma lógica para una UX consistente.
Indicadores Visuales: Los botones de "Configurar Opciones" usan íconos y colores (naranja/alerta si está incompleto, verde/check si está completo) para dar feedback instantáneo al usuario sobre el estado de la configuración.

Componente Reutilizable (DataTable.svelte):

Se refactorizó la lógica de la tabla en un componente genérico ubicado en src/lib/components/utils/.
Funcionalidad Encapsulada: El componente maneja internamente la búsqueda, el ordenamiento por columnas y la paginación (con selector de tamaño de página).
Flexibilidad con Slots: Utiliza un patrón de slot único (slot="cell") que expone los datos de la fila y la columna al componente padre, permitiendo una personalización completa del renderizado de las celdas (ej. para badges, botones de acción, etc.).

Capa de Servicio y Estado:
fieldDefinitionService.ts: Se completó el servicio para incluir todas las operaciones CRUD (create, update, delete) contra la API /fields.

fieldDefinitionStore.ts: El store fue extendido para manejar estas operaciones, actualizando el estado de la aplicación de forma reactiva y evitando la necesidad de recargar los datos del servidor tras cada modificación.

## 19. Centralización de Formularios Dinámicos y Nuevos Tipos de Campo
Se ha ejecutado una refactorización arquitectónica clave para centralizar la lógica de renderizado de formularios dinámicos, eliminando la duplicación de código y facilitando la extensibilidad. Adicionalmente, se ha dotado a este nuevo sistema de la capacidad de manejar tipos de campo complejos como SELECT y GRID.

### 19.1. Arquitectura y Componentes Clave
- Creación del Componente DynamicForm.svelte:
  - Se desarrolló un nuevo componente utilitario en src/lib/components/utils/DynamicForm.svelte.
  - Este componente es ahora el único responsable de renderizar formularios a partir de una definición (fields).
  - Soporta un modo editable (para la creación y edición de datos) y un modo de solo lectura (readonly), reutilizando la misma lógica de renderizado para mostrar los datos.

- Creación del Componente EditableGrid.svelte:
  - Para manejar la complejidad del tipo de campo GRID, se creó un sub-componente en src/lib/components/utils/EditableGrid.svelte.
  - Encapsula toda la lógica para la creación de tablas dinámicas, incluyendo la adición y eliminación de filas y el renderizado de celdas con distintos tipos de input (TEXT, NUMBER, DATE, SELECT).

- Refactorización de Vistas: Se refactorizaron tres componentes clave para que utilicen DynamicForm.svelte, eliminando su lógica de renderizado interna:
  - StartProcessFormView.svelte (para iniciar nuevas instancias).
  - TaskDetailPanel.svelte (para el formulario de tarea y la vista de detalles).
  - ProcessDetailView.svelte (para la vista de solo lectura de los datos del proceso).

### 19.2. Implementación de Nuevos Tipos de Campo
Campo SELECT:
- DynamicForm ahora puede renderizar un <select> a partir de la definición fieldType: 'SELECT'.
Las opciones del desplegable se leen desde el array field.validations.options.
Se corrigió la lógica de visualización para mostrar siempre el label de la opción, tanto en el modo de edición como en el de solo lectura.

Campo GRID:
Se implementó el renderizado de una tabla editable cuando se encuentra fieldType: 'GRID'.
La definición de las columnas se lee desde field.validations.columns.
El componente EditableGrid soporta anidamiento, permitiendo que una columna de la tabla sea a su vez de tipo SELECT.
Se aplicaron estilos unificados para mejorar la UX y la consistencia visual con el resto de la aplicación.

### 19.3. Mejoras de Lógica y Validación
Inicialización de Datos: Se corrigió la lógica en StartProcessFormView y TaskDetailPanel para que los campos de tipo GRID se inicialicen siempre como un array vacío ([]) en lugar de null, solucionando problemas de reactividad al añadir la primera fila.

Manejo de Datos en Solo Lectura: Se ajustó la preparación de datos en las vistas de solo lectura para "aplanar" los valores de los SELECT (extrayendo el value de objetos {label, value}), asegurando que el DynamicForm pueda mostrar el label correcto.

Validación de GRID Obligatorio: Se robusteció la lógica de validación del formulario (isFormInvalid). Un campo GRID definido como obligatorio ahora se considera inválido si:

No tiene al menos una fila.
Cualquiera de sus celdas en cualquier fila está vacía.

Internacionalización (i18n): Se añadieron todas las nuevas etiquetas de texto de la interfaz del EditableGrid a los archivos en.json y es.json, asegurando una experiencia de usuario completamente localizada.