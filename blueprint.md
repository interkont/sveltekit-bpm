# Blueprint del Proyecto: Editor de Modelos BPMN

## 1. Descripción General

Esta es una aplicación web construida con **SvelteKit**, **Vite** y **TypeScript**. Su propósito principal es permitir a los usuarios visualizar, crear y editar modelos de procesos de negocio utilizando el estándar BPMN 2.0. La aplicación integra las librerías `bpmn-js` para el renderizado y modelado de los diagramas.

El diseño se centra en una interfaz limpia, con un panel de listado de modelos a la izquierda y un área de trabajo principal a la derecha donde se visualizan o editan los diagramas. La aplicación es completamente reactiva y está diseñada para funcionar exclusivamente en el lado del cliente (navegador).

---

## 2. Características Implementadas

- **Visualización de Modelos BPMN:** Los usuarios pueden seleccionar un modelo de la lista y ver su diagrama renderizado.
- **Edición de Modelos:** Al hacer clic en "Editar", la aplicación cambia a un modo de modelador que incluye un lienzo de diagrama y un panel de propiedades.
- **Creación de Nuevos Modelos:** Funcionalidad para iniciar un nuevo diagrama BPMN desde una plantilla en blanco.
- **Componente de Detalle Dinámico:** Un panel lateral deslizable muestra los detalles de un modelo seleccionado, permitiendo la visualización y la edición en el mismo contexto.
- **Carga Dinámica de Dependencias:** Las pesadas librerías de `bpmn-js` se cargan de forma dinámica y solo en el navegador para evitar errores de SSR y optimizar la carga inicial.
- **Gestión de Estilos CSS Centralizada:** Los estilos CSS de las librerías de BPMN se han descargado y almacenado localmente para garantizar la estabilidad y evitar problemas de rutas.

---

## 3. Dependencias Externas (Vendor)

Para garantizar la estabilidad y el control sobre las dependencias de frontend críticas, algunos archivos CSS se han descargado y se sirven localmente desde la carpeta `src/lib/vendor/bpmn-styles/`. A continuación, se detallan los archivos, sus versiones y las URLs de origen para facilitar el mantenimiento futuro.

- **`diagram-js.css`**
  - **Versión:** `11.5.0` (corresponde a `bpmn-js`)
  - **URL de Origen:** `https://unpkg.com/bpmn-js@11.5.0/dist/assets/diagram-js.css`

- **`bpmn-embedded.css`** (Fuente de iconos BPMN)
  - **Versión:** `11.5.0` (corresponde a `bpmn-js`)
  - **URL de Origen:** `https://unpkg.com/bpmn-js@11.5.0/dist/assets/bpmn-font/css/bpmn-embedded.css`

- **`bpmn-js-properties-panel.css`**
  - **Versión:** `5.42.0` (corresponde a `bpmn-js-properties-panel`)
  - **URL de Origen:** `https://unpkg.com/bpmn-js-properties-panel@5.42.0/dist/bpmn-js-properties-panel.css`

---
