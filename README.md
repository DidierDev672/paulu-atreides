# Paulus

> *"El control del patrimonio mediante el honor y la estrategia."*

**Paulus** es el primer miembro de **Paulu**. Es una aplicación web construida con Vue 3 para la gestión empresarial colombiana.

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

## ¿Qué puedes hacer en Paulus?

- Registrarte e iniciar sesión
- Registrar tu empresa (con NIT, dirección, actividad económica, info tributaria)
- Gestionar productos (crear, editar, listar, eliminar)
- Asociar proveedores y bodegas a tus productos
- Registrar entradas de producto con detalle financiero
- Gestionar tu perfil y el de tu empresa

## Conexión con el backend

Paulus se conecta a la API **Paulu** (Go + PostgreSQL) corriendo en `localhost:8080`.
