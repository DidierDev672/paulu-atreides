# Paulus — Guía de usuario

> *"El control del patrimonio mediante el honor y la estrategia."*

**Paulus** es el primer miembro de **Paulu**. Una aplicación web para la gestión empresarial colombiana. Te ayuda a controlar tu patrimonio: productos, proveedores, bodegas, entradas de inventario y más. Construida con **Vue 3**, **TypeScript**, **Pinia** y **TailwindCSS 4**.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | **Vue 3.5** + Composition API (`<script setup>`) |
| Lenguaje | **TypeScript 6.0** (strict mode) |
| Build | **Vite 8** |
| UI | **TailwindCSS 4.1** (tema oscuro stellar/cósmico) |
| Estado | **Pinia 3** |
| Router | **Vue Router 5.1** |
| HTTP | **Axios 1.17** con interceptor Bearer token |
| Animación | **@vueuse/motion 3** |

---

## Guía de instalación

### 1. Clonar y acceder al proyecto

```bash
git clone <repo-url> book-coffee-shop
cd book-coffee-shop
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz (o usa el `.env.example` existente):

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor se levanta en `http://localhost:5173` por defecto.

### 5. Compilar para producción

```bash
npm run build       # vue-tsc -b && vite build
npm run preview     # vite preview
```

---

## Estructura de carpetas

```
src/
├── main.ts                        # Entry point: crea app, monta Pinia + Router + Motion
├── App.vue                        # Raíz: <router-view> con transición fade
├── style.css                      # TailwindCSS v4 + tema stellar/cosmic (dark mode)
│
├── domain/                        # Capa de dominio (sin dependencias Vue)
│   ├── entities/
│   │   ├── AuthSession.ts         # { user: User, token: string }
│   │   └── User.ts                # { id, name_full, email, roles }
│   ├── repositories/
│   │   └── IAuthRepository.ts     # Interface: login(credentials): Promise<AuthSession>
│   └── value-objects/
│       ├── LoginCredentials.ts    # { email: string, password: string }
│       └── RegisterData.ts        # { name_full, phone, id_number, date_of_birth, email, password }
│
├── application/                   # Casos de uso y servicios
│   ├── services/                  # Llamadas HTTP directas via axiosInstance
│   │   ├── productService.ts      # CRUD productos
│   │   ├── providerService.ts     # CRUD proveedores
│   │   ├── productEntryService.ts # CRUD entradas de producto
│   │   ├── companyService.ts      # CRUD compañías + getCompanyByUser
│   │   ├── userService.ts         # GET / PUT perfil usuario
│   │   ├── wineryService.ts       # CRUD bodegas
│   │   ├── mainAddressService.ts  # CRUD direcciones principales
│   │   ├── taxInformationService.ts # CRUD información tributaria
│   │   └── economicActivityService.ts # CRUD actividades económicas
│   ├── dtos/
│   │   ├── LoginDto.ts            # DTO para login request
│   │   └── RegisterDto.ts         # DTO para register request
│   └── use-cases/
│       ├── LoginUseCase.ts        # Orquesta login: repo → store → localStorage
│       └── RegisterUseCase.ts     # Orquesta registro con validación + persistencia
│
├── infrastructure/                # Implementaciones técnicas
│   ├── http/
│   │   ├── IHttpClient.ts         # Interface genérica HttpClient
│   │   ├── AxiosHttpClient.ts     # Implementación con Axios
│   │   ├── axiosInstance.ts       # Instancia Axios configurada con interceptor JWT
│   │   └── HttpError.ts           # Clase error HTTP custom
│   ├── repositories/
│   │   └── AuthRepository.ts      # Implementa IAuthRepository con AxiosHttpClient
│   └── di/
│       └── container.ts           # DI container: registra repos y casos de uso
│
├── presentation/                  # Capa de presentación (Vue)
│   ├── pages/
│   │   ├── AuthPage.vue           # Login/Register con toggle tabs + fondo animado
│   │   └── DashboardPage.vue      # Dashboard principal con sidebar, navbar, vistas
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthInput.vue      # Input reutilizable con label, error, estilo auth
│   │   │   ├── AuthButton.vue     # Botón con loading spinner, variantes primary/ghost
│   │   │   ├── LoginForm.vue      # Formulario login con validación + alertas
│   │   │   ├── RegisterForm.vue   # Formulario registro con validación + alertas
│   │   │   └── authAlertMessages.ts # Mapeo errores → alertas (título, cuerpo, acción)
│   │   ├── company/
│   │   │   ├── CompanyRegistrationForm.vue # Formulario multi-step (6 pasos) con stepper
│   │   │   ├── CompanyRequiredModal.vue    # Modal empresa requerida (persuasivo)
│   │   │   └── OnboardingModal.vue         # Modal onboarding con tarjetas de beneficios
│   │   ├── products/
│   │   │   ├── ProductRegistrationForm.vue # Formulario producto con categorías, proveedor, bodega, imagen
│   │   │   ├── ProductEditModal.vue        # Modal edición producto
│   │   │   ├── ProductList.vue             # Tabla de productos con búsqueda, editar, eliminar
│   │   │   ├── ConfirmDeleteModal.vue      # Modal confirmación con psicología de inventario
│   │   │   ├── SupplierSelectionModal.vue  # Modal selección proveedor (radio, búsqueda)
│   │   │   └── WinerySelectionModal.vue    # Modal selección bodega (radio, búsqueda)
│   │   ├── productEntries/
│   │   │   ├── ProductEntryForm.vue        # Formulario entrada producto con tabla dinámica
│   │   │   └── ProductSelectionModal.vue   # Modal selección productos (multi-select, búsqueda)
│   │   ├── wineries/
│   │   │   └── WineryRegistrationForm.vue  # Formulario bodega con fecha, área, unidades
│   │   ├── providers/
│   │   │   └── ProviderRegistrationForm.vue # Formulario proveedor con auto-generar código
│   │   ├── profile/
│   │   │   ├── UserProfile.vue             # Perfil usuario con avatar, cover, datos
│   │   │   └── EditProfileModal.vue        # Modal editar perfil + empresa
│   │   └── ui/
│   │       ├── AppAlert.vue       # Alerta reutilizable (error/warning/info/success)
│   │       └── appAlert.types.ts  # Tipo AppAlertVariant
│   ├── router/
│   │   └── index.ts               # 2 rutas: / (dashboard, auth), /auth
│   ├── stores/
│   │   ├── authStore.ts           # Sesión, login, register, logout
│   │   ├── companyStore.ts        # companyId global
│   │   ├── productStore.ts        # CRUD productos
│   │   ├── productEntryStore.ts   # CRUD entradas producto
│   │   ├── providerStore.ts       # CRUD proveedores
│   │   └── wineryStore.ts         # CRUD bodegas
│   └── validators/
│       ├── ILoginValidator.ts     # Interface validator login
│       ├── IRegisterValidator.ts  # Interface validator register
│       ├── LoginValidator.ts      # Validación email + password
│       └── RegisterValidator.ts   # Validación campos registro
│
└── shared/                        # Utilidades compartidas
    ├── auth/
    │   └── tokenStorage.ts        # localStorage: get/set/clear token + session
    └── config/
        └── api.ts                 # VITE_API_BASE_URL con fallback localhost:8080
```

---

## Variables de entorno (`.env`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base de la API REST (Go backend) | `http://localhost:8080` |

El proyecto usa `import.meta.env.VITE_API_BASE_URL` en `src/shared/config/api.ts` con fallback a `http://localhost:8080`. Puedes cambiar el puerto del dev server de Vite en `vite.config.ts`:

```ts
server: { port: 3000 }  // Opcional
```

---

## Componentes globales

### `AuthInput.vue` — Input de formulario con tema auth

```vue
<AuthInput
  id="email"
  label="Correo electrónico"
  type="email"
  placeholder="tu@email.com"
  autocomplete="email"
  inputmode="email"
  :required="true"
  :model-value="form.email"
  :error="fieldErrors.email"
  @update:model-value="form.email = $event"
/>
```

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| `id` | `string` | — | ID del input (requerido) |
| `label` | `string` | — | Texto del label |
| `type` | `string` | `"text"` | Tipo de input |
| `modelValue` | `string` | — | Valor v-model |
| `placeholder` | `string` | — | Placeholder |
| `autocomplete` | `string` | — | Atributo autocomplete |
| `inputmode` | `"text" \| "numeric" \| "email" \| "tel"` | — | Modo teclado móvil |
| `required` | `boolean` | — | Marca required |
| `error` | `string \| null` | `null` | Mensaje error (borde rojo + texto) |

| Evento | Payload |
|--------|---------|
| `update:modelValue` | `string` |

---

### `AuthButton.vue` — Botón con loading y variantes

```vue
<AuthButton type="submit" :loading="saving" variant="primary">
  Iniciar sesión
</AuthButton>

<AuthButton variant="ghost" @click="toggleMode">
  ¿No tienes cuenta? Regístrate
</AuthButton>
```

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| `type` | `"button" \| "submit"` | `"button"` | Tipo de botón |
| `loading` | `boolean` | `false` | Muestra spinner + "Procesando..." |
| `variant` | `"primary" \| "ghost"` | `"primary"` | `primary`: gradiente stellar-cosmic-nebula, `ghost`: borde translúcido |

---

### `LoginForm.vue` — Formulario de inicio de sesión

```vue
<LoginForm
  @success="onLoginSuccess"
  @go-to-register="showRegister = true"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `success` | — | Login exitoso, redirigir al dashboard |
| `go-to-register` | — | Usuario hizo clic en "Regístrate aquí" |

**Campos del formulario:**

| Campo | Tipo | Inputmode | Autocomplete | Placeholder |
|-------|------|-----------|--------------|-------------|
| `email` | `"email"` | `"email"` | `"email"` | `"tu@correo.com"` |
| `password` | `"password"` | — | `"current-password"` | `"••••••••"` |

**Validación (vía `LoginValidator.ts`):**

| Campo | Regla |
|-------|-------|
| `email` | No vacío + formato email (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) |
| `password` | No vacío |

**Flujo:**
1. `handleSubmit()` → `loginValidator.validate(form)` → si inválido, llena `fieldErrors` y retorna
2. Llama `authStore.login({ email, password })` → emite `success` o muestra `AppAlert` con error del servidor (vía `authAlertMessages.ts`)

**Errores de servidor mapeados:** `"invalid credentials"` → alerta "Credenciales inválidas — Verifica tu correo y contraseña" con botón "Intentar de nuevo". `"user not found"` → alerta "Usuario no encontrado" con botón "Crear cuenta" que emite `go-to-register`.

---

### `RegisterForm.vue` — Formulario de registro

```vue
<RegisterForm
  @success="onRegisterSuccess"
  @go-to-login="showLogin = true"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `success` | — | Registro exitoso, redirigir al dashboard |
| `go-to-login` | — | Usuario hizo clic en "Inicia sesión" |

**Campos del formulario:**

| Campo | `type` | Inputmode | Autocomplete | Placeholder |
|-------|--------|-----------|--------------|-------------|
| `fullName` | `"text"` | — | `"name"` | `"Juan Pérez García"` |
| `phoneNumber` | `"tel"` | `"tel"` | `"tel"` | `"+57 300 123 4567"` |
| `idNumber` | `"text"` | `"numeric"` | — | `"1234567890"` |
| `dateOfBirth` | `"date"` | — | `"bday"` | — |
| `email` | `"email"` | `"email"` | `"email"` | `"tu@correo.com"` |
| `password` | `"password"` | — | `"new-password"` | `"Mínimo 8 caracteres"` |

**Validación local (`validate()`):**

| Campo | Reglas |
|-------|--------|
| `fullName` | No vacío |
| `phoneNumber` | No vacío |
| `idNumber` | No vacío → si pasa, formato solo dígitos (`/^\d+$/`) |
| `dateOfBirth` | No vacío |
| `email` | No vacío → si pasa, formato email (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) |
| `password` | No vacío → si pasa, mínimo 8 caracteres |

Cada campo muestra su error individual debajo del input vía `:error="fieldErrors.xxx"`. Si no hay error del campo, no se muestra nada.

**Flujo:**
1. `handleSubmit()` → `validate()` → si falso, retorna con errores en `fieldErrors`
2. Llama `authStore.register({ ...form })` → emite `success` o muestra `AppAlert` con error del servidor

**Mapeo a API (vía `AuthRepository.ts`):** los campos camelCase se convierten a snake_case:
- `fullName` → `name_full`
- `phoneNumber` → `phone`
- `idNumber` → `id_number`
- `dateOfBirth` → `date_of_birth`

La respuesta esperada del endpoint `POST /auth/register` es `{ token, user }`.

---

### `AppAlert.vue` — Alerta contextual reutilizable

### `AppAlert.vue` — Alerta contextual reutilizable

```vue
<AppAlert
  v-if="alert"
  :variant="alert.variant"
  :headline="alert.headline"
  :body="alert.body"
  :action-label="alert.actionLabel"
  @action="alert.action"
  @dismiss="alert = null"
/>
```

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| `variant` | `"error" \| "warning" \| "info" \| "success"` | — | Tipo visual de la alerta |
| `headline` | `string` | — | Título en negrita |
| `body` | `string` | — | Cuerpo del mensaje |
| `action-label` | `string` | — | Etiqueta del botón de acción |
| `disabled` | `boolean` | `false` | Deshabilita botón de acción |

| Evento | Disparo |
|--------|---------|
| `dismiss` | Click en botón "X" de cerrar |
| `action` | Click en botón de acción |

---

### `SupplierSelectionModal.vue` — Modal de selección de proveedor (Teleport a body)

```vue
<SupplierSelectionModal
  @close="showSupplierModal = false"
  @confirm="onSupplierSelected"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Click en overlay, X, Cancelar |
| `confirm` | `ProviderResponse` | Proveedor seleccionado |

Internamente:
1. Abre con overlay oscuro + backdrop-blur
2. Carga todos los proveedores vía `getProviders()`
3. Filtra por búsqueda (nombre, documento, código)
4. Muestra tabla con radio-button
5. Al confirmar, emite el objeto `ProviderResponse`

---

### `ProductSelectionModal.vue` — Modal de selección múltiple de productos

```vue
<ProductSelectionModal
  :company-id="companyId"
  @close="showProductModal = false"
  @confirm="onProductsSelected"
/>
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `company-id` | `string` | Filtra productos por compañía |

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Cierra modal |
| `confirm` | `ProductResponse[]` | Array de productos seleccionados |

Características:
- Multi-select con checkboxes + select-all
- Búsqueda por nombre o código
- Estados vacío y persuasivo si no hay productos
- Tabla con checkboxes y datos (código, nombre, categorías, unidad)

---

### `CompanyRequiredModal.vue` — Modal persuasivo de empresa requerida

```vue
<CompanyRequiredModal @register="goToCompanyRegistration" @close="showModal = false" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Cerrar modal |
| `register` | — | Ir a registro de empresa |

Usa psicología persuasiva: pérdida ("Sin empresa no puedes gestionar inventario"), prueba social ("Todas las empresas colombianas registran su compañía primero"), y urgencia.

---

### `OnboardingModal.vue` — Modal de onboarding con beneficios

```vue
<OnboardingModal @register="goToCompanyRegistration" @close="showOnboarding = false" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Cerrar modal |
| `register` | — | Ir a registro de empresa |

Muestra 4 tarjetas de beneficios con iconos: facturación fiscal, control de inventario, proveedores, información tributaria.

---

### `CompanyRegistrationForm.vue` — Formulario multi-step de 6 pasos

```vue
<CompanyRegistrationForm @saved="onCompanySaved" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Compañía registrada exitosamente |

Pasos del stepper:
1. Información general (razón social, nombre comercial, NIT, email)
2. Tipo de persona (natural/jurídica + tipo de compañía)
3. Estado y constitución (fecha, estado)
4. Dirección principal (país, departamento, municipio, dirección, código postal)
5. Teléfonos (fijo, celular)
6. Resumen y confirmación

Cada paso tiene validación independiente. El stepper muestra progreso con checkmarks en pasos completados.

Al guardar, envía 4 llamadas paralelas via `Promise.all`:
- `POST /companies` — datos de la compañía
- `POST /main-addresses` — dirección principal (incluye municipio)
- `POST /tax-information` — información tributaria
- `POST /economic-activities` — actividades económicas

---

### `ProviderRegistrationForm.vue` — Formulario de registro de proveedor

```vue
<ProviderRegistrationForm @saved="onProviderSaved" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Proveedor registrado exitosamente |

Campos: código (auto-generado), tipo persona, tipo documento, número documento, dígito verificación, razón social, estado (activo/inactivo).

---

### `ProductRegistrationForm.vue` — Formulario de registro de producto

```vue
<ProductRegistrationForm
  @saved="onProductSaved"
  @go-to-product-list="showProductList"
  @go-to-register-winery="showWineryForm"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Producto registrado exitosamente |
| `go-to-product-list` | — | Ir a la lista de productos |
| `go-to-register-winery` | — | Ir al formulario de registro de bodega |

**Selección de empresa:** Si el usuario tiene más de una empresa, muestra una pantalla de selección antes del formulario. Muestra un badge con la empresa seleccionada y botón "Cambiar".

**Bodega (nuevo):**
- Al cargar, verifica si hay bodegas registradas para la empresa
- **Sin bodegas**: Muestra un modal oscuro informativo "¿Registrar una bodega?" con botones "Registrar después" y "Registrar bodega"
- **Con bodegas**: Muestra un modal "¿Automatizar bodega?" — si el usuario elige "Sí, vincular ahora", aparece el campo de bodega; si elige "No, lo haré después", el campo se oculta y podrá hacerlo manualmente en el futuro
- El campo bodega es **opcional**. Se selecciona mediante `WinerySelectionModal`

**Secciones del formulario:**
- **Código**: Input + botón "Generar" (auto-genera `PROD-{timestamp36}-{random36}`)
- **Nombre**: Text input
- **Unidad de medida**: Select (`Kg`, `Litro`, `Libra`, `Gramos`, `Unidad`)
- **Cantidad**: Number input (nuevo)
- **Stock mínimo**: Number input
- **Categorías**: Input + botón "Agregar", tags removibles con sugerencias de frecuencia (localStorage)
- **Proveedor**: Botón "Buscar proveedor" → `SupplierSelectionModal`, badge con avatar + botón quitar
- **Bodega**: Botón "Buscar bodega" → `WinerySelectionModal`, badge con nombre + botón quitar (solo si el usuario aceptó automatizar)
- **Imagen**: File input con preview (JPG, PNG, WebP, máx 5MB)

**Resultado:** Modal centrado con icono de éxito/error. Botones "Ingresar uno nuevo" y "Enviar a lista de productos".

---

### `ProductEditModal.vue` — Modal de edición de producto

```vue
<ProductEditModal :product="product" @saved="refreshList" @cancel="closeModal" />
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `product` | `ProductResponse` | Producto a editar |

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Producto actualizado exitosamente |
| `cancel` | — | Cerrar modal sin guardar |

Campos editables: código, nombre, unidad, cantidad, stock mínimo, categorías, proveedor, bodega. Tema oscuro con gradiente stellar/cósmico.

---

### `ProductList.vue` — Lista de productos con búsqueda

```vue
<ProductList
  @edit="openEditModal"
  @delete="openDeleteModal"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `edit` | `ProductResponse` | Editar producto |
| `delete` | `ProductResponse` | Eliminar producto |

Muestra tabla con columnas: código, nombre, categorías, unidad, cantidad, stock mínimo, estado (bajo/excesivo), acciones. Barra de búsqueda que filtra por nombre o código. Animación secuencial fade-in de filas.

---

### `ConfirmDeleteModal.vue` — Confirmación de eliminación

```vue
<ConfirmDeleteModal :product="product" @confirm="deleteProduct" @cancel="closeModal" />
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `product` | `ProductResponse` | Producto a eliminar |

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `confirm` | — | Confirmar eliminación |
| `cancel` | — | Cancelar |

Modal oscuro con mensaje psicológico: explica las consecuencias de eliminar (pérdida de histórico de inventario) y sugiere desactivar el producto como alternativa. Botones: "Cancelar" y "Eliminar producto".

---

### `WineryRegistrationForm.vue` — Formulario de registro de bodega

```vue
<WineryRegistrationForm @saved="onWinerySaved" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Bodega registrada exitosamente |

Campos:
- **Fecha de registro**: Date picker
- **Área**: Select (`Tienda`, `Almacén`, `Cafetería`, `Otro`)
- **Unidades**: Select (`Unidades`, `Cajas`, `Litros`, `Kilogramos`)

Los valores de área y unidades están en español para coincidir con la validación del backend. Badge de empresa seleccionada. Resultado con botón "Cerrar".

---

### `WinerySelectionModal.vue` — Modal de selección de bodega

```vue
<WinerySelectionModal :company-id="id" @close="close" @confirm="onSelect" />
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `company-id` | `string` | ID de la compañía para filtrar bodegas |

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Cerrar modal |
| `confirm` | `WineryResponse` | Bodega seleccionada |

Carga bodegas por compañía, tabla con radio-button, búsqueda por área, botones "Cancelar" / "Seleccionar".

---

### `ProductEntryForm.vue` — Formulario de entrada de producto

```vue
<ProductEntryForm @saved="onEntrySaved" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Entrada registrada exitosamente |

Secciones:
- **Encabezado**: Número entrada, fecha, tipo movimiento (select: Purchase/Return/Donation/Inventory Adjustment/Internal Production), bodega
- **Responsable + Compañía**: Badges read-only auto-asignados desde authStore y companyStore
- **Tabla dinámica de detalles**: Agregar/eliminar filas con código, producto, unidad, cantidad, costo unitario → subtotal auto-calculado, margen, precio sugerido
- **Resumen financiero**: Subtotal, IVA, descuento, total auto-calculados
- **Observaciones**: Textarea opcional

---

### `UserProfile.vue` — Vista de perfil de usuario

```vue
<UserProfile @open-edit="showEditModal = true" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `open-edit` | — | Abrir modal de edición |

Muestra: cover image, avatar iniciales, nombre, email, ID, teléfono, y tarjetas de datos de empresa (NIT, razón social, tipo, régimen fiscal).

---

### `EditProfileModal.vue` — Modal de edición de perfil

```vue
<EditProfileModal @saved="refreshProfile" @close="showEditModal = false" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `save` | — | Perfil actualizado exitosamente |
| `close` | — | Cerrar modal |

Campos editables: nombre, teléfono, email, y datos de compañía (NIT, razón social, nombre comercial, teléfono, celular, email, dirección, país, departamento).

---

## Flujo de autenticación

```
                    localStorage
                        │
              ┌─────────┴──────────┐
              │  auth_token (JWT)  │
              │  auth_session      │
              └─────────┬──────────┘
                        │
  LoginForm ──→ LoginUseCase ──→ AuthRepository ──→ API POST /auth/login
       │                                              │
       │                                    ┌─────────┴──────────┐
       │                                    │  { token, user }    │
       │                                    └─────────┬──────────┘
       │                                              │
       └────→ authStore.login(response) ─────→ localStorage
                                                ↑
                                              setStoredToken()
                                              setStoredSession()
```

El guard de navegación en `router/index.ts` verifica `authStore.session`:
- Ruta protegida (`/`) sin sesión → redirige a `/auth`
- Ruta `/auth` con sesión → redirige a `/`

Cada request HTTP inyecta el token vía interceptor de Axios (`axiosInstance.ts`):

```ts
axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

## Convenciones del proyecto

- **Componentes**: Composition API con `<script setup lang="ts">`, props tipadas con `defineProps<T>()`, eventos con `defineEmits<T>()`
- **Eventos**: `defineEmits()` debe capturarse como `const emit = defineEmits<...>()`
- **Store**: Setup stores con `defineStore('name', () => { ... })`, retorno de refs/funciones
- **Servicios**: Funciones independientes que llaman `axiosInstance`, tipadas con interfaces locales
- **Estilos**: TailwindCSS v4 con `@apply` no usado — clases directamente en template. Tema dark via `@custom-variant dark`
- **Rutas**: 2 rutas planas (`/` y `/auth`), sin rutas anidadas. La navegación interna es SPA-style con `activeNav` + `navItems` en `DashboardPage.vue`
