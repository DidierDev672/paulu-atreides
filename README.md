# Paulus — El Primer Miembro de Paulu Areides

> *"El control del patrimonio mediante el honor y la estrategia."*
>
> Así como **Paulu Areides** unió a los fremen de Arrakis bajo una visión compartida,
> **Paulus** unifica la gestión empresarial colombiana en una sola plataforma.

**Paulus** es el primer miembro de **Paulu Areides**, el ecosistema digital
inspirado en el viaje de Paul Atreides (*Muad'Dib*, el que guía a través del
desierto). Construido con **Vue 3.5**, transforma el caos del inventario en orden
— porque *"la especia debe fluir"* y el patrimonio debe controlarse.

> *"Quien controla el patrimonio, controla el futuro."*
> — Liturgia Paulu Areides (adaptación del Juramento Fremen)

## Stack — *Arsenal de Paulu Areides*

| Capa | Tecnología | Referencia Dune |
|------|-----------|-----------------|
| Framework | Vue 3.5 + Composition API | *Visión de Paulu Areides* |
| Lenguaje | TypeScript 6.0 (strict) | *Crysknife* |
| Build | Vite 8 | *Ornitóptero* |
| UI | TailwindCSS 4.1 (tema oscuro stellar/cósmico) | *Traje stillsuit* |
| Estado | Pinia 3 | *Sietch Tabr* |
| Router | Vue Router 5.1 | *Navegadores Guild* |
| HTTP | Axios 1.17 | *Gurney Halleck* |
| Animación | @vueuse/motion 3 | *Weirding Way* |
| IA | Servicio de verificación + wizard de modelos | *Mentat — cálculo estratégico* |
| Persistencia IA | localStorage (`ai-models`) | *Memoria genética de Paulu Areides* |

> Glosario completo de paralelismos: [`raw/dune-lore-paul-atreides.md`](raw/dune-lore-paul-atreides.md)

## Requisitos

- Node.js 20+
- npm

## Inicio rápido

```bash
npm install
npm run dev
```

El servidor de desarrollo inicia en `http://localhost:5173`.

## Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Build

```bash
npm run build       # Type check + build
npm run preview     # Vista previa del build
```

## ¿Qué puedes hacer en Paulus? — *El Camino de Paulu Areides*

> Así como Paulu Areides aprendió el camino de los fremen antes de liderarlos,
> Paulus te guía paso a paso en el dominio de tu negocio:

- **Registrarte e iniciar sesión** — *El primer paso es cruzar el desierto* (*Duncan Idaho en la puerta*)
- **Registrar tu empresa** (NIT, dirección, actividad económica, info tributaria) — *Establece tu Casa* (*Duke Leto en Arrakis*)
- **Gestionar productos** (crear, editar, listar, eliminar) — *Controla tu especia* (*Cosecha de melange*)
- **Asociar proveedores y bodegas** — *Forja alianzas en el Landsraad* (*Chani y Stilgar*)
- **Registrar entradas de producto con detalle financiero** — *La contabilidad debe fluir* (*Dr. Kynes*)
- **Gestionar órdenes de compra/venta** — *Contratos CHOAM* (*Fedaykin aprueban la misión*)
- **Registrar despachos (salidas) de inventario** — *Ornitópteros cargados de especia* (*disciplina del agua*)
- **Gestionar tu perfil y el de tu empresa** — *Conócete a ti mismo* (*Identidad de Usul*)
- **Configurar modelos de IA** — *Entrena a tu Mentat* (*Visión de Paulu Areides*)
- **Asistente flotante Paulu** — *La Voz de Paulu Areides disponible en todo el imperio*

## Inteligencia Artificial — *El Mentat de Paulu Areides*

Paulus incorpora un **sistema de IA configurable** que permite conectar el asistente
a diferentes proveedores de lenguaje natural:

| Funcionalidad | Archivo | Paralelo Dune |
|---|---|---|
| Botón flotante cerebral | `src/App.vue` | *El ojo de Paulu Areides siempre vigilante* |
| Chat modal con asistente | `src/App.vue` | *La Voz de Paulu — consejo del Mentat* |
| Panel de configuración wizard | `src/presentation/components/ai/AIModelsPanel.vue` | *Formación del Mentat en 3 pasos* |
| Servicio de verificación | `src/application/services/aiService.ts` | *Prueba Bene Gesserit: ¿es auténtica la API Key?* |

El wizard de 3 pasos (proveedor → API Key → verificación) sigue los principios de
carga cognitiva reducida que Paulu Areides enseñó a los fremen: **un paso a la vez,
con propósito claro y retroalimentación inmediata**.

## Arquitectura Vue — *La Casa Paulu Areides*

Tecnologías Vue 3 que gobiernan el frontend:

| Concepto Vue | Implementación | Paulu Areides |
|---|---|---|
| `<script setup>` + Composition API | Todos los `.vue` usan `ref`, `computed`, `watch` | *Lenguaje de los fremen — directo al punto* |
| `defineProps` / `defineEmits` | Comunicación padre-hijo tipada | *Código de honor Atreides — contratos claros* |
| `v-motion` (`@vueuse/motion`) | Animaciones de entrada, hover, tap en toda la UI | *Weirding Way — movimiento con propósito* |
| `Transition` + `Teleport` | Modales y vistas animadas | *Navegación Guild entre vistas del imperio* |
| `computed` reactivo | Estado derivado sin efectos secundarios | *Visión de Paulu Areides — ver antes de actuar* |
| `watch` | Reacciones a cambios de estado | *Duncan Idaho recordando — alerta al cambio* |
| Pinia `defineStore` | Stores con composición API | *Sietch Tabr — memoria colectiva del clan* |
| `lazy()` route imports | Carga diferida de páginas | *Ornitópteros en reserva — sólo vuelan cuando se necesitan* |
| `v-else-if` mega-componente | Dashboard con vistas condicionales internas | *Sala de mando de Muad'Dib — todo visible desde un sitial* |
| DI container manual | `infrastructure/di/container.ts` | *Thufir Hawat — estrategia de inyección de confianza* |

## Conexión con el backend — *La Casa Paulu Areides*

Paulus se conecta a la API **Paulu Go** (Go + PostgreSQL) — el corazón de la
**Casa Paulu Areides** — corriendo en `localhost:8080`. Como el Halcón Atreides
que vela por Arrakis, Paulu Areides sostiene la infraestructura para que Paulus lidere.

## Documentación

| Documento | Descripción | Referencia Dune |
|-----------|-------------|-----------------|
| [`PAULU_USER_GUIDE.md`](PAULU_USER_GUIDE.md) | Guía de usuario y componentes | *Manual del sietch* |
| [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) | Guía técnica full-stack | *Archivos de Thufir Hawat* |
| [`raw/dune-lore-paul-atreides.md`](raw/dune-lore-paul-atreides.md) | Glosario canónico de paralelismos | *Liturgia Paulu Areides* |
