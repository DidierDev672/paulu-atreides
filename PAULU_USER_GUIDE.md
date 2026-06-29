# Paulus — Guía de usuario

> *"El control del patrimonio mediante el honor y la estrategia."*
>
> *"El miedo es la mente-asesina. El miedo es la pequeña muerte que conduce a la
> destrucción total. Enfrentaré mi miedo. Permitiré que pase sobre mí y a través
> de mí."* — Litany Against Fear, adaptada por Paul Atreides
>
> Así mismo, el **miedo a perder el control del inventario** es la mente-asesina
> del empresario. Paulus te da la visión para ver a través del desierto fiscal.

**Paulus** es el primer miembro de **Paulu**. Como Paul Atreides fue el primer
forastero en unir a los fremen, Paulus es la primera aplicación en unificar la
gestión empresarial colombiana. Te ayuda a controlar tu patrimonio: productos,
proveedores, bodegas, entradas de inventario, órdenes, despachos y más.
Construida con **Vue 3**, **TypeScript**, **Pinia** y **TailwindCSS 4**.

> Cada concepto técnico de esta guía lleva una referencia a la saga *Dune*.
> Glosario completo: [`raw/dune-lore-paul-atreides.md`](raw/dune-lore-paul-atreides.md)

---

## Stack tecnológico — *Arsenal de Muad'Dib*

| Capa | Tecnología | Referencia Dune |
|------|-----------|-----------------|
| Framework | **Vue 3.5** + Composition API (`<script setup>`) | *Visión de Muad'Dib* — reactividad que anticipa el estado |
| Lenguaje | **TypeScript 6.0** (strict mode) | *Crysknife* — precisión forjada, tipos que no fallan |
| Build | **Vite 8** | *Ornitóptero* — compilación veloz sobre el desierto |
| UI | **TailwindCSS 4.1** (tema oscuro stellar/cósmico) | *Traje stillsuit* — capas adaptativas al entorno |
| Estado | **Pinia 3** | *Sietch Tabr* — memoria colectiva del clan |
| Router | **Vue Router 5.1** | *Navegadores Guild* — rutas sagradas entre vistas |
| HTTP | **Axios 1.17** con interceptor Bearer token | *Gurney Halleck* — mensajero leal con sello Atreides |
| Animación | **@vueuse/motion 3** | *Weirding Way* — movimiento con propósito |
| Markdown | **vue-markdown-render** | *Los pergaminos de Irulan* — documentos formateados |

---

## Guía de instalación — *Primer vuelo en ornitóptero*

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

## Estructura de carpetas — *Caladan: arquitectura noble antes de Arrakis*

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
│   │   ├── productService.ts      # CRUD productos — *Cosecha de melange*
│   │   ├── providerService.ts     # CRUD proveedores — *Tratados del Landsraad*
│   │   ├── productEntryService.ts # CRUD entradas de producto — *Ecosistema de Kynes*
│   │   ├── orderService.ts        # CRUD órdenes + approve — *Contratos CHOAM*
│   │   ├── shipmentService.ts     # CRUD despachos — *Ornitópteros de salida*
│   │   ├── companyService.ts      # CRUD compañías + getCompanyByUser
│   │   ├── userService.ts         # GET / PUT perfil usuario
│   │   ├── wineryService.ts       # CRUD bodegas
│   │   ├── mainAddressService.ts  # CRUD direcciones principales
│   │   ├── taxInformationService.ts # CRUD información tributaria
│   │   ├── economicActivityService.ts # CRUD actividades económicas
│   │   └── historyService.ts       # Historial de inventario — *Visión del pasado de Paul*
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
│   │   │   ├── ProductEntryList.vue        # Lista de entradas — *Registro de cosechas*
│   │   │   └── ProductSelectionModal.vue   # Modal selección productos (multi-select, búsqueda)
│   │   ├── orders/
│   │   │   ├── OrderForm.vue               # Formulario orden compra/venta — *Contrato CHOAM*
│   │   │   ├── OrderList.vue               # Lista de órdenes — *Archivo imperial*
│   │   │   ├── OrderEditModal.vue          # Modal edición orden — *Thufir revisa estrategia*
│   │   │   ├── DispatchSummaryModal.vue    # Resumen de despacho — *Informe post-batalla*
│   │   │   └── AutomationConfirmModal.vue  # Confirmación automatización — *Profecía de Muad'Dib*
│   │   ├── shipments/
│   │   │   ├── ShipmentForm.vue            # Formulario despacho — *Ornitóptero cargado*
│   │   │   ├── ShipmentList.vue            # Lista de despachos — *Registro de vuelos*
│   │   │   ├── ShipmentEditModal.vue       # Modal edición despacho
│   │   │   ├── ShipmentDetailModal.vue     # Detalle completo — *Manifiesto de carga*
│   │   │   └── EntrySelectionModal.vue     # Selección entradas origen — *Cisternas de agua*
│   │   ├── wineries/
│   │   │   └── WineryRegistrationForm.vue  # Formulario bodega con fecha, área, unidades
│   │   ├── providers/
│   │   │   └── ProviderRegistrationForm.vue # Formulario proveedor con auto-generar código
│   │   ├── history/
│   │   │   ├── HistoryTimeline.vue         # Línea de tiempo de eventos — *Visión del pasado de Paul*
│   │   │   └── HistoryDetailModal.vue      # Modal de historial por entidad — *Visión enfocada de Muad'Dib*
│   │   ├── profile/
│   │   │   ├── UserProfile.vue             # Perfil usuario con avatar, cover, datos
│   │   │   └── EditProfileModal.vue        # Modal editar perfil + empresa
│   │   └── ui/
│   │       ├── AppAlert.vue       # Alerta reutilizable (error/warning/info/success)
│   │       └── appAlert.types.ts  # Tipo AppAlertVariant
│   ├── router/
│   │   └── index.ts               # 2 rutas: / (dashboard, auth), /auth
│   ├── composables/
│   │   ├── useQuantityValidation.ts # Validación stock — *Disciplina del agua fremen*
│   │   └── useHistoryLogger.ts      # Registro de eventos — *La voz de Paul*
│   ├── stores/
│   │   ├── authStore.ts           # Sesión, login, register, logout — *Memoria de Duncan*
│   │   ├── companyStore.ts        # companyId global — *Casa activa del Landsraad*
│   │   ├── productStore.ts        # CRUD productos — *Reserva de melange*
│   │   ├── productEntryStore.ts   # CRUD entradas producto — *Cisternas de Kynes*
│   │   ├── providerStore.ts       # CRUD proveedores — *Rolodex del Landsraad*
│   │   ├── wineryStore.ts         # CRUD bodegas — *Mapa de sietchs*
│   │   ├── orderStore.ts          # CRUD órdenes + approve — *Archivo CHOAM*
│   │   ├── shipmentStore.ts       # CRUD despachos — *Hangar de ornitópteros*
│   │   └── historyStore.ts        # Historial de inventario — *Memoria genética de Paul*
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

## Variables de entorno (`.env`) — *Coordenadas del Guild Navigator*

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base de la API REST (Go backend) | `http://localhost:8080` |

El proyecto usa `import.meta.env.VITE_API_BASE_URL` en `src/shared/config/api.ts` con fallback a `http://localhost:8080`. Puedes cambiar el puerto del dev server de Vite en `vite.config.ts`:

```ts
server: { port: 3000 }  // Opcional
```

---

## Componentes globales — *Arsenal del sietch*

### `AuthInput.vue` — Input de formulario con tema auth — *Prueba Bene Gesserit*

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

### `AuthButton.vue` — Botón con loading y variantes — *Grito de batalla fremen*

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

### `LoginForm.vue` — Formulario de inicio de sesión — *Duncan Idaho en la puerta*

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

### `RegisterForm.vue` — Formulario de registro — *Iniciación al sietch*

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

### `AppAlert.vue` — Alerta contextual reutilizable — *Voz Bene Gesserit*

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

### `SupplierSelectionModal.vue` — Modal de selección de proveedor — *Elegir aliado fremen*

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

### `ProductSelectionModal.vue` — Modal de selección múltiple de productos — *Elegir grano de melange*

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

### `CompanyRequiredModal.vue` — Modal persuasivo de empresa requerida — *Shadout Mapes*

```vue
<CompanyRequiredModal @register="goToCompanyRegistration" @close="showModal = false" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Cerrar modal |
| `register` | — | Ir a registro de empresa |

Usa psicología persuasiva: pérdida ("Sin empresa no puedes gestionar inventario"), prueba social ("Todas las empresas colombianas registran su compañía primero"), y urgencia.

---

### `OnboardingModal.vue` — Modal de onboarding con beneficios — *Litany Against Fear*

```vue
<OnboardingModal @register="goToCompanyRegistration" @close="showOnboarding = false" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Cerrar modal |
| `register` | — | Ir a registro de empresa |

Muestra 4 tarjetas de beneficios con iconos: facturación fiscal, control de inventario, proveedores, información tributaria.

---

### `CompanyRegistrationForm.vue` — Formulario multi-step de 6 pasos — *Duke Leto funda la Casa*

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

### `ProviderRegistrationForm.vue` — Formulario de registro de proveedor — *Tratado del Landsraad*

```vue
<ProviderRegistrationForm @saved="onProviderSaved" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Proveedor registrado exitosamente |

Campos: código (auto-generado), tipo persona, tipo documento, número documento, dígito verificación, razón social, estado (activo/inactivo).

---

### `ProductRegistrationForm.vue` — Formulario de registro de producto — *Cosecha de especia*

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

### `ProductEditModal.vue` — Modal de edición de producto — *Refinar la cosecha*

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

### `ProductList.vue` — Lista de productos con búsqueda — *Inventario del sietch*

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

### `ConfirmDeleteModal.vue` — Confirmación de eliminación — *Agua derramada*

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

### `WineryRegistrationForm.vue` — Formulario de registro de bodega — *Fundar un sietch*

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

### `WinerySelectionModal.vue` — Modal de selección de bodega — *Elegir sietch destino*

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

### `ProductEntryForm.vue` — Formulario de entrada de producto — *Dr. Kynes: equilibrio ecológico*

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

### `UserProfile.vue` — Vista de perfil de usuario — *Identidad de Usul*

```vue
<UserProfile @open-edit="showEditModal = true" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `open-edit` | — | Abrir modal de edición |

Muestra: cover image, avatar iniciales, nombre, email, ID, teléfono, y tarjetas de datos de empresa (NIT, razón social, tipo, régimen fiscal).

---

### `EditProfileModal.vue` — Modal de edición de perfil — *Renacer en el sietch*

```vue
<EditProfileModal @saved="refreshProfile" @close="showEditModal = false" />
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `save` | — | Perfil actualizado exitosamente |
| `close` | — | Cerrar modal |

Campos editables: nombre, teléfono, email, y datos de compañía (NIT, razón social, nombre comercial, teléfono, celular, email, dirección, país, departamento).

---

### `ProductEntryList.vue` — Lista de entradas de producto — *Registro de cosechas*

```vue
<ProductEntryList />
```

Muestra tabla con entradas registradas: número, fecha, tipo de movimiento, bodega, responsable y totales. Permite consultar el histórico de lo que entró al ecosistema del inventario — como Kynes registraba cada transformación de Arrakis.

---

### `OrderForm.vue` — Formulario de orden de compra/venta — *Contrato CHOAM*

```vue
<OrderForm
  @saved="onOrderSaved"
  @go-to-provider-registration="showProviderForm"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Orden registrada exitosamente |
| `go-to-provider-registration` | — | Redirige a registro de proveedor si falta aliado |

Secciones:
- **Encabezado**: Número de orden, fecha, tipo (compra/venta), solicitante
- **Detalle dinámico**: Productos con cantidad solicitada, costo estimado, subtotal
- **Resumen financiero**: Subtotal, IVA, descuento, total
- **Motivo de la orden**: Textarea con justificación

Como los contratos CHOAM regulaban la economía imperial, cada orden formaliza la intención comercial antes de que los Fedaykin (aprobación) la ejecuten.

---

### `OrderList.vue` — Lista de órdenes — *Archivo de contratos imperiales*

```vue
<OrderList />
```

Tabla con órdenes registradas. Acciones: ver, editar (`OrderEditModal`), aprobar (`approveOrder` — *Fedaykin confirman la misión*), eliminar. Filtros por estado y búsqueda.

---

### `OrderEditModal.vue` — Modal de edición de orden — *Thufir revisa la estrategia*

```vue
<OrderEditModal :order="order" @saved="refreshList" @cancel="closeModal" />
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `order` | `OrderResponse` | Orden a editar |

Permite modificar detalle, resumen financiero y motivo antes de la aprobación final.

---

### `DispatchSummaryModal.vue` — Resumen de despacho — *Informe post-batalla*

Modal que muestra el resumen tras completar un despacho vinculado a una orden: productos despachados, cantidades y totales.

---

### `ShipmentForm.vue` — Formulario de despacho (salida) — *Ornitóptero cargado de especia*

```vue
<ShipmentForm
  @saved="onShipmentSaved"
  @go-to-product-registration="showProductForm"
  @go-to-provider-registration="showProviderForm"
/>
```

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `saved` | — | Despacho registrado exitosamente |
| `go-to-product-registration` | — | Ir a registro de producto |
| `go-to-provider-registration` | — | Ir a registro de proveedor |

Secciones:
- **Encabezado**: Número de despacho, fecha, tipo de movimiento, bodega, responsable
- **Documento origen**: Selección de entradas vía `EntrySelectionModal` (*cisternas de agua*)
- **Destinatario**: Tipo e ID del receptor
- **Tabla dinámica de detalles**: Código, producto, cantidad, costo unitario, subtotal
- **Resumen financiero** y observaciones

Usa `useQuantityValidation` (*disciplina del agua fremen*) para impedir despachar más unidades de las disponibles en las entradas seleccionadas.

---

### `ShipmentList.vue` — Lista de despachos — *Registro de vuelos del desierto*

```vue
<ShipmentList />
```

Tabla con despachos: número, fecha, tipo, bodega, destinatario, total. Acciones: ver detalle (`ShipmentDetailModal`), editar (`ShipmentEditModal`), eliminar.

---

### `EntrySelectionModal.vue` — Selección de entradas origen — *Elegir cisterna de agua*

```vue
<EntrySelectionModal
  :company-id="companyId"
  @close="close"
  @confirm="onEntriesSelected"
/>
```

Multi-select de entradas de producto que servirán como origen del despacho. Las cantidades disponibles alimentan la validación de stock.

---

### `useQuantityValidation.ts` — Composable de validación de cantidades — *Disciplina del agua*

```typescript
const { availableQuantities, quantityErrors, validateQuantity, clearQuantityErrors } =
  useQuantityValidation(selectedEntries)
```

Como los fremen no desperdician una gota de agua, este composable impide que la cantidad despachada supere el stock disponible en las entradas seleccionadas. Retorna errores por código de producto con mensaje persuasivo.

---

### `HistoryTimeline.vue` — Línea de tiempo del historial — *Visión del pasado de Paul*

> *"Paul veía múltiples caminos. Esta línea de tiempo te muestra el que ya
> recorriste: cada evento del inventario, ordenado y con todos sus detalles."*

```vue
<HistoryTimeline
  :entries="historyStore.entries"
  :is-loading="historyStore.isLoading"
  title="Historial de Inventario"
/>
```

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| `entries` | `HistoryEntry[]` | — | Array de eventos a mostrar (requerido) |
| `isLoading` | `boolean` | `false` | Muestra spinner de carga |
| `title` | `string` | `"Historial de Actividad"` | Título del componente |

**Características:**

- **Búsqueda en vivo:** Filtra instantáneamente por descripción, tipo de entidad,
  acción, ID de usuario, ID de entidad o nombre de producto. *(Paul escanea sus
  visiones con la mirada)*
- **Código de colores:** Cada acción tiene un color único:
  - `CREATE` → verde esmeralda *(nacimiento de un camino)*
  - `UPDATE` → azul índigo *(evolución de la visión)*
  - `DELETE` → rojo rosado *(muerte de un hilo)*
  - `APPROVE` → teal *(confirmación Fedaykin)*
  - `DEDUCT` → ámbar *(especia que fluye)*
  - `LOGIN` / `LOGOUT` → índigo / gris *(puerta de Duncan)*
  - `REGISTER` → púrpura *(iniciación al sietch)*
  - `SHIPMENT_CREATED` → cian *(ornitóptero en vuelo)*
  - `ORDER_CREATED` → ámbar *(contrato CHOAM)*
  - `ENTRY_CREATED` → verde *(equilibrio de Kynes)*
  - `RELATION_CREATED` → rosa *(alianza entre Casas)*
- **Panel expandible:** Haz clic en la flecha para ver detalles completos:
  nombre del usuario (resuelto desde la API), nombre del producto, compañía,
  resultado (Éxito / Falló), IP y fecha formateada. *(Paul profundiza en un
  solo hilo del destino)*
- **Estados:** Muestra "No hay actividad registrada aún" si está vacío, o
  "Sin resultados" si la búsqueda no coincide. *(Incluso el silencio del
  oráculo es un mensaje)*
- **Diseño oscuro:** Nebulosa púrpura de fondo con orbes de gradiente, ideal
  para el tema stellar/cósmico de Paulus. *(Como las estrellas de Arrakis
  observando el desierto)*

**Etiquetas de acción en español:**

| Acción API | Etiqueta visible |
|-----------|-----------------|
| `CREATE` | *Creación* |
| `UPDATE` | *Actualización* |
| `DELETE` | *Eliminación* |
| `APPROVE` | *Aprobación* |
| `DEDUCT` | *Deducción* |
| `LOGIN` | *Inicio de sesión* |
| `LOGOUT` | *Cierre de sesión* |
| `REGISTER` | *Registro* |
| `SHIPMENT_CREATED` | *Despacho creado* |
| `ORDER_CREATED` | *Orden creada* |
| `ENTRY_CREATED` | *Entrada creada* |
| `RELATION_CREATED` | *Relación creada* |

---

### `HistoryDetailModal.vue` — Modal de historial por entidad — *Visión enfocada de Muad'Dib*

```vue
<HistoryDetailModal
  entity-type="order"
  entity-id="1749372100_020"
  entity-label="Orden"
  @close="showModal = false"
/>
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `entity-type` | `string` | Tipo de entidad (order, product, shipment, product-entry) |
| `entity-id` | `string` | ID de la entidad a consultar |
| `entity-label` | `string` | Etiqueta visible para el título (opcional) |

| Evento | Disparo |
|--------|---------|
| `close` | Click en overlay o botón de cerrar |

Al abrirse, carga automáticamente todos los eventos relacionados con esa
entidad específica. Ideal para ver el ciclo de vida completo de una orden,
un producto o un despacho. *(Como Paul enfoca su visión en un solo fremen
para conocer su destino completo)*

---

### `useHistoryLogger.ts` — Composable de registro de eventos — *La voz de Paul*

```typescript
const logger = useHistoryLogger()

await logger.logCreate({ entityType: 'product', entityId: '123', details: 'Café especial creado' })
await logger.logUpdate({ entityType: 'order', entityId: '456', details: 'Orden actualizada', changes: { ... } })
await logger.logDelete({ entityType: 'product', entityId: '789', details: 'Producto eliminado' })
await logger.logApprove({ entityType: 'order', entityId: '012', details: 'Orden aprobada' })
await logger.logDeduct({ entityType: 'shipment', entityId: '345', details: 'Inventario deducido' })
```

| Función | Parámetros | Descripción |
|---------|-----------|-------------|
| `logCreate` | `{ entityType, entityId, details, changes? }` | Registra la creación de un recurso |
| `logUpdate` | `{ entityType, entityId, details, changes? }` | Registra la modificación de un recurso |
| `logDelete` | `{ entityType, entityId, details }` | Registra la eliminación de un recurso |
| `logApprove` | `{ entityType, entityId, details }` | Registra la aprobación de una orden |
| `logDeduct` | `{ entityType, entityId, details, changes? }` | Registra la deducción de inventario |

Cada función extrae automáticamente el usuario de `authStore` (como Paul
recuerda quién es en cada visión) y envía el evento al backend. No requiere
configuración adicional — solo importar y llamar.

**Componentes que lo usan:**
- `ProductRegistrationForm` — `logCreate` al registrar un producto
- `ProductList` — `logDelete` al eliminar un producto
- `OrderForm` — `logCreate` y `logDeduct` al crear/deducir una orden
- `OrderEditModal` — `logUpdate` al editar una orden
- `OrderList` — `logDelete` y `logApprove` al eliminar/aprobar una orden
- `ShipmentForm` — `logCreate` y `logDeduct` al crear/deducir un despacho
- `authStore` — `LOGIN`, `REGISTER`, `LOGOUT` (llamada directa al servicio)

---

## Flujo de autenticación — *Duncan Idaho guarda la puerta*

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

## Asistente Paulu — *La Voz de Paulu Areides*

> *"El asistente que consulta datos reales del sistema para responderte con
> información actualizada y precisa."*

### Acceso

Haz clic en el **botón cerebral flotante** (esquina inferior derecha) para abrir
el chat del asistente Paulu.

### Mensaje de bienvenida

Al iniciar, Paulu se presenta automáticamente:

```
Bienvenido. Soy Paulu, y estoy aquí para ayudarte a mantener el orden
en lo que más importa: el flujo de tu negocio.

En mi casa aprendemos que el control de los recursos no es solo una tarea —
es la base sobre la que se sostiene cualquier operación.

¿Por dónde quieres empezar?
• Inventario — Stock, Entradas y Salidas
• Órdenes — Estado y seguimiento
• Finanzas — Márgenes y rentabilidad
• Productos — Más vendidos y rotación
```

### Características

| Característica | Descripción |
|---|---|
| **Renderizado Markdown** | Tablas, listas, encabezados, código, blockquotes |
| **Sonido de campana** | Notificación sonora al recibir respuesta |
| **Consulta de datos** | Accede a productos, órdenes, entradas y salidas |
| **Formato optimizado** | Párrafos cortos, negritas para datos principales |
| **Pantalla completa** | Botón para expandir/contraer el chat |
| **Modelos locales** | Compatible con Ollama, LM Studio, vLLM |

### Formato de respuesta

- **Prosa directa** para datos simples; **tabla** para 4+ registros
- **Párrafos** de máximo 3 líneas; una idea por párrafo
- **Negritas** solo para el dato principal; máximo 2 por mensaje
- **Emojis** como marcadores de sección, no como decoración
- **Cierre** siempre con pregunta o invitación a profundizar
- **Sin** saludos largos ni frases de cierre formales

### Ejemplos de uso

```
Usuario: ¿Qué productos hay?
Paulu:   Aquí tienes los productos registrados:

         | # | Nombre | Precio | Stock | Margen |
         |---|--------|--------|-------|--------|
         | 1 | Café especial | $12.000 | 45 | 35% |
         | 2 | Té verde | $8.500 | 30 | 28% |

         ¿Quieres ver el detalle de alguno?

Usuario: Muéstrame la orden 5
Paulu:   La orden #5 está en estado **pendiente** con un total de $45.000.
         Fue registrada el 15 de junio de 2026.

         ¿Necesitas aprobarla o editarla?
```

### Configuración del modelo

Para usar el asistente, necesitas configurar un modelo de IA en
**Modelos de IA** del menú lateral:

1. Selecciona un proveedor (Gemini, Codex, OpenCloud, Kimi o Local)
2. Ingresa tu API Key o URL del servidor local
3. Verifica la conexión
4. El modelo queda listo para usar

### Restricciones del asistente

- **Dominio permitido**: Solo finanzas e inventario
- **Sin código**: No genera código de programación
- **Sin temas externos**: No responde sobre salud, literatura o filosofía
- **Sin mencionar API**: No revela cómo obtiene los datos
- **Sin IDs internos**: Usa numeración secuencial (1, 2, 3...)

---

## Convenciones del proyecto — *Código de honor Atreides*

- **Componentes**: Composition API con `<script setup lang="ts">`, props tipadas con `defineProps<T>()`, eventos con `defineEmits<T>()`
- **Eventos**: `defineEmits()` debe capturarse como `const emit = defineEmits<...>()`
- **Store**: Setup stores con `defineStore('name', () => { ... })`, retorno de refs/funciones
- **Servicios**: Funciones independientes que llaman `axiosInstance`, tipadas con interfaces locales
- **Estilos**: TailwindCSS v4 con `@apply` no usado — clases directamente en template. Tema dark via `@custom-variant dark`
- **Rutas**: 2 rutas planas (`/` y `/auth`), sin rutas anidadas. La navegación interna es SPA-style con `activeNav` + `navItems` en `DashboardPage.vue`
