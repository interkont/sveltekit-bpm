# Blueprint: Flowify BPM (frontend `sveltekit-bpm`)

> **Estado del documento:** reescrito el 2026-11-05 sobre `main` @ `661ed4b` ("Redirige al login cuando la
> sesión expira"). Reemplaza al blueprint anterior, que describía un editor basado en `bpmn-js`.
> Lo que aún sirve de aquel documento se conserva en la sección [16. Histórico](#16-histórico).
>
> **Convenciones de este documento:**
> - Las rutas son relativas a la raíz del repo `sveltekit-bpm/`.
> - `BE:` indica rutas del backend hermano `my-bpm-back-express/src/`.
> - Las citas tienen el formato `archivo:línea`.
> - "Pendiente de confirmar" marca lo que no se pudo verificar en el código.
>
> **Documento hermano:** las reglas para construir código nuevo están en `.specify/memory/constitution.md`.
> Si este blueprint y la constitución se contradicen, prevalece la constitución.

> **Fase del proyecto: construcción y piloto / demo.** Flowify todavía no tiene ambientes de QA ni de
> producción, y no los tendrá hasta estar lo suficientemente armado para entrar en la dinámica de producto
> oficial. Por eso, las brechas de seguridad (credenciales precargadas, contraseña inicial fija, token en
> `localStorage`, sin guard de módulos) y los mocks o datos hardcodeados descritos en §13 son **conocidos
> y aceptados en esta fase**: se documentan para no perderlos de vista y deben resolverse antes del primer
> ambiente de QA o producción. Las prioridades C/A de §13.1 miden el riesgo para ese momento, no un
> bloqueo actual. Qué reglas se relajan y cuáles son los criterios de salida está en la sección "Fase del
> proyecto" de la constitución.

---

## Índice

1. [Propósito del producto](#1-propósito-del-producto)
2. [Stack tecnológico (versiones instaladas)](#2-stack-tecnológico-versiones-instaladas)
3. [Arquitectura y arranque](#3-arquitectura-y-arranque)
4. [Mapa de vistas (hash router)](#4-mapa-de-vistas-hash-router)
5. [Flujos funcionales de punta a punta](#5-flujos-funcionales-de-punta-a-punta)
6. [Modelo de datos del cliente (`src/lib/types.ts`)](#6-modelo-de-datos-del-cliente-srclibtypests)
7. [Catálogo de llamadas al API](#7-catálogo-de-llamadas-al-api)
8. [Reglas de negocio implementadas en el cliente](#8-reglas-de-negocio-implementadas-en-el-cliente)
9. [Estado global: stores y componentes globales](#9-estado-global-stores-y-componentes-globales)
10. [Internacionalización (i18n)](#10-internacionalización-i18n)
11. [Estilos, tema claro/oscuro y layout](#11-estilos-tema-clarooscuro-y-layout)
12. [Calidad: svelte-check, ESLint y Prettier (estado real)](#12-calidad-svelte-check-eslint-y-prettier-estado-real)
13. [Brechas, inconsistencias y deuda técnica](#13-brechas-inconsistencias-y-deuda-técnica)
14. [Cómo levantar en local](#14-cómo-levantar-en-local)
15. [Evolución del repositorio (git log)](#15-evolución-del-repositorio-git-log)
16. [Histórico](#16-histórico)

---

## 1. Propósito del producto

**Flowify** es un BPMS (Business Process Management System). Este repositorio contiene su **cliente web**, una SPA
escrita en SvelteKit que consume el API REST de `my-bpm-back-express` (Express + Sequelize).

El cliente permite:

- **Autenticarse.** Usa JWT; la sesión expira a las 8 h (`BE: api/auth/auth.service.js:34`). El menú lateral
  muestra los módulos que el backend devuelve para el rol de sistema del usuario.
- **Trabajar la bandeja de tareas:** listar las tareas pendientes del usuario o de sus roles de proceso, abrir el
  detalle, diligenciar el formulario dinámico, elegir una acción, comentar y completar la tarea.
- **Consultar solicitudes, es decir, instancias de proceso:** listado "en curso / histórico" y detalle con
  información general, trazabilidad, datos de negocio y comentarios.
- **Iniciar un proceso:** elegir una definición `ACTIVE`, llenar el formulario de inicio y crear la instancia.
- **Modelar procesos** con un editor visual propio sobre `@xyflow/svelte` (SvelteFlow):
  - nodos de inicio, fin, tarea de usuario, tarea automática, gateway exclusivo y gateway paralelo;
  - condiciones en las flechas;
  - roles asignados y formularios por tarea;
  - guardado con versionado y cambio de estado (DRAFT/ACTIVE/INACTIVE).
- **Administrar usuarios y roles de proceso** (CRUD).
- **Personalizar** el perfil, el tema claro/oscuro y el idioma (es/en).

Las pantallas **Dashboard**, **Librería de datos** y **Log de reglas** existen en el menú, pero hoy son maqueta o
placeholder. Ver §5.2, §5.8 y §5.9.

---

## 2. Stack tecnológico (versiones instaladas)

Versiones leídas de `node_modules/*/package.json`. Los rangos están en `package.json`.

| Paquete | Versión | Uso real |
|---|---|---|
| `svelte` | 5.38.10 | Framework UI. **Todos los componentes compilan en modo legacy (Svelte 4)**: no hay ni una rune en `src/` (ver §12.4). |
| `@sveltejs/kit` | 2.38.1 | Solo como contenedor. Hay una única ruta (`src/routes/+page.svelte`) y la navegación interna es por hash. |
| `@sveltejs/adapter-auto` | 6.1.0 | Adapter de build (`svelte.config.js:1`). |
| `vite` | 7.1.5 | Dev server y build (`vite.config.ts`). |
| `typescript` | 5.9.2 | `strict: true` (`tsconfig.json:10`). |
| `@xyflow/svelte` | 1.3.1 | Modelador de procesos (`ProcessEditorView.svelte`, `nodes/`, `edges/`). |
| `svelte-i18n` | 4.0.1 | i18n es/en (`src/lib/i18n/`). |
| `tailwindcss` | 3.4.17 | Utilidades y `@apply` en `src/app.css`. Config efectiva: `tailwind.config.cjs` (`vite.config.ts:16`). |
| `@tailwindcss/forms`, `@tailwindcss/typography` | 0.5.x | Instalados como devDependencies, pero **no están registrados** en `plugins: []` de ninguna config de Tailwind. |
| `svelte-select` | 5.8.3 | Selector de campos de la librería en `properties/TaskPropertiesPanel.svelte:9`. |
| `sortablejs` (+ `@types/sortablejs`) | 1.15.6 | Reordenar campos del formulario (`TaskPropertiesPanel.svelte:10,122-134`). |
| `firebase`, `@firebase/app-check` | 12.3.0 / 0.11 | **Sin uso.** No hay ningún import en `src/`. Son restos de Firebase Studio. |
| `svelte-preprocess` | 6.0.3 | Preprocesador en `svelte.config.js:2,7`. Redundante con `vitePreprocess` (ver §13). |
| `svelte-check` / `eslint` / `prettier` | 4.3.1 / 9.35.0 / 3.6.2 | Calidad. Hoy ninguno de los tres pasa (ver §12). |

Requisito de Node: `>=20.19.0` (`package.json:51`, con `engine-strict=true` en `.npmrc`).

---

## 3. Arquitectura y arranque

### 3.1 Capas

```
src/routes/+layout.svelte   → shell: CSS global, i18n, tema, initializeAuth, Sidebar/Header, Toast, ConfirmModal, ProfilePanel
src/routes/+page.svelte     → hash router (#vista/param) + overlays de detalle (TaskDetailPanel, ProcessDetailView)
        │
        ▼
src/lib/components/*View.svelte, *Panel.svelte   (vistas y paneles)
src/lib/components/{nodes,edges,properties,layout,role-management}/  (subcomponentes)
        │  (suscripción $store, llamadas a métodos del store o, en algunos casos, directo al servicio)
        ▼
src/lib/stores/*.ts      → writable custom { subscribe, fetchX, show/hide, ... } con estado {data, loading, error}
        │
        ▼
src/lib/services/*.ts    → clases/objetos por recurso (authService, taskService, ...), con try/catch + console.error
        │
        ▼
src/lib/services/apiService.ts → fetch + Bearer token + toast global de error + handler de 401
        │
        ▼
PUBLIC_API_BASE_URL (p. ej. http://localhost:3000/api)  → backend Express
```

Excepciones a esta jerarquía, que hoy existen en el código:

- Varias vistas llaman **directamente al servicio**, sin pasar por un store:
  - `ProcessEditorView.svelte` → `processDefinitionService`;
  - `ProcessModelListView.svelte:13-23`;
  - `StartProcessFormView.svelte:22-35`;
  - `TaskDetailPanel.svelte:119` → `taskService.completeTask`;
  - `RoleEditPanel.svelte:30` → `processRoleService.getRoleById`.
- Algunos stores dependen de otros stores: `processRoleStore.ts:4,57,69` → `userStore`.

### 3.2 Secuencia de arranque

1. `+layout.svelte:2-6` importa `app.css` y **tres CSS vendor heredados de bpmn-js**. Estos CSS no se usan; ver §16.
2. `+layout.svelte:10` importa `$lib/i18n`, que registra es/en y llama a `init()`.
   - Locale inicial (`i18n/index.ts:10-26`): `localStorage['user-locale']`, luego el idioma del navegador, luego `es`.
3. En `onMount` (`+layout.svelte:28-35`):
   - `theme.init()` aplica o quita la clase `dark` en `<html>`;
   - `authService.initializeAuth()` restaura el token y el usuario desde `localStorage` y programa la expiración;
   - `await waitLocale()`.
   - Hasta que el locale carga, **no se renderiza nada** (`isLocaleLoaded`, `:60`).
4. Si hay token, el layout muestra `Sidebar` + `Header` + `<slot/>` (`:62-72`). Si no, solo `<slot/>`, y
   `+page.svelte:66-67` muestra `LoginView`.
5. Componentes globales montados en el layout: `Toast`, `ConfirmModal` (ligado al store `modal`) y `ProfilePanel`
   (ligado a `profilePanelStore`) (`:79-91`).
   - **Duplicado:** `+page.svelte:63-64` vuelve a montar `<Toast/>` y un `<ConfirmModal/>` sin props. Así, cada
     toast se renderiza dos veces, superpuesto en la misma esquina (ver §13).

### 3.3 Router por hash

Archivo: `src/routes/+page.svelte:35-46`.

- Lee `$page.url.hash`, quita el `#` y separa en `view` y `params` por `/`. Solo se toma el **primer segmento**
  como parámetro.
- Vista por defecto: `dashboard` (`:43`).
- **Navegación:**
  - el Sidebar asigna `window.location.hash` (`Sidebar.svelte:29-31`);
  - las vistas emiten `dispatch('navigate', {view, context})`, que `+page.svelte:54-59` traduce a
    `viewContext = context; location.hash = view`;
  - algunos componentes usan `href="/#..."` (`ProcessModelListView`) o `history.pushState`
    (`ProcessEditorView.svelte:213`).
- **No hay guard de módulos en el router.** Escribiendo el hash a mano se entra a cualquier vista; solo el backend
  protege (`isAdmin`).
- Un hash desconocido muestra el área de contenido **en blanco**: la cadena `{#if}` no tiene `{:else}`
  (`+page.svelte:70-92`).
- Los overlays `TaskDetailPanel` y `ProcessDetailView` **no tienen ruta**: dependen de
  `$taskDetailStore.isOpen` / `$processDetailStore.isOpen` (`:95-101`). No hay deep-link a una tarea ni a una
  instancia.
- Todas las vistas van dentro de `<SvelteFlowProvider>` (`:69-93`), necesario para `useSvelteFlow()` en el editor.

---

## 4. Mapa de vistas (hash router)

El módulo es el código que devuelve `/auth/login` en `modules`. `Sidebar.svelte:13-21` traduce cada vista a su
módulo y oculta el botón si el usuario no lo tiene (`:23-27`).

Asignación de módulos por rol de sistema:
- **ADMIN:** todos.
- **USER:** DASH, TASK, INST. Este dato viene de la tabla `system_role_modules` del backend
  (`BE: models/system-role-module.model.js`). El seed no está en el repo: *Pendiente de confirmar*.

| Hash | Componente | Módulo | Qué muestra / acciones | Stores / servicios |
|---|---|---|---|---|
| (sin token) | `LoginView.svelte` | — | Formulario email/contraseña. "Recordarme" y "Olvidé mi contraseña" son decorativos (`LoginView.svelte:57-63`). | `authService.login` |
| `#dashboard` (default) | `DashboardView.svelte` | DASH | KPIs, gráficas (`SimpleBarChart`, `DonutChart`), "mis tareas", actividad, procesos lentos, modelos recientes. **100 % datos hardcodeados** (`DashboardView.svelte:16-79`). Sin acciones. | ninguno |
| `#tasks` | `TaskListView.svelte` | TASK | Tarjetas de tareas pendientes. Botón Refrescar; "Gestionar" abre `TaskDetailPanel`. | `taskListStore`, `taskDetailStore` |
| *(overlay)* | `TaskDetailPanel.svelte` | — | Pestaña Formulario (campos dinámicos, acción, comentarios, completar). Pestaña Detalles (info, timeline, datos de negocio, comentarios, documentos vacíos). | `taskDetailStore`, `taskListStore`, `taskService`, `modal`, `toast` |
| `#processes` | `ProcessListView.svelte` | INST | Instancias en pestañas "En curso" (`RUNNING`) e "Histórico". "Nueva instancia" lleva a `#new-process`; "Ver detalles" abre `ProcessDetailView`. | `processListStore`, `processDetailStore` |
| *(overlay)* | `ProcessDetailView.svelte` | — | Detalle de la instancia, solo lectura: info general, timeline, datos de la solicitud, comentarios, documentos ("próximamente"). | `processDetailStore` |
| `#new-process` | `NewProcessView.svelte` | INST (vía Processes) | Definiciones `ACTIVE` disponibles. "Seleccionar" lleva a `#start-process-form` con la definición en memoria. *El nombre engaña: no es el modelador.* | `processDefinitionStore` |
| `#start-process-form` | `StartProcessFormView.svelte` | INST | Formulario de inicio: descripción obligatoria más los campos del START_EVENT. Confirmar crea la instancia. Si se recarga la página, se ve en blanco (`viewContext` nulo). | `processDefinitionService.getStartForm`, `processInstanceService.createInstance` |
| `#process-models` | `ProcessModelListView.svelte` | PROC | Tarjetas de **todas las versiones** de todas las definiciones (`GET /processes/all`, solo admin). "Crear" lleva a `#new-process-model`. | `processDefinitionService.getAllProcesses` |
| `#new-process-model` | `ProcessEditorView.svelte` (sin `processId`) | PROC | Modelador en modo `create`. | ver §5.6 |
| `#process-model-detail/{id}` | `ProcessEditorView.svelte processId={id}` | PROC | Modelador en modo `view`; Editar pasa a `edit`. Permite guardar (con versionado), eliminar y guardar metadatos. | ver §5.6 |
| `#users` | `UserManagementView.svelte` | ORG | Pestañas Usuarios / Roles (`layout/Tabs.svelte`). CRUD de usuarios (`UserEditPanel`) y de roles con miembros (`RoleEditPanel`). | `userStore`, `processRoleStore`, `modal`, `toast` |
| `#data-library` | `DataLibraryView.svelte` | LIBFORM | **Placeholder**: solo cabecera (`DataLibraryView.svelte:13-15`). | ninguno |
| `#rules-log` | `RulesLogView.svelte` | LOG | **Placeholder**: solo cabecera (`RulesLogView.svelte:13-15`). | ninguno |
| *(global)* | `ProfilePanel.svelte` | — | Se abre al hacer clic en el avatar del Header. Permite editar nombre, cambiar contraseña, cambiar idioma, ver roles y cerrar sesión. | `authStore`, `authService.updateProfile`, `profilePanelStore` |

Elementos del Header (`Header.svelte`):
- **Buscador:** decorativo; no tiene lógica y el placeholder está hardcodeado (`:12`).
- **Campana de notificaciones:** falsa, con un punto animado permanente (`:24-30`).
- **Toggle de tema** (`:16`).
- **Avatar**, que abre `ProfilePanel` (`:35`).

---

## 5. Flujos funcionales de punta a punta

### 5.1 Login y sesión

**Login** (`LoginView.svelte:12-27` → `authService.login`, `authService.ts:52-86`):

1. `POST /auth/login {email, password}` responde `{user, token, modules}` (`BE: auth/auth.service.js:5-40`).
2. Se transforma el usuario (`authService.ts:61-65`):
   - `processRoles = user.roles.map(r => r.name)`;
   - `modules = response.modules`.
3. Se fija la sesión:
   - `setAuthToken(token)` en el módulo `apiService`;
   - `authStore.set({user, token})`, que persiste en `localStorage` las claves `authToken` y `authUser`
     (`authStore.ts:38-49`);
   - `scheduleExpiration(token)`.
4. **Además**, `authService` persiste `authToken` y `user` (`authService.ts:73-76`). Hay claves duplicadas e
   inconsistentes; ver §13.
5. `goto('/')` (`LoginView.svelte:17`).

**Particularidades del login:**
- `LoginView.svelte:7-8` **precarga las credenciales `admin@flowify.com` / `admin123`**. Riesgo de seguridad; ver §13.
- Con credenciales inválidas, el BE lanza un `Error` sin `statusCode`. El middleware global responde 500 con el
  texto "Something broke!" (`BE: api/middlewares/error.middleware.js:18-21`). El usuario ve
  "HTTP error! Status: 500 Internal Server Error" (`apiService.ts:29-32`), no "credenciales inválidas".

**Restauración de la sesión al recargar:**
- `authStore` lee `authToken` + `authUser` al crearse (`authStore.ts:11-30`).
- Luego `authService.initializeAuth()` (`authService.ts:126-143`) lee `authToken` + `user`, llama a
  `setAuthToken` y reprograma la expiración.
- Sin `initializeAuth` el `apiService` no tendría token: el token del API vive en una variable de módulo, no en el
  store.

**Expiración (commit `661ed4b`):**
- `getTokenExpiration` decodifica `exp` del JWT (`authService.ts:11-19`).
- `scheduleExpiration` programa un `setTimeout` que llama a `expireSession()` (`:116-121`).
- `expireSession()` hace `logout()` y muestra el toast `login.session_expired` (`:107-111`).
- `apiService`: si la respuesta es **401 y había token**, llama al handler registrado
  (`setUnauthorizedHandler`, `authService.ts:178`) y lanza `UnauthorizedError`, que no muestra el toast genérico
  (`apiService.ts:66-74`).
- Al vaciarse `authStore.token`, el layout y la página muestran `LoginView`.

> **Efecto colateral del 401:** cualquier 401 de negocio también cierra la sesión. Ejemplos:
> - "Invalid old password" en `PUT /auth/profile` devuelve 401 (`BE: auth/auth.service.js:64-67` + controller
>   `:15-16`);
> - `/tasks/my-tasks` sin `roleIds` en el JWT (`BE: tasks/task.controller.js:13-15`).

**Logout:**
- Desde el Sidebar, con confirmación por `modal` (`Sidebar.svelte:33-41`).
- Desde `ProfilePanel`, sin confirmación (`ProfilePanel.svelte:64-67`).
- Ambos llaman a `authService.logout()` (`authService.ts:91-102`): limpia el timer, el token, el store y
  `localStorage`.

### 5.2 Dashboard

`DashboardView.svelte` no importa servicios ni stores. Todas las métricas son constantes (`:16-79`) con fechas de
2024 y texto en español sin i18n. El backend **no tiene endpoints de dashboard ni de estadísticas**
(`BE: api/routes.js:11-17`). Es una maqueta.

### 5.3 Bandeja de tareas → detalle → completar

**1. Listar.**
- `TaskListView` `onMount` → `taskListStore.fetchTasks()` (`taskListStore.ts:18-27`) →
  `GET /tasks/my-tasks` (`taskService.ts:15-23`).
- El BE devuelve tareas `PENDING` asignadas al usuario o a sus `roleIds`, ordenadas por `createdAt desc`
  (`BE: tasks/task.service.js:16-63`).
- Cada tarjeta muestra `taskName`, `processDescription`, `processName (V{version})`, `processInstanceId` y
  `processStartedBy` (`TaskListView.svelte:45-68`). `createdAt` y `dueDate` llegan, pero no se muestran.
- No hay filtros, búsqueda ni paginación.

**2. Abrir.**
- `taskDetailStore.show(task)` (`taskDetailStore.ts:27-59`) hace **en paralelo**:
  - `GET /process-instances/{processInstanceId}`;
  - `GET /tasks/{taskId}/form`.
- Si cualquiera de las dos falla, el panel completo queda en error (`:50-58`).

**3. Formulario.** La respuesta trae `{taskName, fields[], actions[]}`.
- `formData` se inicializa solo con los campos **no readonly** (`TaskDetailPanel.svelte:33-40`).
- Se preselecciona la primera acción (`:43-48`).
- Renderizado por `fieldType` (`:189-208`):

| `fieldType` | Control |
|---|---|
| `NUMBER` | `input type=number` |
| `TEXTAREA` | `textarea` |
| `DATE` | `input type=date` |
| cualquier otro | `input text` |
| readonly (cualquier tipo) | caja de solo lectura |

**4. Validación (solo en el cliente).**
- `isFormInvalid` = algún campo `isRequired && !isReadonly` vacío (`:51-53`). En ese caso se deshabilita
  Completar (`:226`).
- No se aplican `validations` ni `contextualValidations` (min, max, regex...).

**5. Confirmar y enviar.**
- `modal.show(...)` (`:131-138`) → `POST /tasks/{id}/complete {action, comments, formData}`
  (`:114-118`, `taskService.ts:44-51`).
- Si va bien: toast (parcialmente hardcodeado, `:120`), cierre del panel y refresco de la bandeja (`:121-122`).
- Si falla: toast del componente **más** el toast global de `apiService`. Salen dos toasts.

**6. En el backend** (`BE: engine/processEngine.service.js:179-317`):
- marca la tarea `COMPLETED`;
- guarda `comments` y `completionPayload`;
- mezcla `formData` en `businessData`;
- avanza por la **primera** secuencia de salida.
- Sobre `action`: solo se usa como `task.action` si el siguiente elemento es un gateway exclusivo.
- **No valida** obligatorios, readonly ni que la acción esté permitida.

**Comentarios:**
- **No existe una entidad comentario ni un endpoint.** Un comentario es `TaskInstance.comments`, que se escribe
  solo al completar una tarea.
- Se leen de `processInstance.taskInstances[]`, filtrando los que tienen texto y mapeando usuario y fecha
  (`TaskDetailPanel.svelte:83-108`, `ProcessDetailView.svelte:47-58`).
- El orden "cronológico" se calcula con `new Date(stringLocalizado)` (`TaskDetailPanel.svelte:93,107`). Es frágil
  y puede dar `Invalid Date`; ver §13.

**Claim / asignación individual:** no existen ni en el FE ni en el BE. El motor asigna las tareas solo a un rol
(`BE: processEngine.service.js:17-25`).

### 5.4 Solicitudes (instancias): listado y detalle

**Listado:**
- `ProcessListView` `onMount` → `processListStore.fetchInstances()` → `GET /process-instances`.
- El BE devuelve **todas las instancias de todos los usuarios**, sin paginación
  (`BE: process-instances/processInstance.service.js:26-42`).
- Pestañas por `status.toUpperCase() === 'RUNNING'` (`ProcessListView.svelte:18-19`).
- El status se muestra en crudo, sin traducir y siempre en verde (`:81,146-150`).

**Detalle:**
- `processDetailStore.show(id)` → `GET /process-instances/{id}` (`processDetailStore.ts:22-31`).
- El BE incluye `taskInstances` (con elemento, rol, usuario asignado y quien completó) y `businessDataFields`,
  que se arma cruzando `businessData` con `FieldDefinition` (`BE: processInstance.service.js:49-125`).

**Timeline** (`ProcessDetailView.svelte:29-45`, duplicado en `TaskDetailPanel.svelte:65-81`):
- tareas ordenadas por id descendente, más el paso "Inicio del proceso";
- estado `COMPLETED` o, si no, `PENDING`;
- "Paso X de Y" = completados / (tareas + 1) (`:60-62`).
- El nombre del usuario se interpola con `{@html}` (`:134`): riesgo XSS; ver §13.

**Restricciones del panel:**
- Es solo lectura: no hay acciones de cancelar, suspender ni reasignar.
- En estado de carga o error no tiene botón de cerrar (`:75-84`).

### 5.5 Iniciar un proceso

1. `#processes` → "Nueva instancia" → `#new-process`.
   - `processDefinitionStore.fetchDefinitions()` → `GET /processes`, que devuelve solo `ACTIVE`
     (`BE: processes/process.service.js:256-266`).
2. "Seleccionar" → `dispatch('navigate', {view:'start-process-form', context: definition})`
   (`NewProcessView.svelte:18-21`).
3. `StartProcessFormView` `onMount` → `GET /processes/{id}/start-form` (`StartProcessFormView.svelte:22-35`).
   - Devuelve los campos de `ElementFormLink` del START_EVENT y `actions:['start']`, que el FE ignora
     (`BE: process.service.js:320-367`).
4. Validación en el cliente (`:38-48`):
   - descripción con `trim()` no vacía;
   - cada campo `isRequired` distinto de `null`/`''`. **No excluye los readonly**, a diferencia de `TaskDetailPanel`.
5. Modal de confirmación (`:50-56`) → `POST /process-instances {businessProcessKey, description, businessData}`
   (`:64-68`).
   - El BE busca la versión **ACTIVE más alta por key**, no por el id elegido
     (`BE: engine/processEngine.service.js:145-149`).
6. Si va bien: toast con el mensaje del BE, en inglés (`:71`), y navegación a `#processes`.
7. Si falla: se asigna `error`, la cadena `{#if}` (`:101-105`) **reemplaza todo el formulario** y se pierde lo
   digitado. El banner de `:135-137` es inalcanzable.

### 5.6 Modelador de procesos (SvelteFlow)

Archivo principal: `src/lib/components/ProcessEditorView.svelte`, de 651 líneas.

#### 5.6.1 Estado y modos

- **Stores locales del componente:** `nodes`, `edges`, `processDefinition`, `mode`, `isLoading`,
  `formFieldsByElementId`, `actionsByElementId`, `dndType` (`:49-81`).
- **Modos:**

| Modo | Cuándo | Qué permite |
|---|---|---|
| `create` | sin `processId` | — |
| `view` | con `processId` | nodos no arrastrables, no conectables y no seleccionables (`:502-504`); paneles `disabled`; sin paleta (`:479-481`) |
| `edit` | botón Editar | — |

- **Botones** (`:465-474`):
  - Editar: solo en `view`;
  - Eliminar: en `edit`;
  - Guardar: en `create`/`edit`, deshabilitado si `isSaving || !isProcessPropertiesValid`.
- `colorMode={$theme}` integra el tema de la app con SvelteFlow (`:501`).

#### 5.6.2 Paleta y drag & drop

- `layout/PaletteSidebar.svelte:19-43` ofrece 6 tipos: `startEvent`, `userTask`, `autoTask`, `exclusiveGateway`,
  `parallelGateway`, `endEvent`.
  - Los nombres de la paleta están hardcodeados en inglés ("Toolbox", "User Task"…).
- **No usa `dataTransfer.setData`.** El editor crea `dndType = writable(null)` y lo comparte con
  `setContext('dnd-context')` (`ProcessEditorView.svelte:70-71`). La paleta lo fija en `dragstart` y lo limpia en
  `dragend` (`PaletteSidebar.svelte:5-13`).
- Drop (`ProcessEditorView.svelte:397-424`):
  - `screenToFlowPosition({x, y})`;
  - id = `${type}_${Date.now()}`;
  - datos iniciales por tipo (labels hardcodeados, `:410-418`).
- En modo creación hay un `startEvent` inicial en (50,150) (`:77`).

#### 5.6.3 Tipos de nodo y aristas

Registro de nodos en `nodeTypes` (`:145-152`); registro de aristas en `edgeTypes = {reconnect: ReconnectEdge}`
(`:154-156`).

| Tipo | Componente | `data` | Handles | Notas visuales |
|---|---|---|---|---|
| `startEvent` | `nodes/StartEventNode.svelte` | `label`, `assignedRoleId`, `assignedRoleName` | 1 source (Right) | Círculo verde; badge de rol si existe. |
| `endEvent` | `nodes/EndEventNode.svelte` | `label` | 1 target (Left) | Círculo rojo. |
| `userTask` | `nodes/UserTaskNode.svelte` | `label`, `description`, `assignedRoleId`, `assignedRoleName` | target Left, source Right | Borde rojo y "No role" si no hay rol (`:8,16-20`). |
| `autoTask` | `nodes/AutoTaskNode.svelte` | `label`, `description`, `webhook` | target Left, source Right | Badge "Webhook Set" con tooltip (`actions/tooltip.ts`). |
| `exclusiveGateway` | `nodes/ExclusiveGatewayNode.svelte` | `label`, `description` | target Left; **source `yes` (Right) y `no` (Bottom)** | Rombo amarillo. Los handles yes/no **no tienen semántica**: `sourceHandle` no se copia en `onConnect`. |
| `parallelGateway` | `nodes/ParallelGatewayNode.svelte` | `label`, `description` | target Left, source Right | Rombo con "+". |

**Arista `edges/ReconnectEdge.svelte`:**
- trazado bezier, con la etiqueta igual a la condición;
- si está seleccionada, muestra `EdgeReconnectAnchor` para mover el **destino** (`:38-52`).
- Clases CSS:
  - `.conditional-flow`: azul;
  - `.requires-condition`: rojo, discontinuo y animado (`ProcessEditorView.svelte:643-650`).

#### 5.6.4 Paneles de propiedades

Se elige el panel según la selección (`ProcessEditorView.svelte:515-552`):

| Selección | Panel | Campos |
|---|---|---|
| nada | `properties/ProcessPropertiesPanel.svelte` | `name`*, `businessProcessKey`* (readonly si el proceso ya existe), `description`*, `category`, `status` (DRAFT/ACTIVE/INACTIVE; DEPRECATED solo como lectura). Botón "Guardar Propiedades" lanza un PATCH. Emite `validation {isValid}` (`:24-47`). |
| `userTask` / `startEvent` | `properties/TaskPropertiesPanel.svelte` | label, descripción, rol (`<select>` desde `processRoleStore`), **acciones** (solo userTask) y **campos del formulario** (panel expandible a 740 px, ver §5.8). |
| `autoTask` | `properties/AutoTaskPropertiesPanel.svelte` | `BasicPropertiesPanel` + `webhook` (URL). El texto de ayuda es incorrecto (`:40`). |
| gateways / `endEvent` | `properties/BasicPropertiesPanel.svelte` | label, descripción. |
| arista | `properties/EdgePropertiesPanel.svelte` | `condition`, solo si el origen es `exclusiveGateway` (`:15,40-53`). |

`properties/GatewayPropertiesPanel.svelte` es **código muerto**: se importa en `ProcessEditorView.svelte:43`, pero
no se usa.

**Cómo se propagan los cambios:**
- Los paneles emiten `update` en `blur` o `change`.
- `handleUpdateNode` (`:343-356`) mezcla los datos en `node.data` y separa `actions` → `actionsByElementId`.
- `handleUpdateEdge` (`:358-375`) fija `data.condition`, `label` y `class`.
- `handleUpdateFormFields` (`:377-383`) guarda en `formFieldsByElementId`.
- El panel de proceso **no emite `update`**: modifica por `bind:value` el objeto del store `processDefinition`
  (`ProcessPropertiesPanel.svelte:57-106`).

#### 5.6.5 Conexiones, gateways y borrado

- **`onConnect`** (`:317-329`):
  - id `edge-${src}-${tgt}-${Math.random()}`;
  - `markerEnd: ArrowClosed`, `data.condition=''`, `type:'reconnect'`;
  - si sale de un exclusive, `class='requires-condition'`.
- **No hay `isValidConnection`.** Se permiten bucles, aristas duplicadas, varios starts y nodos huérfanos.
- **Condiciones:** viven en `edge.data.condition`. El BE las evalúa con `expr-eval` contra
  `{...businessData, instance, task}` (`BE: utils/expressionEngine.js:10-30`).
- **Flujo por defecto:** no existe en la UI. En el motor, por defecto va la primera secuencia **sin**
  `conditionExpression` (`BE: processEngine.service.js:84-97`), pero la UI pinta esa misma arista en rojo como
  "requiere condición". Hay contradicción.
- **Reconexión.** Se registra con `on:edgeupdate={handleEdgeUpdate}` (`:492`), pero ese evento **no existe en
  xyflow 1.x**. Además `edges={$edges}` va **sin `bind:`** (`:489`).
  - Consecuencia: la reconexión se ve en el lienzo, pero no llega al store y no se guarda.
- **Borrado en cascada:**
  - `onbeforedelete` (`:426-441`) calcula `getConnectedEdges`, filtra los stores y devuelve `false`;
  - además, `<svelte:window on:keydown>` con la tecla `Delete` llama a `deleteElements` (`:315,444`).
  - **Bug:** pulsar Supr dentro de un input del panel borra el nodo seleccionado.

#### 5.6.6 Carga, guardado y versionado

**Carga** (`onMount`, `:83-143`):
1. `processRoleStore.fetchRoles()` → `GET /roles`, que **requiere admin** en el BE (`BE: roles/role.routes.js:8`).
2. `GET /processes/{id}`.
3. Del resultado:
   - copia los metadatos;
   - reconstruye el lienzo **solo desde `diagramJson`** (no hay transformación inversa);
   - `setViewport` y `fitView` con `setTimeout`.
4. Intenta mapear `elements[].formFields` / `actions`, pero el BE no los devuelve (§5.8).

**Guardar** (`handleSave`, `:225-251`):
1. Si el proceso existe: `GET /processes/{id}/save-ask` devuelve `{action, state, instancesCount}`.
2. Se muestra un modal con uno de estos mensajes: `editor.save_confirm_new_version`, `editor.save_confirm_update`
   o `editor.save_confirm_new`.
3. `executeSave` (`:158-223`):
   1. `transformFlowToAPI(nodes, edges)`;
   2. inyecta `formFields` (sin `fieldDefinition` ni `id` nulo) y `actions`;
   3. arma el payload `{...processData, diagramJson:{nodes, edges, viewport}, elements, sequences, bpmnProcessId}`
      (con `bpmnProcessId = businessProcessKey` si es nuevo, `:198-202`).
4. Envío:
   - **existente** → `PUT /processes/{id}`. Toast hardcodeado y `location.hash = process-model-detail/{nuevoId}`;
   - **nuevo** → `POST /processes`. Toast hardcodeado y `history.pushState`.

**Versionado en el BE** (`BE: processes/process.service.js`):
- `CREATE_NEW_VERSION` si el estado es `ACTIVE` o hay instancias; si no, `UPDATE_IN_PLACE` (`:71-110`).
- **Nueva versión** (`:112-170`):
  - crea `version+1` en `DRAFT`;
  - **copia los `ElementFormLink` de la versión anterior** e ignora los `formFields` del payload.
- **In-place** (`:172-201`):
  - si pasa a `ACTIVE` y ya existe otra activa, lanza un error;
  - `syncElements` sincroniza los elementos por `bpmnElementId`;
  - las secuencias se borran y se recrean.
- El editor no se remonta al cambiar de id (no hay `{#key}` en `+page.svelte:80-81`), así que **no recarga** la
  nueva versión.

**Publicar o activar:** se cambia `status` en el panel y se pulsa "Guardar Propiedades" → `handleSaveMetadata`
(`:275-294`) → `PATCH /processes/{id}`.
- El BE solo actualiza `name`, `description`, `category` y `status` (`BE: process.service.js:205-254`).
- El bloque que depreca la versión activa anterior es inalcanzable.

**Eliminar** (`:253-273`): modal → `DELETE /processes/{id}` → toast → `#process-models`. El BE no comprueba si hay
instancias.

**Validación previa al guardado:**
- Solo `isProcessPropertiesValid`: name, key y description no vacíos.
- No se valida el grafo: start/end, roles, condiciones ni conectividad.
- **Bug:** la validación se calcula en el `onMount` del panel con los datos por defecto. Al abrir un proceso
  existente, "Guardar" queda deshabilitado hasta que el usuario edita un campo del proceso.

#### 5.6.7 `src/lib/utils/process-transformer.ts`

Solo existe la dirección **Flow → API** (`transformFlowToAPI`, `:22-82`).

- **Mapa de tipos** (`:7-14`):

| Tipo SvelteFlow | Tipo API |
|---|---|
| `startEvent` | `START_EVENT` |
| `endEvent` | `END_EVENT` |
| `userTask` | `USER_TASK` |
| `autoTask` | `AUTO_TASK` |
| `exclusiveGateway` | `EXCLUSIVE_GATEWAY` |
| `parallelGateway` | `PARALLEL_GATEWAY` |

  Un tipo desconocido produce `console.warn` y se omite.
- **`elements[]`** (`:35-61`):
  - `bpmnElementId = node.id`;
  - `name = data.label || 'Unnamed Element'`;
  - `type`, `description`;
  - `assignedRoleId = Number(...)` solo para START_EVENT/USER_TASK y si es truthy;
  - `webhook_target = data.webhook` (AUTO_TASK);
  - `sla_definition` (ninguna UI lo establece).
- **`sequences[]`** (`:66-79`):
  - `sourceElementBpmnId`, `targetElementBpmnId`;
  - `conditionExpression` solo si el origen es `exclusiveGateway` y la condición no está vacía.
  - No se envían el id de la arista ni `sourceHandle`.
- **`diagramJson`:** no lo arma el transformer, sino el editor (`:192-197`), con los `nodes`/`edges` crudos de
  xyflow y el `viewport`. El BE lo guarda como texto en la columna `bpmn_xml` y lo devuelve parseado
  (`BE: process.service.js:118,176,294-299`).

**Desajustes de contrato:**
- `webhook_target` y `sla_definition` van en snake_case, pero Sequelize espera `webhookTarget`/`slaDefinition`.
  Se ignoran: **el webhook nunca se guarda en BD** (solo sobrevive en `diagramJson`).
- El motor no tiene un caso `AUTO_TASK`.

### 5.7 Gestión de usuarios y roles (`#users`)

`UserManagementView.svelte` carga `userStore.fetchUsers()` y `processRoleStore.fetchRoles()` (`:29-32`).
Pestañas con `layout/Tabs.svelte`.

**Usuarios:**
- Tabla con búsqueda por nombre o email (`:34-38`), badge de rol de sistema, badges de roles de proceso y estado
  `PENDING`.
- **Editar/crear** (`UserEditPanel.svelte`):
  - mapea `fullName` a un campo local `displayName` (`:33`; origen de 10 errores de tipos);
  - validación: nombre y email obligatorios (`:69-72`);
  - **crear** → `POST /users` con **contraseña fija `unaClaveSeguraTemporal123`** (`:101`), `status:'ACTIVE'` y
    `roleIds`;
  - **editar** → `PUT /users/{id}`. `roleIds` solo se envía si hay al menos uno (`:89-91`), así que **no se pueden
    quitar todos los roles** de un usuario.
- **Eliminar:**
  - desde la tabla (`UserManagementView.svelte:66-80`), con await y manejo de error;
  - desde el panel (`UserEditPanel.svelte:120-131`), **sin await**: muestra éxito aunque falle.

**Roles:**
- `role-management/RoleManagementContent.svelte` muestra la tabla de roles con la cantidad de miembros, calculada
  cruzando `user.roles`. Desde ahí se edita o elimina (`DELETE /roles/{id}`).
- `role-management/RoleEditPanel.svelte`:
  - crear → `POST /roles {name, description}`;
  - editar → `PUT /roles/{id} {name, description, userIds}`, con miembros por toggles.
  - Carga el detalle con `GET /roles/{id}` **dentro de un bloque `$:`** (`:24-40`). ESLint advierte de un posible
    bucle reactivo.
- `role-management/AddMemberPanel.svelte` es **código muerto/maqueta**:
  - nadie emite `addmember`;
  - textos hardcodeados;
  - toast `'info'` no tipado (`:39`).

**Permisos en el backend:** todo `/users` y `/roles` exige `isAdmin` (`BE: users/user.routes.js:7-11`,
`roles/role.routes.js:8`).

### 5.8 Librería de datos y form builder

- **Vista `#data-library`:** placeholder, sin lógica.
- **Form builder en el editor** (`properties/TaskPropertiesPanel.svelte`, se usa con `userTask`/`startEvent`):
  - **Fuente de campos:** `fieldDefinitionStore.fetchFields()` → `GET /fields` (`fieldDefinitionService.ts:14`).
    **Ese endpoint no existe en el BE (404)**. El selector queda vacío y los campos ya vinculados no se muestran,
    porque se exige `fieldMap.size > 0` (`:33-37`).
  - **Operaciones:**
    - agregar campo desde `svelte-select` (`:85-97`, `:233-246`);
    - reordenar con SortableJS (`:122-134`);
    - checkboxes Requerido / Solo lectura;
    - `contextualValidations` en JSON, parseado en `blur` (`:108-120`). Un JSON inválido se descarta en silencio.
  - **"Aplicar"** emite `updateFormFields` con `displayOrder = i+1` (`:71-79`). **"Cancelar"** solo colapsa el
    panel y no revierte los cambios (`:81-83`).
  - **Acciones (userTask):**
    - tags libres más las sugerencias Approve/Reject/Return/Complete (`:26`);
    - las sugerencias se guardan **con el texto traducido** (`$_('editor.action_x')`, `:209-211`), así que el
      valor depende del idioma de quien modela.
- **Persistencia:** **el BE no persiste `formFields` ni `actions`.**
  - `syncElements` no escribe `ElementFormLink` (`BE: process.service.js:34-61`).
  - `ProcessElement` no tiene columna `actions` (`BE: models/process-element.model.js`).
  - Resultado: `GET /tasks/{id}/form` siempre devuelve `actions: ['complete']` (`BE: tasks/task.service.js:124`).
  - Los formularios solo funcionan si los `ElementFormLink` se cargan directamente en la base de datos.
- **Modelo de campo:** `FieldDefinition {id, name, label, fieldType: TEXT|NUMBER|TEXTAREA|DATE, validations}`
  (`types.ts:166-172`).

### 5.9 Log de reglas / decisiones (`#rules-log`)

- La vista es un placeholder.
- El BE expone `GET /engine/decision-logs` (solo admin, `BE: engine/decision.routes.js:13`), pero el FE **no lo
  consume**.
- `POST /engine/decide-next-task` tampoco se usa.

### 5.10 Perfil, tema e idioma

**`ProfilePanel.svelte`:**
- Edita `fullName`. El email está deshabilitado (`:104`).
- Cambio de contraseña con validaciones en el cliente (`:30-40`):
  - coincidencia con la confirmación;
  - la contraseña actual es obligatoria si hay una nueva.
- Guarda con `PUT /auth/profile` → `authStore.updateUser` + `localStorage['user']` (`authService.ts:149-173`).
- Muestra el rol de sistema y los roles de proceso.
- "Cambiar foto" no hace nada (`:93-95`).
- Si la contraseña actual es errónea, el BE responde 401 → **se cierra la sesión** (§5.1).

**Idioma:**
- `<select bind:value={$locale}>` (`:108-111`).
- Se persiste en `localStorage['user-locale']` con un `locale.subscribe` que **nunca se desuscribe** (`:21-25`): se
  acumula una suscripción por cada apertura del panel, y solo persiste si el panel se abrió alguna vez.

**Tema:**
- `theme.toggle()` (Header) alterna la clase `dark` en `<html>` y guarda `localStorage['theme']`
  (`stores/theme.ts:20-34`).
- Las variables CSS cambian con `:root.dark` (`+layout.svelte:110-120`).
- Tailwind usa `darkMode: 'class'` (`tailwind.config.cjs:3`).

**Sidebar colapsable:** `sidebarStore`, persistido en `localStorage['sidebarCollapsed']`.

---

## 6. Modelo de datos del cliente (`src/lib/types.ts`)

| Tipo | Líneas | Uso | Relación con el backend |
|---|---|---|---|
| `Role` | 3-7 | Rol embebido en `User.roles` | `BE: models` Role (`id, name, description`). |
| `User` | 9-21 | `authStore`, `userStore`, paneles | El BE devuelve `id, fullName, email, status, systemRole, roles[]...`. `processRoles` y `modules` se **derivan en el cliente** (`authService.ts:61-65`, `userStore.ts:24-27`). |
| `ProcessRole` | 23-29 | `processRoleStore` | El BE no tiene `key`: el store hace `key = name` (`processRoleStore.ts:31`). |
| `ProcessTaskInstance` | 31-46 | `ProcessInstance.taskInstances` | Coincide con el include del BE. `completionPayload` no se usa. |
| `ProcessInstance` | 48-73 | listas y detalle | `GET /process-instances[/:id]`. `businessDataFields` lo arma el BE. |
| `Task` | 76-86 | bandeja | DTO plano de `GET /tasks/my-tasks`. |
| `ProcessModel` | 88-95 | **sin uso** (solo en `processModelDetailStore`, también muerto) | — |
| `ProcessDefinition` | 97-109 | editor, listas | No declara `sequences`. `diagramJson` sale de la columna `bpmn_xml`. |
| `ProcessDefinitionData` | 112-118 | panel de proceso | `status` es una unión de literales; el BE usa string. |
| `FormFieldPayload` | 122-130 | form builder | Equivale a `ElementFormLink` del BE, pero **no se persiste** (§5.8). |
| `ProcessElementPayload` | 132-142 | transformer | `webhook_target` y `sla_definition` en snake_case **no coinciden** con los atributos Sequelize. `actions` no existe en el BE. |
| `SequenceFlowPayload` | 144-148 | transformer | OK. |
| `ProcessDefinitionPayload` | 150-155 | POST/PUT `/processes` | OK salvo las notas anteriores. |
| `SaveActionResponse` | 157-161 | `save-ask` | OK. |
| `FieldDefinition` | 166-172 | `fieldDefinitionStore` | El modelo BE existe, pero **no hay ruta** `/fields`. |
| `FormFieldDefinition`, `StartFormDefinition`, `TaskFormDefinition` | 175-192 | formularios dinámicos | `validations` es opcional en el tipo, pero el código lo trata como obligatorio (errores de svelte-check). |
| UI: `StatCard` … `ProcessTypeCard` | 196-214 | dashboard y paneles | `ProcessMockData`, `PreviousTaskContext`, `ProcessTypeCard`, `DocumentFile` y `UserTask` están sin uso o son mock. |
| `ModalConfig` | **203** | `stores/modal.ts` | **Error de sintaxis:** `onConfirm: ()-› void` usa U+203A en lugar de `=>`. Rompe `tsc`/`prettier`/`eslint` para el archivo. En runtime no falla porque solo se importa con `import type`. |

---

## 7. Catálogo de llamadas al API

Base: `PUBLIC_API_BASE_URL`. Todas pasan por `apiService.ts`, que añade `Authorization: Bearer` si hay token.

| Servicio → método (archivo:línea) | HTTP | Endpoint | ¿Existe en BE? | Notas BE |
|---|---|---|---|---|
| `authService.login` (`authService.ts:54`) | POST | `/auth/login` | Sí | `auth/auth.routes.js:6`. Las credenciales inválidas responden 500. |
| `authService.updateProfile` (`:151`) | PUT | `/auth/profile` | Sí | `auth.routes.js:7`. Una contraseña antigua errónea devuelve **401**, que desloguea. |
| `userService.getUsers` (`userService.ts:11`) | GET | `/users` | Sí | admin. |
| `userService.getUserById` (`:26`) | GET | `/users/{id}` | Sí | admin. |
| `userService.createUser` (`:41`) | POST | `/users` | Sí | admin. |
| `userService.updateUser` (`:57`) | PUT | `/users/{id}` | Sí | admin. |
| `userService.deleteUser` (`:72`) | DELETE | `/users/{id}` | Sí | admin. |
| `processRoleService.getRoles` (`processRoleService.ts:11`) | GET | `/roles` | Sí | **admin**. El modelador la usa al cargar. |
| `processRoleService.getRoleById` (`:24`) | GET | `/roles/{id}` | Sí | admin. |
| `processRoleService.createRole` (`:37`) | POST | `/roles` | Sí | admin. |
| `processRoleService.updateRole` (`:50`) | PUT | `/roles/{id}` | Sí | admin; acepta `userIds`. |
| `processRoleService.deleteRole` (`:63`) | DELETE | `/roles/{id}` | Sí | admin. |
| `taskService.getMyTasks` (`taskService.ts:17`) | GET | `/tasks/my-tasks` | Sí | `tasks.routes.js:10`. |
| `taskService.getTaskForm` (`:31`) | GET | `/tasks/{id}/form` | Sí | `tasks.routes.js:11`. `actions` siempre `['complete']`. |
| `taskService.completeTask` (`:46`) | POST | `/tasks/{id}/complete` | Sí | `tasks.routes.js:14`. |
| `processInstanceService.createInstance` (`processInstanceService.ts:26`) | POST | `/process-instances` | Sí | Usa la versión ACTIVE más alta por key. |
| `processInstanceService.getAllInstances` (`:36`) | GET | `/process-instances` | Sí | Sin filtro por usuario. |
| `processInstanceService.getInstanceDetails` (`:46`) | GET | `/process-instances/{id}` | Sí | — |
| `processDefinitionService.getAllProcesses` (`processDefinitionService.ts:11`) | GET | `/processes/all` | Sí | **admin** (`processes.routes.js:15`). |
| `processDefinitionService.getAvailableProcesses` (`:25`) | GET | `/processes` | Sí | Solo ACTIVE. |
| `processDefinitionService.getProcessById` (`:40`) | GET | `/processes/{id}` | Sí | No incluye `elementFormLinks`. |
| `processDefinitionService.getSaveAction` (`:55`) | GET | `/processes/{id}/save-ask` | Sí | `processes.routes.js:20`. |
| `processDefinitionService.createProcess` (`:70`) | POST | `/processes` | Sí | — |
| `processDefinitionService.updateProcess` (`:86`) | PUT | `/processes/{id}` | Sí | Puede crear una versión nueva y devolver otro id. |
| `processDefinitionService.patchProcessMetadata` (`:102`) | PATCH | `/processes/{id}` | Sí | allowlist name, description, category, status. |
| `processDefinitionService.deleteProcess` (`:117`) | DELETE | `/processes/{id}` | Sí | Sin verificar si hay instancias. |
| `processDefinitionService.getStartForm` (`:131`) | GET | `/processes/{id}/start-form` | Sí | `processes.routes.js:17`. |
| `fieldDefinitionService.getAllFields` (`fieldDefinitionService.ts:14`) | GET | **`/fields`** | **NO (404)** | Existe el modelo `FieldDefinition`, pero no hay ruta montada en `BE: api/routes.js:11-17`. |

Las líneas citadas son las de la llamada `get/post/put/patch/del` dentro de cada método.

**Endpoints del BE que el FE no consume:**
- `PUT`/`DELETE /process-instances/:id`;
- `POST /process-instances/record`;
- `POST /engine/decide-next-task`;
- `GET /engine/decision-logs`.

**Restricciones transversales del BE:**
- rate-limit de 100 peticiones cada 15 min por IP (`BE: app.js:20-24`); abrir una tarea ya consume 2;
- CORS abierto (`app.js:16`);
- los errores no controlados responden 500 en texto plano (`error.middleware.js:20`).

---

## 8. Reglas de negocio implementadas en el cliente

| # | Regla | Ubicación |
|---|---|---|
| R1 | Visibilidad del menú por `user.modules` (DASH, TASK, INST, PROC, ORG, LIBFORM, LOG). No hay guard de ruta. | `Sidebar.svelte:13-27` |
| R2 | Sesión: logout automático en el `exp` del JWT; 401 con token ⇒ sesión expirada. | `authService.ts:11-19,107-121`; `apiService.ts:66-70` |
| R3 | `processRoles` = nombres de `user.roles`; `ProcessRole.key = name`. | `authService.ts:63`; `userStore.ts:24-27`; `processRoleStore.ts:31` |
| R4 | Tarea: solo se envían en `formData` los campos no readonly; la acción por defecto es la primera. | `TaskDetailPanel.svelte:33-48` |
| R5 | Tarea: Completar se deshabilita si falta un obligatorio no readonly. | `TaskDetailPanel.svelte:51-53,226` |
| R6 | Inicio de proceso: descripción obligatoria más los campos `isRequired`, incluidos los readonly. | `StartProcessFormView.svelte:38-48` |
| R7 | Instancias "en curso" = `status === 'RUNNING'`; el resto es histórico. | `ProcessListView.svelte:18-19` |
| R8 | Timeline: tareas por id descendente más el paso de inicio; estado COMPLETED/PENDING; progreso = completadas / (n+1). | `ProcessDetailView.svelte:29-45,60-62`; `TaskDetailPanel.svelte:65-81` |
| R9 | Comentarios: tareas con `comments` no vacío, autor `completedByUser` o "Sistema", avatar de 2 letras. | `TaskDetailPanel.svelte:83-108`; `ProcessDetailView.svelte:47-58` |
| R10 | Proceso: name, key y description obligatorios para guardar. | `ProcessPropertiesPanel.svelte:24-29` |
| R11 | `businessProcessKey` editable solo en procesos nuevos. | `ProcessPropertiesPanel.svelte:69-81` |
| R12 | Status DEPRECATED solo como lectura. | `ProcessPropertiesPanel.svelte:19,32-34,117-121` |
| R13 | Condición en aristas solo si el origen es `exclusiveGateway`; arista sin condición = "requiere condición" (rojo). | `EdgePropertiesPanel.svelte:15`; `ProcessEditorView.svelte:326-327,364-369`; `process-transformer.ts:73-76` |
| R14 | `userTask` sin rol se marca con error visual, pero no bloquea el guardado. | `UserTaskNode.svelte:8`; `TaskPropertiesPanel.svelte:176,183-185` |
| R15 | `assignedRoleId` solo se envía para START_EVENT/USER_TASK. | `process-transformer.ts:46-50` |
| R16 | Guardar en un proceso existente pregunta `save-ask` y avisa si se crea una versión nueva. | `ProcessEditorView.svelte:225-251` |
| R17 | `bpmnProcessId` = `businessProcessKey` al crear. | `ProcessEditorView.svelte:198-202` |
| R18 | Borrar un nodo borra sus aristas conectadas. | `ProcessEditorView.svelte:426-441` |
| R19 | Usuario: nombre y email obligatorios; contraseña inicial fija; `status` ACTIVE. | `UserEditPanel.svelte:69-72,98-104` |
| R20 | Rol: nombre obligatorio. | `RoleEditPanel.svelte:61-64` |
| R21 | Perfil: la nueva contraseña debe coincidir con la confirmación y exige la actual. | `ProfilePanel.svelte:30-40` |
| R22 | Fechas con `toLocaleString()`/`toLocaleDateString()` **sin locale**: siguen el navegador, no el idioma de la app. | `TaskDetailPanel.svelte:60,72,78,90,104`; `ProcessDetailView.svelte:24,36,42,54`; `ProcessListView.svelte:77` |
| R23 | Locale: `localStorage['user-locale']`, luego el navegador, luego `es`. | `i18n/index.ts:10-26` |

---

## 9. Estado global: stores y componentes globales

| Store | Tipo / forma | Persistencia | Consumidores |
|---|---|---|---|
| `authStore` | custom `{subscribe, set, updateUser}` con `{user, token}` | `authToken`, `authUser` | layout, page, Sidebar, Header, ProfilePanel, authService |
| `theme` | custom `'light'\|'dark'`, `toggle`, `init` | `theme` | layout, Header, ProcessEditorView |
| `sidebarStore` | custom boolean, `toggle` | `sidebarCollapsed` | Sidebar |
| `profilePanelStore` | `writable<boolean>` | — | layout, Header, ProfilePanel |
| `toast` | custom array, `show(msg, type, duration)` (4 s por defecto) | — | global |
| `modal` | custom `{isOpen,title,message,onConfirm}`, `show`/`hide` | — | global (ConfirmModal en el layout) |
| `taskListStore` | `{tasks, loading, error}` + `fetchTasks` | — | TaskListView, TaskDetailPanel |
| `taskDetailStore` | `{isOpen, task, processInstance, formDefinition, loading, error}` + `show`/`hide` | — | page, TaskDetailPanel |
| `processListStore` | `{instances, loading, error}` + `fetchInstances` | — | ProcessListView |
| `processDetailStore` | `{isOpen, instance, loading, error}` + `show`/`hide` | — | page, ProcessDetailView |
| `processDefinitionStore` | `{definitions, loading, error}` + `fetchDefinitions` | — | NewProcessView |
| `processRoleStore` | `{roles, loading, error}` + CRUD, con caché `hasBeenLoaded` | — | editor, usuarios |
| `userStore` | `{users, loading, error}` + CRUD | — | usuarios, roles |
| `fieldDefinitionStore` | `{fields, fieldMap, loading, error}` + `fetchFields` | — | TaskPropertiesPanel |
| `processModelDetailStore` | — | — | **muerto** (solo se importa en `+page.svelte:10`) |
| `taskModal` | — | — | **muerto** (lo usaba `TaskFormModal`, también muerto) |

**Componentes globales:**
- `Toast.svelte`: solo maneja `success` y `error`.
- `ConfirmModal.svelte`:
  - textos por defecto en español hardcodeados (`:7-10`): los botones siempre dicen "Confirmar"/"Cancelar";
  - colores fijos, sin modo oscuro.
- `ProfilePanel.svelte`.
- `Icon.svelte`:
  - SVG Feather inline por nombre (`{@html}` de un mapa interno);
  - props `name`, `size` (number), `color`;
  - la prop `spinning` que pasan 11 usos **no existe** en el componente.
- Acción `actions/tooltip.ts`:
  - tooltip en `document.body`;
  - **archivo con codificación no UTF-8**: los comentarios muestran caracteres rotos.

---

## 10. Internacionalización (i18n)

**Configuración:**
- `src/lib/i18n/index.ts`: `register('en'|'es')` con import dinámico, `fallbackLocale: 'es'`.
- `es.json` y `en.json` tienen **287 claves cada uno, simétricas**: no falta ninguna en ninguno de los dos.
- Grupos de primer nivel: `concepts`, `process_list`, `process_detail`, `process_model_list`, `task_list`,
  `task_detail`, `user_management`, `login`, `sidebar`, `profile_panel`, `editor`, `new_instance`,
  `start_process_form`, `data_library`, `rules_log`.
- Uso: `$_('grupo.clave', { values: {...} })`.

**Clave inexistente:** `process_detail.no_description` (`TaskDetailPanel.svelte:243`). Solo existe
`user_management.no_description`, así que se pinta la clave literal.

**Claves sin uso:** `editor.no_condition_set`, `editor.form_fields_json_label`, `editor.actions_helper`.

**`editor.optional_label`:** ya incluye paréntesis y la plantilla los vuelve a añadir
(`TaskPropertiesPanel.svelte:171`), lo que produce "((Opcional))".

**Textos visibles hardcodeados (sin i18n):**
- `DashboardView.svelte`: todo el archivo.
- `SimpleBarChart.svelte:7`; `DonutChart.svelte:15,62`.
- `ConfirmModal.svelte:7-10`.
- `Header.svelte:12,16,24,35-36`.
- `LoginView.svelte:22,51`.
- `ProfilePanel.svelte:79,89,123,127`.
- `+layout.svelte:47`.
- `+page.svelte:50`.
- `TaskDetailPanel.svelte:120,124`.
- `ProcessListView.svelte:75`.
- `ProcessModelListView.svelte:18-19,70`.
- `ProcessEditorView.svelte`: `:59-60,77,109,132,207,212,266,410-418`.
- `layout/PaletteSidebar.svelte:17,21-42`.
- Nodos: `UserTaskNode.svelte:19`; `AutoTaskNode.svelte:21,23`.
- Paneles: "Element ID" en `BasicPropertiesPanel.svelte:32`, `EdgePropertiesPanel.svelte:30`,
  `GatewayPropertiesPanel.svelte:28`.
- `ProcessPropertiesPanel.svelte:119` (status crudo).
- `TaskPropertiesPanel.svelte:290`.
- `role-management/AddMemberPanel.svelte` (todo).
- `UserEditPanel.svelte:101` (contraseña).
- `process-transformer.ts:37`.
- Mensajes técnicos que llegan a la UI: `'An unknown error occurred'` en los stores y en `apiService.ts:30,32,42,76`.
- Valores de enumeración mostrados en crudo:
  - status de instancia y de definición (`ProcessListView.svelte:81`, `ProcessModelListView.svelte:70`,
    `ProcessDetailView.svelte:25`);
  - rol de sistema (`Header.svelte:39`);
  - nombre de la acción (`TaskDetailPanel.svelte:216`).

---

## 11. Estilos, tema claro/oscuro y layout

- **Tokens de tema:** variables CSS definidas en `+layout.svelte:96-120`, dentro de `<style>`, en `:root` y en
  `:root.dark`: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-sidebar`, `--text-primary`,
  `--text-secondary`, `--text-sidebar`, `--text-sidebar-active`, `--border-color`, `--accent-color`,
  `--success-color`.
  - Variables que se usan pero **no están definidas**: `--bg-hover` (`Header.svelte:86`).
  - `--success-color` y `--accent-color` no se redefinen en el tema oscuro.
- **Tailwind:** `src/app.css` define `@layer components` con clases globales (`.table-container`,
  `.search-input`, `.btn`…) usando `@apply` y variantes `dark:`.
- **Mezcla de enfoques:** coexisten CSS scoped con variables, utilidades Tailwind inline (badges en
  `UserManagementView`/`ProfilePanel`) y utilidades Tailwind **reimplementadas a mano** en CSS scoped
  (`Header.svelte:95-120`).
- **Clases globales** declaradas en el layout con `:global(...)`: `.view-header`, `.header-title`,
  `.header-description`, `.list-name`.
- **Sin modo oscuro:** `ConfirmModal.svelte` (blanco fijo), `Toast.svelte` (colores fijos) y el tooltip.
- **Variables por nodo:** los nodos del modelador definen sus propias variables, por ejemplo `--c-background-ste`
  en `StartEventNode.svelte:55-56`.
- **Fuente:** Inter desde Google Fonts (`+layout.svelte:51-58`).
- **Layout:**
  - `main-layout`: flex con Sidebar de 255 px, o 88 px colapsado;
  - `content-wrapper`: Header más `main.main-content` con scroll vertical y `padding: 2rem`.
- **Paneles laterales y overlays:** cada panel define su propio CSS de overlay. No hay un componente base
  (`UserEditPanel`, `RoleEditPanel`, `AddMemberPanel`, `ProfilePanel`, `TaskDetailPanel`, `ProcessDetailView`).
  - z-index del modal: 1100/1101, por encima de los paneles (`ConfirmModal.svelte:49,57`).

---

## 12. Calidad: svelte-check, ESLint y Prettier (estado real)

Medido el 2026-11-05 sobre `661ed4b`.

### 12.1 `npx svelte-check --tsconfig ./tsconfig.json`

Resultado: **62 errores y 54 warnings en 26 archivos** (507 archivos analizados).

**Errores por categoría:**

| Categoría | Nº | Archivos |
|---|---|---|
| Error de sintaxis (carácter `›`) | 4 | `types.ts:203` |
| Mocks que no cumplen los tipos | 9 | `data/process-roles.ts` (5), `data/users.ts` (4) |
| Unión `User \| {}` / campo `displayName` inexistente | 12 | `UserEditPanel.svelte` (10), `UserManagementView.svelte:113,195` (2) |
| `validations`/arrays posiblemente `undefined` (strict null) | 13 | `StartProcessFormView.svelte` (10), `TaskDetailPanel.svelte:27,29,36` (3) |
| Tipos `{}` → `string` en el transformer (`data` sin tipar) | 5 | `utils/process-transformer.ts:37,43,54,60,75` |
| API de `@xyflow/svelte` 1.x mal usada | 7 | `ProcessEditorView.svelte:11,15` (`NodeMouseEvent`/`EdgeMouseEvent` no exportados), `:96` (status), `:105` (implicit any), `:155` (tipo de `edgeTypes`), `:426` (`onbeforedelete` debe devolver una Promise), `:492` (`on:edgeupdate` no existe) |
| `svelte-select` y tipos de rol | 4 | `TaskPropertiesPanel.svelte:22,140,238` |
| `catch (error)` con `error.message` sobre `unknown` | 3 | `processRoleStore.ts:47,59,71` |
| Props mal tipadas | 4 | `ProcessDetailView.svelte:77,82` (`Icon size="32"`), `AddMemberPanel.svelte:39` (toast `'info'`), `Icon.svelte:93` (índice) |
| Atributo HTML | 1 | `+layout.svelte:53` (`crossorigin` booleano) |

**Warnings por categoría:**

| Categoría | Nº |
|---|---|
| a11y: `div` con `on:click` sin teclado ni rol (backdrops/overlays), `dragstart` en `div`, `label` sin control | 36 |
| Selectores CSS sin uso | 14 |
| `<textarea />` autocerrado | 3 |
| Bloque `{#each}` vacío | 1 |

### 12.2 ESLint (`npx eslint .`)

Resultado: **96 errores en 31 archivos.** Reglas principales:

| Regla | Nº |
|---|---|
| `no-unused-vars` | 33 |
| `svelte/require-each-key` | 26 |
| `no-explicit-any` | 15 |
| `no-empty-object-type` | 5 |
| `svelte/no-navigation-without-resolve` | 4 |
| `svelte/no-at-html-tags` | 3 |
| `svelte/infinite-reactive-loop` (`RoleEditPanel.svelte:31-32`) | 2 |
| `prefer-const` | 2 |
| `no-immutable-reactive-statements` | 2 |
| `prefer-svelte-reactivity` | 2 |
| `no-unused-expressions` | 1 |
| Parsing error en `types.ts:203` | 1 |

### 12.3 Prettier (`npx prettier --check .`)

- **~116 archivos sin formatear**, prácticamente todo el repo.
- Falla al parsear `src/lib/types.ts` por el carácter de la línea 203.
- `npm run lint` (prettier + eslint) **falla**.

### 12.4 Sintaxis Svelte real

- **Cero runes** en `src/`: no hay `$state`, `$props`, `$derived`, `$effect` ni `$bindable`. Todo el código es
  sintaxis Svelte 4 en modo legacy de Svelte 5:

| Patrón | Archivos | Ocurrencias |
|---|---|---|
| `export let` | 24 | 55 |
| `$:` | 22 | 55 |
| `on:evento` | 28 | 152 |
| `createEventDispatcher` | 17 | — |
| `$$props` | — | `Icon.svelte:91` |
| `<slot>` | — | `+layout.svelte` |
| `$app/stores` (deprecado en Kit 2.12+) | `+page.svelte`, `Sidebar.svelte` | — |

- **Excepción:** el editor mezcla callbacks estilo Svelte 5 de SvelteFlow (`onconnect`, `ondrop`,
  `onbeforedelete`…) con directivas `on:` (`ProcessEditorView.svelte:492-500`).

### 12.5 Pruebas

- **No hay pruebas automatizadas**: no existe Vitest, Playwright, ni archivos `*.test.ts`/`*.spec.ts`.
- `GEMINI.md` recomienda Vitest, pero no está instalado.

---

## 13. Brechas, inconsistencias y deuda técnica

Prioridad: **C** = crítica (seguridad o pérdida de datos/funcionalidad), **A** = alta, **M** = media, **B** = baja.

### 13.1 Seguridad

> En la fase piloto / demo estos hallazgos se aceptan tal como están; las credenciales precargadas y la
> contraseña inicial se mantienen a propósito para agilizar demos. Son pendientes obligatorios antes de
> crear un ambiente de QA o producción (criterios de salida de fase de la constitución).

| P | Hallazgo | Ubicación |
|---|---|---|
| C | Credenciales de admin precargadas en el login. | `LoginView.svelte:7-8` |
| C | Contraseña fija para todo usuario creado desde la UI; no hay flujo de invitación. | `UserEditPanel.svelte:101` |
| A | XSS: `{@html}` con el nombre del usuario interpolado en una cadena i18n. | `TaskDetailPanel.svelte:314`; `ProcessDetailView.svelte:134` |
| A | Token JWT en `localStorage`, accesible desde JS. Es aceptado temporalmente; ver la constitución. | `authStore.ts:41`; `authService.ts:74` |
| A | Sin guard de módulos en el router: solo se ocultan los botones del Sidebar. | `+page.svelte:70-92` |
| M | Proxy de Vite hacia un Cloud Workstation de Firebase, con inyección de la cookie `FIREBASE_COOKIE`. No se usa. | `vite.config.ts:29-46` |

### 13.2 Contrato FE ↔ BE

| P | Hallazgo | Ubicación |
|---|---|---|
| C | `GET /fields` no existe: el form builder queda inutilizable. | `fieldDefinitionService.ts:14`; `BE: api/routes.js:11-17` |
| C | `formFields` y `actions` no se persisten ni se devuelven; las acciones de tarea siempre son `['complete']`. | `ProcessEditorView.svelte:164-189`; `BE: process.service.js:34-61,132-168,277-302`; `BE: task.service.js:124` |
| A | `webhook_target`/`sla_definition` en snake_case: el BE los ignora. | `process-transformer.ts:54,60`; `types.ts:138-139` |
| A | Cualquier 401 de negocio cierra la sesión (p. ej. contraseña actual errónea). | `apiService.ts:67`; `BE: auth.service.js:64-67` |
| A | Los errores del BE llegan como 500 "Something broke!" y se pierde el mensaje (p. ej. credenciales inválidas). | `BE: error.middleware.js:18-21`; `apiService.ts:29-32` |
| A | El modelador y la lista de modelos usan endpoints solo-admin (`/roles`, `/processes/all`) aunque el módulo es PROC. | `ProcessEditorView.svelte:85`; `processDefinitionService.ts:11` |
| M | Semántica del flujo por defecto contraria: la UI marca en rojo lo que el motor usa como default. | `ProcessEditorView.svelte:326-327`; `BE: processEngine.service.js:84-97` |
| M | Las acciones sugeridas se guardan traducidas, así que su valor depende del idioma. | `TaskPropertiesPanel.svelte:209-211` |
| M | `businessProcessKey` duplicada solo se detecta como error SQL genérico. | `BE: process-definition.model.js:54-59` |

### 13.3 Bugs funcionales

| P | Hallazgo | Ubicación |
|---|---|---|
| A | La reconexión de aristas no se persiste: no hay `bind:edges` y `on:edgeupdate` no existe. | `ProcessEditorView.svelte:489,492` |
| A | "Guardar" queda deshabilitado al abrir un proceso existente; la validación no se recalcula tras la carga. | `ProcessPropertiesPanel.svelte:36-39` |
| A | Supr dentro de un input borra el nodo seleccionado. | `ProcessEditorView.svelte:315,444` |
| A | Si falla el envío en `StartProcessFormView`, se pierde lo que el usuario escribió. | `StartProcessFormView.svelte:101-105` |
| A | Un campo requerido y readonly bloquea para siempre el inicio de un proceso. | `StartProcessFormView.svelte:43` |
| M | Orden de comentarios calculado sobre strings localizados. | `TaskDetailPanel.svelte:93,107`; `ProcessDetailView.svelte:57` |
| M | Toasts duplicados: `<Toast/>` está montado dos veces, y además hay toast global más toast del componente. | `+layout.svelte:79`; `+page.svelte:63-64` |
| M | El editor no se remonta al cambiar `processId` (falta `{#key}`). | `+page.svelte:80-81` |
| M | `assignedRoleId: Number(null) = 0` al editar una tarea sin rol. | `TaskPropertiesPanel.svelte:47` |
| M | No se pueden quitar todos los roles de un usuario. | `UserEditPanel.svelte:89-91` |
| M | Eliminar desde `UserEditPanel` no espera el resultado y siempre muestra éxito. | `UserEditPanel.svelte:125-128` |
| M | `ProcessDetailView` no se puede cerrar en estado de carga o error (solo con el backdrop). | `ProcessDetailView.svelte:75-84` |
| M | `#start-process-form` en blanco al recargar (contexto solo en memoria). | `+page.svelte:37,85` |
| M | Suscripción a `locale` sin desuscribir en `ProfilePanel`. | `ProfilePanel.svelte:21-25` |
| B | Ayuda incorrecta bajo el webhook. | `AutoTaskPropertiesPanel.svelte:40` |
| B | `Icon spinning` no existe; el loader no gira. | `Icon.svelte:3-5` |
| B | Clave i18n inexistente `process_detail.no_description`. | `TaskDetailPanel.svelte:243` |

### 13.4 Código muerto y mocks

> En la fase piloto / demo los mocks y el dashboard hardcodeado se pueden mantener. Lo que sí conviene
> limpiar ya es el código muerto sin uso, porque confunde sin aportar a las demos.

| Elemento | Estado |
|---|---|
| `src/lib/data/processModels.ts`, `users.ts`, `process-roles.ts` | **Sin importadores.** Además no cumplen los tipos (9 errores de svelte-check). |
| `TaskFormModal.svelte` + `stores/taskModal.ts` | Sin uso (maqueta). |
| `stores/processModelDetailStore.ts` + tipo `ProcessModel` | Sin uso real. |
| `properties/GatewayPropertiesPanel.svelte` | Se importa, pero no se usa. |
| `role-management/AddMemberPanel.svelte` | Nadie emite `addmember`. |
| `+page.svelte:48-52` (`handleTaskSubmit`) y `on:submit` (`:96`) | `TaskDetailPanel` no emite `submit`. |
| `+layout.svelte:44-48` (`handleProfileSubmit`) | `ProfilePanel` no emite `submit`. |
| `ProcessEditorView.svelte:331-341,385-387` | `handleEdgeUpdate`, `handleProcessUpdate`. |
| `DashboardView.svelte:16-79` | Datos mock **en uso**. |
| `src/lib/vendor/bpmn-styles/*.css` (~2.700 líneas) | Se importan globalmente, pero ningún componente usa sus clases. |
| Dependencias `firebase`, `@firebase/app-check` | Sin imports. |
| `@tailwindcss/forms`, `@tailwindcss/typography` | Instaladas, pero no registradas. |
| Tipos UI sin uso (`ProcessMockData`, `PreviousTaskContext`, `ProcessTypeCard`, `DocumentFile`, `UserTask`) | `types.ts:196-214` |

### 13.5 Lógica duplicada

- Mapeos de info general, timeline, comentarios y progreso, más su CSS, duplicados entre
  `TaskDetailPanel.svelte:56-148` y `ProcessDetailView.svelte:20-68`.
- Render de formulario dinámico duplicado: `TaskDetailPanel.svelte:189-208` vs `StartProcessFormView.svelte:116-133`.
- Doble log de errores: `console.error` en cada servicio más en `apiService.ts:81`.
- Creación del startEvent inicial duplicada e inconsistente: `ProcessEditorView.svelte:77` vs `:109`.
- Regla de clase de arista repetida 3 veces: `ProcessEditorView.svelte:327,368`; `process-transformer.ts:74`.
- Patrón de paneles laterales con overlay copiado en 6 componentes.
- Construcción de la URL de avatar `ui-avatars.com` repetida en 6 lugares.

### 13.6 Configuración e infraestructura

| P | Hallazgo | Ubicación |
|---|---|---|
| M | **Claves de `localStorage` inconsistentes:** `authStore` usa `authToken`+`authUser`, `authService` usa `authToken`+`user`. Ambas se escriben y se borran, pero la sesión depende de que las dos copias coincidan. | `authStore.ts:16-17,41-45,61`; `authService.ts:74-75,99-100,128-129,163` |
| M | Dos configs de Tailwind: `tailwind.config.cjs` (usada, `darkMode:'class'`) y `tailwind.config.ts` (ignorada, sin `darkMode`). | `vite.config.ts:16` |
| M | `svelte-preprocess` en lugar de `vitePreprocess` (que es lo estándar en Kit 2). | `svelte.config.js:2,7` |
| M | `$app/stores` (`page`) en lugar de `$app/state`. | `+page.svelte:2`; `Sidebar.svelte:4` |
| M | `history.pushState` directo; Kit recomienda `pushState` de `$app/navigation`. | `ProcessEditorView.svelte:213` |
| B | `README.md` es la plantilla genérica de `sv`. `GEMINI.md` está desactualizado (dice "no es SvelteKit" y menciona `src/App.svelte`). | — |
| B | `.idx/` (Firebase Studio / Nix) y `.idx/mcp.json` son restos de entorno. | — |
| B | `tooltip.ts` está guardado en una codificación distinta de UTF-8. | `actions/tooltip.ts` |
| B | Sin `.env.example`; `.env` está ignorado. | `.gitignore` |

---

## 14. Cómo levantar en local

**Requisitos:**
- Node ≥ 20.19 (`package.json:51`); el `engine-strict` del `.npmrc` lo hace obligatorio.
- Backend `my-bpm-back-express` corriendo en `http://localhost:3000`, con su base de datos.

**Pasos:**

1. Instalar dependencias:
   ```bash
   npm install
   ```
   El `package-lock.json` está versionado, así que `npm ci` también funciona.

2. Crear `.env` en la raíz con una sola variable:
   ```bash
   PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```
   Opcionalmente puede existir `FIREBASE_COOKIE`; solo la usa el proxy de Vite, que no se utiliza.

3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir `http://localhost:5173`.

4. Usuario inicial: depende de los seeds del backend. *Pendiente de confirmar*. El login precarga
   `admin@flowify.com` / `admin123`.

**Comandos de calidad:**

| Comando | Qué hace | Estado actual |
|---|---|---|
| `npm run check` | svelte-check | falla |
| `npm run lint` | prettier --check + eslint | falla |
| `npm run format` | prettier --write | — |
| `npm run build` / `npm run preview` | build y previsualización | build: *Pendiente de confirmar*, no se ejecutó en esta revisión |

**Notas:**
- Para depurar el contrato, las rutas del backend están en `my-bpm-back-express/src/api/**/**.routes.js`.
- El BE limita a 100 peticiones cada 15 minutos por IP: si se recarga mucho en desarrollo, aparecerán 429.

---

## 15. Evolución del repositorio (git log)

| Fecha | Commit | Hito |
|---|---|---|
| 2025-09-10 → 09-16 | `d1842aa`…`040ee5b` | Workspace de Firebase Studio. Maqueta con `bpmn-js`, vistas de procesos, CRUD de usuarios y roles con mocks. |
| 2025-09-25 → 10-11 | `ffc1498`…`bf0c266` | Integración con el backend: login, mis tareas, detalle de tarea, CRUD de usuarios y roles. |
| 2025-10-17 → 10-22 | `56b30c9`…`d0b2d2b` | **Migración del modelador a `@xyflow/svelte`.** Nodos, paneles, integración con el BE, borrado en cascada, reconexión de target. |
| 2025-10-23 | `75ecc20`, `b7c7859` | i18n de los componentes. |
| 2025-10-27 | `7f44244` | Visibilidad de módulos según `modules` del login. |
| 2025-10-28 → 10-29 | `a0ed2d2`, `047856c`, `89d4d19` | Form builder (campos y acciones) y refactor de `TaskDetailPanel` (comentarios cronológicos). |
| 2026-11-05 | `661ed4b` | Cierre de sesión al expirar el JWT (`setUnauthorizedHandler`, `expireSession`, `login.session_expired`). |

---

## 16. Histórico

Esta sección conserva lo que sigue siendo cierto del blueprint anterior.

### 16.1 Origen bpmn-js (obsoleto)

Hasta el 2025-10-17 el modelador usaba `bpmn-js` y `bpmn-js-properties-panel`, cargados dinámicamente en `onMount`.
**Esas dependencias ya no están en `package.json`** y el editor actual es SvelteFlow (§5.6). La sección
"Configuración de Vite para bpmn-js" del documento anterior ya no aplica.

### 16.2 CSS vendor que se sigue importando

`+layout.svelte:4-6` aún importa globalmente estos archivos de `src/lib/vendor/bpmn-styles/`:

| Archivo | Versión | Origen |
|---|---|---|
| `diagram-js.css` | 11.5.0 | `https://unpkg.com/bpmn-js@11.5.0/dist/assets/diagram-js.css` |
| `bpmn-embedded.css` (fuente de iconos BPMN) | 11.5.0 | `https://unpkg.com/bpmn-js@11.5.0/dist/assets/bpmn-font/css/bpmn-embedded.css` |
| `bpmn-js-properties-panel.css` | 5.42.0 | `https://unpkg.com/bpmn-js-properties-panel@5.42.0/dist/bpmn-js-properties-panel.css` |

Ningún componente actual usa sus clases (`djs-*`, `bio-properties-*`, `bpmn-icon-*`). Se recomienda retirarlos tras
comprobar visualmente que no hay regresiones. Esta decisión está pendiente.

### 16.3 Decisiones vigentes del blueprint anterior

- **`SvelteFlowProvider` global** en `+page.svelte` (antigua §11.1).
- **Condiciones en las flechas, no en los gateways.** Estilo rojo/azul (antigua §11.2).
- **`NewProcessView` sirve para *iniciar* instancias, no para modelar** (antigua "Nota de corrección"). El
  modelador vive en `#new-process-model` / `#process-model-detail/{id}`.
- **Visibilidad de módulos por `modules`** del login (antigua §16). Si el Sidebar sale vacío después de una
  actualización, cerrar sesión y volver a entrar para regenerar el usuario en `localStorage`.
- **Form builder con `svelte-select` + SortableJS** y limpieza del payload (antigua §17). Su persistencia en el
  backend **no está implementada** (§5.8).
