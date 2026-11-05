<!--
SYNC IMPACT REPORT
==================
Version change: plantilla sin versionar (placeholders) → 1.0.0 (ratificación inicial)
Bump rationale: primera adopción; reemplaza la plantilla completa de Spec Kit.

Principios definidos (nuevos):
  I.    Arquitectura en capas y flujo unidireccional
  II.   Contrato con el backend verificado primero
  III.  Svelte 5 con runes para código nuevo
  IV.   Internacionalización obligatoria
  V.    Seguridad en el cliente
  VI.   Calidad sin regresión (quality gates medibles)
  VII.  Simplicidad, reutilización y cero código mock en producción
  VIII. UX consistente, accesible y con tema claro/oscuro

Secciones añadidas:
  - Fase del proyecto: construcción y piloto / demo (reglas relajadas y criterios de salida de fase)
  - Stack y librerías aprobadas
  - Arquitectura en capas y reglas de dependencia
  - Estructura de carpetas, nombres y scaffolding
  - Componentes, stores, servicios y manejo de errores
  - i18n, estilos y accesibilidad
  - Seguridad en cliente
  - Calidad y quality gates (incluye la lista de chequeo para el "Constitution Check" de plan.md)
  - Excepciones aplicadas (desviaciones aceptadas temporalmente)
  - Prácticas NO recomendadas a continuar (anti-patrones)
  - Flujo de desarrollo con Spec Kit
  - Governance

Secciones eliminadas: ninguna. Los slots [SECTION_2_NAME]/[SECTION_3_NAME] de la plantilla se sustituyeron por
las secciones anteriores; no quedan tokens entre corchetes.

Plantillas dependientes (leen la constitución en tiempo de ejecución; esta enmienda no las modifica):
  ✅ .specify/templates/plan-template.md: su "Constitution Check" debe copiar la tabla de gates G1–G12 de la
     sección "Calidad y quality gates". Es compatible sin cambios.
  ✅ .specify/templates/spec-template.md: sin cambios requeridos.
  ✅ .specify/templates/tasks-template.md: sin cambios requeridos. Las tareas deben incluir el gate de calidad
     (svelte-check/eslint por archivo).
  ⚠ README.md y GEMINI.md: desactualizados respecto a esta constitución; ver el blueprint §13.6.
     Pendiente de una feature de documentación.

TODOs diferidos:
  - TODO(BASELINE): actualizar la línea base de svelte-check/eslint cada vez que se reduzca (ver Governance).
  - TODO(AUTH_STORAGE): definir la estrategia de almacenamiento del token a largo plazo (EX-03).
  - TODO(TESTS): adoptar Vitest + @testing-library/svelte mediante enmienda MINOR (hoy no hay pruebas).

Documento de referencia funcional: /blueprint.md (raíz del repo).
-->

# Flowify BPM Frontend Constitution

Constitución del cliente web `sveltekit-bpm` de Flowify BPMS. Rige todo código nuevo o modificado en este
repositorio y es la fuente de los gates del "Constitution Check" de cada `plan.md` generado con Spec Kit.

Convenciones:
- MUST/MUST NOT significa obligatorio; SHOULD/SHOULD NOT, recomendado, con desviación justificada en el plan.
- Las citas `archivo:línea` se refieren al estado de `main` @ `661ed4b` (2026-11-05).

## Fase del proyecto: construcción y piloto / demo

Flowify está en **fase de construcción, piloto y demo**. No existen ambientes de QA ni de producción, y no
los habrá hasta que el producto esté lo suficientemente armado para entrar en la dinámica de producto
oficial. La app se usa en local y para demos, con datos de demo.

Por eso, en esta fase la prioridad es **completar y estabilizar la funcionalidad**, no endurecer el cliente.
Las brechas de seguridad y los mocks que documenta `blueprint.md` §13.1 y §13.4 son **conocidos y
aceptados** mientras dure la fase, y no bloquean el trabajo.

**Lo que se relaja en esta fase (pasa de MUST a SHOULD):**

| Regla | Dónde | En fase piloto |
|---|---|---|
| Sin credenciales ni contraseñas por defecto en el código | Principio V, G5, AP-04 | Se mantienen las credenciales precargadas del login y la contraseña inicial de usuarios, para agilizar demos. |
| Guard de módulos en el router | Principio V, G5 | SHOULD. Ocultar el botón en el Sidebar es suficiente en el piloto. |
| Token JWT en `localStorage` | EX-03 | Se mantiene así. |
| Sin datos mock ni maquetas en vistas | Principio VII, G7, AP-05, EX-05, EX-06 | Permitidos, sin marcado especial: dashboard hardcodeado, mocks y placeholders. En esta fase toda la app es demo. |
| Pruebas automáticas | Principio VI | Ya era SHOULD; sigue así. |

**Lo que sigue siendo MUST también en esta fase**, porque es barato de cumplir y caro de corregir después:
capas y `apiService` (I); contrato con el backend verificado (II); runes en componentes nuevos (III);
i18n (IV); no usar `{@html}` con datos dinámicos en código nuevo; sesión solo vía `authService`/`authStore`;
calidad sin regresión (VI); UX y tema claro/oscuro (VIII).

**Criterios de salida de fase.** Antes de crear el primer ambiente de QA o producción MUST:
1. Hacer una enmienda (MINOR) que elimine esta sección y devuelva a MUST todas las reglas de la tabla.
2. Resolver o aceptar por escrito: AP-03 y AP-04 en el código existente, el guard de módulos en el router,
   EX-03 (almacenamiento del token), EX-05/EX-06 (dashboard y mocks), EX-09 (restos de Firebase), y los
   hallazgos C/A de `blueprint.md` §13.1.
3. Revisar los mocks, placeholders y datos hardcodeados (blueprint §13.4 y EX-05/EX-06) y decidir qué se
   retira o reemplaza.

## Core Principles

### I. Arquitectura en capas y flujo unidireccional

El código MUST respetar la cadena **routes → views/components → stores → services → apiService → backend**.

- Toda llamada HTTP MUST pasar por `src/lib/services/apiService.ts` (`get/post/put/patch/del`). Ningún componente,
  store o utilidad MUST usar `fetch` directamente.
- Cada recurso del backend MUST tener un servicio en `src/lib/services/<recurso>Service.ts`. Los componentes nuevos
  SHOULD consumir datos a través de un store. Llamar al servicio desde el componente solo es aceptable para
  acciones puntuales de escritura que no alimentan estado compartido, como completar una tarea.
- Las capas inferiores MUST NOT importar capas superiores:
  - los servicios no importan stores de dominio ni componentes;
  - los stores no importan componentes.
  Única excepción: `authService` ↔ `authStore`/`toast`, ya existente.
- La navegación entre vistas MUST hacerse por el hash router de `src/routes/+page.svelte`. MUST NOT añadirse rutas
  de archivo de SvelteKit (`src/routes/**/+page.svelte`) sin una enmienda de esta constitución.

*Justificación:* la app ya tiene ese esqueleto (`apiService` centraliza token, 401 y toasts). Saltárselo duplica el
manejo de errores y rompe el cierre de sesión por expiración.

### II. Contrato con el backend verificado primero

- Antes de planificar una feature que consuma el API, el plan MUST listar cada endpoint (método + ruta) con su
  ubicación en `my-bpm-back-express/src/api/**` (`archivo:línea`).
  - Si el endpoint no existe, la spec MUST declarar el trabajo de backend como dependencia. El frontend MUST NOT
    darlo por existente. Hay un precedente: `GET /fields` no existe y el form builder quedó inutilizable.
- Los tipos en `src/lib/types.ts` MUST reflejar los nombres reales del backend: atributos Sequelize en camelCase.
  MUST NOT enviarse campos que el backend ignora en silencio (precedente: `webhook_target`/`sla_definition`).
- Todo campo nuevo del payload MUST verificarse de punta a punta: que se guarda, que se devuelve en el GET y que el
  editor o la vista lo recarga.
- Las restricciones de permisos del backend (`isAdmin`) MUST reflejarse en la UI: el módulo del menú y los mensajes
  de error.

*Justificación:* las brechas más graves del producto son de contrato, no de UI (ver blueprint §13.2).

### III. Svelte 5 con runes para código nuevo

- Todo **componente nuevo** MUST escribirse en modo runes:
  - `$props()`, `$state()`, `$derived()`, `$effect()`;
  - callback props (`onsave`, `onclose`) en lugar de `createEventDispatcher`;
  - atributos de evento (`onclick`) en lugar de `on:click`;
  - snippets y `{@render}` en lugar de `<slot>`.
- Un mismo componente MUST NOT mezclar runes con sintaxis legacy (`export let`, `$:`). Svelte no lo permite.
- Al **modificar** un componente legacy existente, se MAY mantener la sintaxis legacy si el cambio es acotado.
  - Si el cambio reescribe más del 50 % del script o añade una funcionalidad sustancial, el componente SHOULD
    migrarse completo a runes dentro de la misma feature.
  - La migración MUST registrarse en el plan.
- Interoperabilidad: un hijo nuevo con runes usado por un padre legacy MUST recibir los callbacks como props
  (`<Hijo onsave={handler} />`), no con `on:save`.
- Los stores siguen el patrón `svelte/store` (ver la sección de stores). MUST NOT introducirse stores basados en
  clases `.svelte.ts` con runes sin una enmienda.
- MUST usarse `$app/state` en lugar de `$app/stores`, y `goto`/`pushState` de `$app/navigation` en lugar de
  `history.pushState`.

*Justificación:* el repo declara Svelte 5, pero tiene 0 runes; seguir escribiendo Svelte 4 aumenta la deuda de
migración. La adopción incremental evita reescrituras masivas.

### IV. Internacionalización obligatoria

- Ningún texto visible por el usuario MUST quedar hardcodeado en componentes, stores o servicios: etiquetas,
  placeholders, `title`, `alt`, toasts, mensajes del modal, valores por defecto y nombres de la paleta.
  Todo MUST usar `$_('grupo.clave')` de `svelte-i18n`.
- Cada clave nueva MUST añadirse **a la vez** en `src/lib/i18n/es.json` y `src/lib/i18n/en.json`. Hoy hay 287 claves
  simétricas y la simetría MUST mantenerse.
- Los valores de enumeración del backend (status, systemRole, acciones) MUST mostrarse traducidos con claves del
  tipo `enums.status.RUNNING`. **Los valores persistidos MUST ser códigos estables, nunca texto traducido**
  (precedente: acciones guardadas como "Aprobar").
- Las fechas y los números MUST formatearse con el locale activo (`$locale`), no con `toLocaleString()` sin
  argumentos.
- Los mensajes de error técnicos (p. ej. `'An unknown error occurred'`) MUST mapearse a claves i18n antes de
  mostrarse.

*Justificación:* la app es bilingüe por diseño. Los textos sueltos son el anti-patrón más extendido (blueprint §10).

### V. Seguridad en el cliente

- MUST NOT incluirse credenciales, contraseñas por defecto, tokens ni URLs privadas en el código fuente ni en los
  valores iniciales de formularios.
- MUST NOT usarse `{@html}` con datos que provengan del usuario o del backend. Para texto enriquecido de i18n se
  MUST usar marcado en la plantilla, no `{@html}`. Única excepción: `Icon.svelte`, que inyecta SVG estático interno.
- La sesión MUST gestionarse solo con `authService` + `authStore`. MUST NOT leerse ni escribirse `localStorage` de
  sesión desde otros archivos.
- Las claves de `localStorage` MUST declararse en un único lugar. Las claves nuevas MUST NOT duplicar información
  existente (ver AP-07).
- Toda vista nueva protegida por módulo MUST verificar `user.modules` **también en el router**, no solo ocultar el
  botón del Sidebar.
- Las variables de entorno expuestas al cliente MUST ser `PUBLIC_*` y no sensibles.

*Justificación:* hay credenciales precargadas, una contraseña fija y XSS vía `{@html}` (blueprint §13.1).

*Aplicación por fase:* en la fase piloto / demo, las reglas de credenciales por defecto y del guard de
módulos en el router son SHOULD (ver "Fase del proyecto"). Las demás reglas de este principio son MUST
desde ya.

### VI. Calidad sin regresión (quality gates medibles)

- Todo archivo **creado** en una feature MUST quedar con **0 errores y 0 warnings** en `svelte-check` y 0 errores
  en ESLint, y MUST estar formateado con Prettier.
- Todo archivo **modificado** MUST NOT aumentar su número de diagnósticos de `svelte-check`/ESLint.
- El total del repositorio MUST NOT superar la línea base vigente. Línea base 2026-11-05:
  - `svelte-check`: 62 errores / 54 warnings;
  - ESLint: 96 errores.
- MUST NOT desactivarse reglas (`// eslint-disable`, `// @ts-ignore`, `<!-- svelte-ignore -->`) sin justificarlo
  en el plan.
- Lógica nueva no trivial (transformaciones, reglas de negocio, utilidades) SHOULD incluir pruebas cuando exista la
  infraestructura de pruebas (TODO(TESTS)). Mientras no exista, la verificación manual MUST documentarse en
  `quickstart.md` de la feature.

*Justificación:* hoy ningún comando de calidad pasa. La única vía realista es congelar la deuda y no aumentarla.

### VII. Simplicidad, reutilización y cero código mock en producción

- Antes de crear un componente, store o utilidad, MUST buscarse uno existente reutilizable. La lógica duplicada en
  dos o más lugares MUST extraerse a `src/lib/utils/` o a un componente compartido cuando una feature toque esa
  lógica (p. ej. timeline/comentarios, formulario dinámico).
- MUST NOT añadirse datos mock ni maquetas a rutas de producción. Los mocks permitidos solo pueden vivir en pruebas.
  Las vistas placeholder MUST mostrar un estado vacío honesto, no datos inventados.
- MUST NOT extenderse código muerto identificado en el blueprint §13.4. Si una feature lo necesita, primero lo
  revive y lo integra, o lo elimina.
- MUST NOT añadirse dependencias sin justificarlo en el plan (ver Stack).

*Aplicación por fase:* en la fase piloto / demo, las reglas sobre mocks, maquetas y datos inventados son
SHOULD: se permiten para demos. Las reglas de reutilización, código
muerto y dependencias son MUST desde ya.

### VIII. UX consistente, accesible y con tema claro/oscuro

- Toda vista con carga remota MUST presentar los estados **loading**, **error** y **vacío**.
- Las confirmaciones MUST usar el store `modal`; las notificaciones, el store `toast`. MUST NOT crearse modales o
  toasts ad hoc.
- Los colores MUST provenir de las variables CSS del layout (`--bg-*`, `--text-*`, `--border-color`,
  `--accent-color`) o de utilidades Tailwind con variante `dark:`. MUST NOT usarse colores fijos que rompan el modo
  oscuro.
- Los componentes nuevos MUST pasar las reglas a11y de `svelte-check`:
  - elementos interactivos semánticos (`<button>`);
  - `label` asociado a su control;
  - overlays operables con teclado (Escape) y con `role`.

## Stack y librerías aprobadas

| Paquete | Versión instalada | Uso aprobado | Reglas |
|---|---|---|---|
| `svelte` | 5.38.x | UI | Runes en código nuevo (principio III). |
| `@sveltejs/kit` | 2.38.x | Contenedor SPA, `$env`, `$app/*` | Una sola ruta. Hash router. |
| `@sveltejs/adapter-auto` | 6.x | Build | Cambiar el adapter requiere enmienda. |
| `vite` | 7.1.x | Dev/Build | — |
| `typescript` | 5.9.x | Todo el código (`lang="ts"`) | `strict` activo; no relajar `tsconfig.json`. |
| `@xyflow/svelte` | 1.3.x | **Único** motor del modelador | Usar la API 1.x: callbacks `onconnect`, `onreconnect`, `onbeforedelete` (async), `bind:nodes` **y** `bind:edges`. |
| `svelte-i18n` | 4.0.x | i18n es/en | Única librería de i18n. |
| `tailwindcss` | 3.4.x (+ `postcss`, `autoprefixer`) | Utilidades y `@layer components` en `app.css` | Config efectiva: `tailwind.config.cjs`. No migrar a v4 sin enmienda. |
| `svelte-select` | 5.8.x | Select con búsqueda | Solo donde se necesite búsqueda. |
| `sortablejs` | 1.15.x | Reordenar listas por arrastre | Envolver en una acción Svelte. |
| `eslint` 9 / `typescript-eslint` 8 / `eslint-plugin-svelte` 3 / `prettier` 3 (+ plugins svelte y tailwind) / `svelte-check` 4 | — | Calidad | Configuraciones actuales vigentes. |

**Librerías NO aprobadas** (no añadir sin enmienda MINOR):
- otra librería de diagramas (`bpmn-js`, `jointjs`…);
- otra librería de estado (Redux, Zustand…);
- un cliente HTTP alternativo (`axios`…);
- otra librería de i18n;
- otra librería de UI o componentes (Skeleton, Flowbite…);
- librerías de iconos (usar `Icon.svelte`);
- `moment` (usar `Intl`).

**Candidatas a eliminar** (requieren una feature de limpieza con verificación):
- `firebase` y `@firebase/app-check`: sin imports;
- `svelte-preprocess`: sustituir por `vitePreprocess`;
- `tailwind.config.ts`: duplicado ignorado;
- `@tailwindcss/forms` y `@tailwindcss/typography`: no registrados;
- los CSS de `src/lib/vendor/bpmn-styles/`: sin uso;
- el proxy `/api` y `FIREBASE_COOKIE` de `vite.config.ts`.

Hasta que se eliminen, MUST NOT usarse en código nuevo.

## Arquitectura en capas y reglas de dependencia

| Capa | Ubicación | Puede importar | MUST NOT importar |
|---|---|---|---|
| Shell / router | `src/routes/+layout.svelte`, `src/routes/+page.svelte` | vistas, componentes globales, stores | servicios (salvo `authService` en el layout) |
| Vistas | `src/lib/components/*View.svelte` | subcomponentes, stores, `utils`, `actions`, i18n | `apiService` |
| Paneles / subcomponentes | `src/lib/components/**` | stores, `utils`, `actions`, i18n | `apiService`; otras vistas |
| Stores | `src/lib/stores/*.ts` | servicios, tipos, otros stores (con moderación) | componentes |
| Servicios | `src/lib/services/*Service.ts` | `apiService`, tipos | componentes, stores de dominio |
| Cliente HTTP | `src/lib/services/apiService.ts` | `$env/static/public`, store `toast` | todo lo demás |
| Utilidades | `src/lib/utils/*.ts` | tipos | componentes, stores, servicios |
| Tipos | `src/lib/types.ts` | — | — |

## Estructura de carpetas, nombres y scaffolding

```
src/
├── app.css                       # Tailwind + @layer components globales
├── routes/
│   ├── +layout.svelte            # shell, tokens de tema (:root / :root.dark), globales
│   └── +page.svelte              # hash router + overlays
└── lib/
    ├── actions/                  # acciones Svelte (use:x)       → camelCase.ts  (tooltip.ts)
    ├── components/               # vistas y componentes          → PascalCase.svelte
    │   ├── *View.svelte          #   una por entrada del router
    │   ├── *Panel.svelte         #   paneles laterales / overlays
    │   ├── layout/               #   piezas de layout reutilizables (Tabs, PaletteSidebar)
    │   ├── nodes/                #   nodos SvelteFlow            → <Tipo>Node.svelte
    │   ├── edges/                #   aristas SvelteFlow          → <Nombre>Edge.svelte
    │   ├── properties/           #   paneles de propiedades      → <Tipo>PropertiesPanel.svelte
    │   └── role-management/      #   subcomponentes de usuarios/roles
    ├── data/                     # SOLO fixtures de pruebas (hoy: mocks muertos, ver EX-06)
    ├── i18n/                     # index.ts, es.json, en.json
    ├── services/                 # <recurso>Service.ts + apiService.ts
    ├── stores/                   # <dominio>Store.ts (camelCase)
    ├── utils/                    # funciones puras                → kebab-case.ts (process-transformer.ts)
    ├── vendor/                   # CSS de terceros (hoy sin uso, candidato a eliminar)
    └── types.ts                  # tipos de dominio y de payload
```

**Convenciones de nombres:**
- Componentes en PascalCase. Vistas con sufijo `View`; paneles con `Panel`.
- Stores en camelCase con sufijo `Store` (excepciones históricas: `toast`, `modal`, `theme`).
- Servicios: `<recurso>Service` exportado como instancia o como objeto.
- Claves i18n en `snake_case`, agrupadas por vista o dominio.
- Hashes de ruta en `kebab-case`.
- Los códigos de módulo en MAYÚSCULAS coinciden con el backend.

### Plantilla: nueva vista (entrada del hash router)

1. Crear `src/lib/components/<Nombre>View.svelte` en runes:

   ```svelte
   <script lang="ts">
     import { onMount } from 'svelte';
     import { _ } from 'svelte-i18n';
     import Icon from '$lib/components/Icon.svelte';
     import { fooStore } from '$lib/stores/fooStore';

     let { onnavigate }: { onnavigate?: (view: string, context?: unknown) => void } = $props();

     onMount(() => { fooStore.fetchAll(); });
   </script>

   <div class="view-container">
     <header class="view-header">
       <div>
         <h1 class="header-title">{$_('foo.title')}</h1>
         <p class="header-description">{$_('foo.description')}</p>
       </div>
     </header>
     {#if $fooStore.loading}
       <div class="state-placeholder">{$_('foo.loading')}</div>
     {:else if $fooStore.error}
       <div class="state-placeholder error">{$_('foo.error')}</div>
     {:else if $fooStore.items.length === 0}
       <div class="state-placeholder">{$_('foo.empty')}</div>
     {:else}
       {#each $fooStore.items as item (item.id)} … {/each}
     {/if}
   </div>
   ```

2. Registrar la rama en `src/routes/+page.svelte` **con guard de módulo**, por ejemplo
   `{:else if currentView === 'foo' && hasModule('FOO')}`. Usar un helper compartido; la primera feature que lo
   necesite MUST crearlo en `src/lib/utils/`.
3. Si va en el menú: añadir la entrada a `moduleMap` y el botón en `Sidebar.svelte`, con el icono de `Icon.svelte`
   y la clave `sidebar.*`.
4. Añadir las claves en `es.json` y `en.json`.
5. Confirmar con el backend que el módulo existe en `system_role_modules` para los roles que corresponda.

### Plantilla: nuevo nodo de SvelteFlow

1. `src/lib/components/nodes/<Tipo>Node.svelte` en runes:

   ```svelte
   <script lang="ts">
     import { Handle, Position, type NodeProps } from '@xyflow/svelte';
     let { data, selected }: NodeProps = $props();
   </script>
   <div class="node" class:selected>
     <Handle type="target" position={Position.Left} />
     <span>{data.label}</span>
     <Handle type="source" position={Position.Right} />
   </div>
   ```

   Los colores van con variables CSS y su variante para `:global(.dark)`.
2. Registrarlo en `nodeTypes` (`ProcessEditorView.svelte:145-152`).
3. Añadirlo a la paleta (`layout/PaletteSidebar.svelte`) con la etiqueta i18n.
4. Definir sus datos iniciales en `onDrop` (`ProcessEditorView.svelte:397-424`), con labels i18n.
5. Mapear el tipo en `typeMapping` de `utils/process-transformer.ts` y los campos específicos en camelCase según el
   modelo Sequelize.
6. Añadir el literal a `ProcessElementPayload.type` en `types.ts`.
7. Asignar un panel de propiedades en `ProcessEditorView.svelte:515-552`, reutilizando
   `BasicPropertiesPanel` si basta.
8. Verificar que el motor del backend soporta el tipo (`BE: engine/processEngine.service.js`). Si no lo soporta,
   la spec MUST declararlo (principio II).

### Plantilla: nuevo store

```ts
// src/lib/stores/fooStore.ts
import { writable } from 'svelte/store';
import type { Foo } from '$lib/types';
import { fooService } from '$lib/services/fooService';

interface FooState { items: Foo[]; loading: boolean; error: string | null; }

function createFooStore() {
  const { subscribe, update } = writable<FooState>({ items: [], loading: false, error: null });
  return {
    subscribe,
    async fetchAll() {
      update((s) => ({ ...s, loading: true, error: null }));
      try {
        const items = await fooService.getAll();
        update((s) => ({ ...s, items, loading: false }));
      } catch (e) {
        update((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'unknown' }));
      }
    }
  };
}
export const fooStore = createFooStore();
```

- **Stores de detalle u overlay:** forma `{ isOpen, item, loading, error }` con `show(id)` / `hide()`, como
  `taskDetailStore` y `processDetailStore`.
- Exponer `set` MUST evitarse; las mutaciones van por métodos con nombre.
- En `catch`, el error MUST tratarse como `unknown` (no `error.message` directo).
- El store MUST NOT mostrar toasts de error: ya lo hace `apiService`.

### Plantilla: nuevo servicio

```ts
// src/lib/services/fooService.ts
import { get, post } from './apiService';
import type { Foo, FooPayload } from '$lib/types';

export const fooService = {
  getAll: () => get<Foo[]>('/foos'),
  create: (payload: FooPayload) => post<Foo>('/foos', payload)
};
```

- **Sin try/catch ni `console.error` redundantes:** `apiService` ya registra el error, muestra el toast y relanza.
  Solo se añade try/catch si el servicio transforma el error.
- Cada método MUST corresponder a un endpoint verificado (principio II) y llevar su JSDoc con método y ruta.

## Componentes, stores, servicios y manejo de errores

- **Props:** se tipan siempre. En runes: `let { a, b = 1 }: Props = $props()`. En legacy: `export let a: T`.
- **Eventos:** en código nuevo, callback props (`onclose`, `onsave`). MUST NOT usarse `createEventDispatcher` en
  componentes nuevos.
- **Composición:** en código nuevo, snippets (`{#snippet}` / `{@render}`). `<slot>` solo en legacy.
- **Estado local vs global:**
  - el estado de una sola vista vive en el componente (`$state`);
  - un store solo se justifica si el estado se comparte entre componentes no anidados, sobrevive a la navegación o
    abre overlays desde otra vista.
- **Overlays y paneles laterales:**
  - los paneles de detalle globales se abren con un store (`taskDetailStore.show`) y se montan en `+page.svelte`;
  - los paneles locales (`UserEditPanel`, `RoleEditPanel`) se montan desde su vista con `{#if}`;
  - todo panel nuevo MUST cerrarse con Escape, con un botón visible en **todos** sus estados (incluidos loading y
    error) y con el backdrop accesible.
  - Un componente base de panel SHOULD crearse en la primera feature que añada un panel nuevo, y reutilizarse.
- **Toasts y modal:** `toast.show(msg, 'success'|'error')` y `modal.show({title, message, onConfirm})`, con textos
  i18n. Si `apiService` ya mostró el error, el componente MUST NOT mostrar un segundo toast con el mismo mensaje.
- **Errores:**
  - `apiService` convierte las respuestas no-OK en `Error(message)`, muestra un toast y relanza;
  - un 401 con sesión dispara `authService.expireSession()`;
  - los componentes MUST conservar los datos que el usuario ingresó cuando falla un envío (no reemplazar el
    formulario por el estado de error).

## i18n, estilos y accesibilidad

- **i18n:** ver el principio IV.
  - Los textos con formato MUST usar parámetros (`{ values: { name } }`) y marcado en la plantilla, no `{@html}`.
  - Los labels por defecto en código (nodos, procesos nuevos) también van traducidos.
- **Estilos:**
  - prioridad 1: clases utilitarias de Tailwind y componentes de `app.css`;
  - prioridad 2: CSS scoped con variables del layout.
  - MUST NOT reimplementarse utilidades de Tailwind a mano en CSS scoped (ver AP-10).
  - Los tokens nuevos MUST definirse en `:root` **y** en `:root.dark` de `+layout.svelte`.
  - MUST NOT usarse variables inexistentes (p. ej. `--bg-hover`).
- **Modo oscuro:** lo controla la clase `dark` en `<html>` (`stores/theme.ts`). Todo componente nuevo MUST verse
  correctamente en ambos temas.
- **Accesibilidad:**
  - `<button>` para acciones;
  - `<a href>` para navegación;
  - `label for` en los inputs;
  - foco visible;
  - contraste AA;
  - elementos arrastrables con `role` y una alternativa de teclado cuando sea viable.

## Seguridad en cliente

- **Token JWT:** hoy vive en `localStorage` (EX-03) y en memoria en `apiService`. Toda funcionalidad nueva MUST
  obtener el usuario de `authStore` y MUST NOT leer `localStorage` directamente.
- **Expiración:** la gestiona `authService.scheduleExpiration` / `expireSession`, junto con el handler de 401 de
  `apiService`. MUST NOT duplicarse esta lógica.
- **Permisos:**
  - la UI oculta lo que el usuario no puede usar (`user.modules`);
  - el router MUST bloquear el acceso directo por hash en vistas nuevas;
  - la autorización real es del backend.
- **Datos sensibles:** MUST NOT registrarse en consola payloads con datos personales ni contraseñas.

## Calidad y quality gates

**Comandos:**
- `npm run check`: svelte-check;
- `npm run lint`: prettier --check + eslint;
- `npm run format`: prettier --write;
- `npx svelte-check --tsconfig ./tsconfig.json --output human`: detalle de diagnósticos.

**Estado actual (2026-11-05):** ningún comando pasa a nivel de repo.
- svelte-check: 62 errores / 54 warnings;
- ESLint: 96 errores;
- Prettier: ~116 archivos sin formato;
- no hay pruebas.

**Gates del "Constitution Check".** Copiar esta tabla en `plan.md`. Cada gate se marca PASS, FAIL o N/A con su
evidencia:

| Gate | Verificación | Principio |
|---|---|---|
| G1 | Ningún componente, store o utilidad nueva usa `fetch`; todo el HTTP pasa por `apiService`. Las dependencias entre capas respetan la tabla de arquitectura. | I |
| G2 | Cada endpoint consumido está listado con `archivo:línea` del backend, o la spec declara el trabajo de backend. Payload y tipos coinciden con los nombres Sequelize. | II |
| G3 | Los componentes nuevos usan runes; no hay `createEventDispatcher`, `export let` ni `$:` en archivos nuevos; se usa `$app/state`. | III |
| G4 | No hay texto visible nuevo sin `$_()`. Las claves se añadieron en es **y** en en. Los valores persistidos no dependen del idioma. Fechas con locale. | IV |
| G5 | Sin credenciales en código, sin `{@html}` con datos dinámicos, guard de módulo en vistas nuevas, sin accesos nuevos a `localStorage` de sesión. *Fase piloto: credenciales de demo y guard de módulo son SHOULD.* | V |
| G6 | Archivos nuevos: 0 errores y 0 warnings en svelte-check y 0 en ESLint, con Prettier aplicado. Archivos modificados: diagnósticos sin aumento. Totales del repo ≤ línea base. | VI |
| G7 | Sin mocks en producción, sin dependencias nuevas no justificadas, sin extender código muerto. Duplicación tocada → extraída. *Fase piloto: mocks permitidos.* | VII |
| G8 | Estados loading, error y vacío presentes. Modal y toasts globales. Sin toasts duplicados. | VIII |
| G9 | Correcto en tema claro y oscuro; solo variables existentes. | VIII |
| G10 | a11y: sin warnings a11y nuevos en svelte-check; overlays con Escape y botón de cerrar. | VIII |
| G11 | Para el modelador: se respeta la API de `@xyflow/svelte` 1.x (`bind:edges`, `onreconnect`, `onbeforedelete` async); el transformer y el backend se actualizan juntos. | II, III |
| G12 | `quickstart.md` documenta la verificación manual en `http://localhost:5173` contra el backend local. | VI |

Las violaciones justificadas MUST registrarse en la tabla "Complexity Tracking" del plan, con la referencia a la
excepción (EX-xx) si aplica.

## Excepciones aplicadas

Son desviaciones existentes, **aceptadas temporalmente**. No justifican repetir el patrón en código nuevo.

EX-03, EX-05, EX-06 y EX-09 son además **criterios de salida de fase**: pueden quedarse así durante el
piloto, pero MUST resolverse o aceptarse por escrito antes de crear un ambiente de QA o producción (ver
"Fase del proyecto").

| ID | Desviación | Ubicación | Motivo | Salida esperada |
|---|---|---|---|---|
| EX-01 | Componentes en sintaxis Svelte 4 (legacy) sobre Svelte 5 | Todos los `.svelte` de `src/` (0 runes) | Base heredada; migrar todo de golpe es riesgoso | Migración incremental (principio III) |
| EX-02 | Hash router manual en lugar de rutas de SvelteKit | `src/routes/+page.svelte:35-92` | SPA ya construida sobre hash; los overlays dependen de él | Se mantiene; cualquier cambio requiere enmienda |
| EX-03 | JWT en `localStorage` | `authStore.ts:41`; `authService.ts:74` | El backend no emite cookies httpOnly | TODO(AUTH_STORAGE) junto con el backend |
| EX-04 | Vistas que llaman servicios directamente | `ProcessEditorView.svelte`, `ProcessModelListView.svelte:13-23`, `StartProcessFormView.svelte:22-35`, `RoleEditPanel.svelte:30` | Estado puramente local de la vista | Mover a store cuando la vista se modifique sustancialmente |
| EX-05 | Dashboard con datos hardcodeados | `DashboardView.svelte:16-79` | No existe API de métricas | Reemplazar al crear endpoints de dashboard |
| EX-06 | Mocks en `src/lib/data/` | `processModels.ts`, `users.ts`, `process-roles.ts` | Restos de la maqueta; sin importadores | Eliminar en una feature de limpieza |
| EX-07 | CSS vendor de bpmn-js importado globalmente | `+layout.svelte:4-6` | Heredado; retirarlo requiere verificación visual | Eliminar tras validarlo |
| EX-08 | `ProcessPropertiesPanel` muta el objeto del store por `bind:value` | `ProcessPropertiesPanel.svelte:57-106` | Funciona por efecto colateral | Pasar a callbacks al migrar el panel |
| EX-09 | Proxy `/api` y `FIREBASE_COOKIE` en Vite; dependencias `firebase` | `vite.config.ts:29-46`; `package.json` | Restos de Firebase Studio | Eliminar |
| EX-10 | Dos configs de Tailwind y `svelte-preprocess` | `tailwind.config.ts`, `svelte.config.js:2,7` | Heredado | Consolidar en `.cjs` + `vitePreprocess` |
| EX-11 | Línea base de calidad incumplida | Repo completo (blueprint §12) | Deuda previa | Reducir progresivamente; ver Governance |
| EX-12 | Toasts de error con mensaje técnico o en inglés del backend | `apiService.ts:29-32,76`; `StartProcessFormView.svelte:71` | El backend no devuelve códigos de error | Mapear a i18n cuando el backend exponga códigos |

## Prácticas NO recomendadas a continuar

Son anti-patrones detectados. MUST NOT repetirse en código nuevo. Al tocar código que los contiene, SHOULD
corregirse. Excepción de fase: AP-04 (credenciales de demo) y AP-05 (mocks) se
permiten durante el piloto / demo.

| ID | Anti-patrón | Dónde se observa | Alternativa correcta |
|---|---|---|---|
| AP-01 | Textos visibles hardcodeados | `DashboardView.svelte`, `PaletteSidebar.svelte:17-42`, `ConfirmModal.svelte:7-10`, `Header.svelte:12`, `ProcessEditorView.svelte:132,207,212,410-418`, `AddMemberPanel.svelte`, `TaskDetailPanel.svelte:120,124` | `$_('clave')` en es/en (principio IV) |
| AP-02 | Sintaxis Svelte 4 en archivos nuevos (`export let`, `$:`, `on:`, `createEventDispatcher`, `$$props`, `<slot>`) | Todo el repo (EX-01) | Runes, callback props y snippets |
| AP-03 | `{@html}` con datos interpolados | `TaskDetailPanel.svelte:314`; `ProcessDetailView.svelte:134` | Marcado en la plantilla con parámetros i18n |
| AP-04 | Credenciales o contraseñas en código | `LoginView.svelte:7-8`; `UserEditPanel.svelte:101` | Campos vacíos; contraseña generada o invitada por el backend |
| AP-05 | Datos mock o maquetas en vistas productivas | `DashboardView.svelte:16-79`; `src/lib/data/*`; `TaskFormModal.svelte`; `AddMemberPanel.svelte` | Datos del API o un estado vacío honesto |
| AP-06 | Lógica duplicada entre componentes | `TaskDetailPanel.svelte:56-148` vs `ProcessDetailView.svelte:20-68`; formulario dinámico en `TaskDetailPanel.svelte:189-208` vs `StartProcessFormView.svelte:116-133` | Extraer a `utils/` o a un componente compartido (p. ej. `DynamicForm`) |
| AP-07 | Claves de `localStorage` duplicadas o inconsistentes (`authUser` vs `user`) | `authStore.ts:17,42,61`; `authService.ts:75,100,129,163` | Una sola clave por dato, definida en un solo módulo |
| AP-08 | `try/catch` + `console.error` en cada servicio, y toast propio además del global | `*Service.ts`; `TaskDetailPanel.svelte:124-125`; `ProcessEditorView.svelte:132-133`; `ProcessModelListView.svelte:19` | Confiar en `apiService`; el componente solo gestiona el estado |
| AP-09 | Valores persistidos dependientes del idioma | `TaskPropertiesPanel.svelte:209-211` | Códigos estables (`approve`) y etiqueta traducida aparte |
| AP-10 | Utilidades Tailwind reescritas a mano en CSS scoped; colores fijos sin modo oscuro | `Header.svelte:95-120`; `ConfirmModal.svelte:46-82`; `Toast.svelte:49-54` | Tailwind o variables del layout |
| AP-11 | Efectos con llamadas al API dentro de bloques `$:` | `RoleEditPanel.svelte:24-40` | `$effect` con dependencias explícitas o carga en `onMount` |
| AP-12 | Usar APIs inexistentes o deprecadas de librerías (`on:edgeupdate`, `edges` sin `bind:`, `$app/stores`, `history.pushState`) | `ProcessEditorView.svelte:213,489,492`; `+page.svelte:2`; `Sidebar.svelte:4` | Consultar la API de la versión instalada; `$app/state`, `$app/navigation` |
| AP-13 | Fechas con `toLocaleString()` sin locale y orden sobre strings formateados | `TaskDetailPanel.svelte:60-108`; `ProcessDetailView.svelte:24-57` | Ordenar por `Date` ISO y formatear al final con `Intl` y `$locale` |
| AP-14 | Listeners globales de teclado que no filtran el foco | `ProcessEditorView.svelte:315,444` | Ignorar eventos con origen en `input`, `textarea` o `select` |
| AP-15 | Suscripciones manuales sin desuscribir | `ProfilePanel.svelte:21-25`; `authService.ts:157-160` | `$store` en componentes o `get(store)` en módulos |
| AP-16 | Componentes globales montados dos veces | `+page.svelte:63-64` y `+layout.svelte:79-87` | Un solo montaje en `+layout.svelte` |
| AP-17 | Props no declaradas (`Icon spinning`) o con tipo incorrecto (`size="32"`) | 11 usos de `spinning`; `ProcessDetailView.svelte:77,82` | Declarar y tipar la prop o no pasarla |
| AP-18 | Unión `T \| {}` para "nuevo vs existente" | `UserEditPanel.svelte:13`; `RoleEditPanel.svelte:13`; `UserManagementView.svelte:25-26` | `T \| null` o un modo explícito (`mode: 'create' \| 'edit'`) |

## Flujo de desarrollo con Spec Kit

1. **`/speckit-specify`.** Describir el *qué* y el *por qué*. Citar `blueprint.md` para el contexto funcional y
   declarar las dependencias de backend.
2. **`/speckit-clarify`.** Resolver las ambigüedades antes de planificar, en especial el contrato de API y los
   permisos por módulo.
3. **`/speckit-plan`.**
   - Completar el "Constitution Check" con los gates G1–G12.
   - Listar los endpoints con `archivo:línea` del backend.
   - Declarar los archivos nuevos y modificados, y las excepciones que apliquen.
   - Registrar la línea base de diagnósticos de los archivos que se modificarán.
4. **`/speckit-tasks`.** Cada historia incluye tareas de i18n (es/en), de estados loading/error/vacío y una tarea
   final de quality gate (svelte-check/eslint/prettier sobre los archivos tocados).
5. **`/speckit-analyze`.** Consistencia spec ↔ plan ↔ tasks ↔ constitución antes de implementar.
6. **`/speckit-implement`.** Implementar y volver a correr los gates G6 y G10. Verificar manualmente según
   `quickstart.md`, con el backend local en `:3000`.
7. **Cierre.**
   - Si la feature cambia vistas, flujos, contrato o reglas de negocio, actualizar `blueprint.md` en el mismo cambio.
   - Si reduce diagnósticos, actualizar la línea base (Governance).

## Governance

- Esta constitución prevalece sobre `GEMINI.md`, `README.md` y cualquier convención informal. `blueprint.md`
  describe el estado del producto; la constitución, cómo se construye.
- **Enmiendas:** se proponen con `/speckit-constitution`, con un Sync Impact Report. Requieren la revisión de al
  menos un desarrollador del equipo distinto del autor, y actualizar las plantillas o documentos afectados en el
  mismo cambio.
- **Versionado semántico:**
  - **MAJOR:** se elimina o redefine un principio, o se cambia la arquitectura (p. ej. abandonar el hash router).
  - **MINOR:** un principio o sección nueva, una librería aprobada nueva, una excepción nueva.
  - **PATCH:** aclaraciones, erratas o actualizar la línea base de calidad hacia abajo.
- **Cumplimiento:**
  - toda revisión de código y todo `plan.md` MUST verificar los gates G1–G12;
  - las violaciones sin justificación en "Complexity Tracking" bloquean el merge;
  - las excepciones EX-xx se revisan en cada enmienda MINOR o MAJOR y se eliminan cuando se resuelven.
- **Línea base de calidad:** solo puede bajar. Cuando una feature reduce los totales de svelte-check o ESLint, el
  autor MUST actualizar las cifras de los principios VI y "Calidad y quality gates" mediante una enmienda PATCH.
- **Cambio de fase:** el paso de piloto / demo a producto oficial MUST hacerse con una enmienda MINOR que elimine
  la sección "Fase del proyecto", devuelva a MUST las reglas relajadas y verifique los criterios de salida.
- **Guía de ejecución:** `blueprint.md` en la raíz del repo es la referencia funcional y técnica para el día a día.

**Version**: 1.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
