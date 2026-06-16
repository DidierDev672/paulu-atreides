# Paulus — El Primer Miembro de Paulu

> *"El control del patrimonio mediante el honor y la estrategia."*
>
> Así como Paul Atreides unió a los fremen de Arrakis bajo una visión compartida,
> **Paulus** unifica la gestión empresarial colombiana en una sola plataforma.

**Paulus** es el primer miembro de **Paulu**, el ecosistema digital inspirado en
el viaje de Paul Atreides (*Muad'Dib*, el que guía a través del desierto).
Construido con Vue 3, transforma el caos del inventario en orden — porque
*"la especia debe fluir"* y el patrimonio debe controlarse.

> *"Quien controla el patrimonio, controla el futuro."*
> — Liturgia Paulu (adaptación del Juramento Fremen)

## Stack

- **Framework**: Vue 3.5 + Composition API
- **Lenguaje**: TypeScript 6.0 (strict)
- **Build**: Vite 8
- **UI**: TailwindCSS 4.1 (tema oscuro stellar/cósmico)
- **Estado**: Pinia 3
- **Router**: Vue Router 5.1
- **HTTP**: Axios 1.17
- **Animación**: @vueuse/motion 3

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

## ¿Qué puedes hacer en Paulus? — *El Camino del Muad'Dib*

> Como Paul Atreides aprendió el camino de los fremen antes de liderarlos,
> Paulus te guía paso a paso en el dominio de tu negocio:

- **Registrarte e iniciar sesión** — *El primer paso es cruzar el desierto*
- **Registrar tu empresa** (NIT, dirección, actividad económica, info tributaria) — *Establece tu Casa*
- **Gestionar productos** (crear, editar, listar, eliminar) — *Controla tu especia*
- **Asociar proveedores y bodegas** — *Forja alianzas en el Landsraad*
- **Registrar entradas de producto con detalle financiero** — *La contabilidad debe fluir*
- **Gestionar tu perfil y el de tu empresa** — *Conócete a ti mismo*

## Conexión con el backend — *La Casa Paulu*

Paulus se conecta a la API **Paulu** (Go + PostgreSQL) — el corazón de la
**Casa Paulu** — corriendo en `localhost:8080`. Como el Halcón Atreides que vela
por Arrakis, Paulu sostiene la infraestructura para que Paulus lidere.
