# Guía de Implementación — Paulus + Paulu

> Versión 2.0 — Documentación técnica de todo lo construido: frontend Vue 3 (Paulus), backend Go (Paulu), y herramientas de análisis (graphify).

---

## 1. Resumen del proyecto

| Componente | Nombre | Stack | Ubicación |
|---|---|---|---|
| Frontend | **Paulus** | Vue 3 + TypeScript + Pinia + Tailwind CSS 4 | `D:\Vue\book-coffee-shop\` |
| Backend API | **Paulu** | Go + PostgreSQL + JWT | `D:\Go\api-book-coffee-shop\` |

---

## 2. Frontend — Paulus (Vue 3)

### 2.1 Arquitectura

Clean Architecture con 4 capas:

```
src/
├── presentation/     # Componentes Vue, Pages, Stores, Router, Validators
├── application/      # Use Cases, Services (HTTP), DTOs
├── domain/           # Entities, Value Objects, Repository Interfaces
├── infrastructure/   # HTTP Client (Axios), Repository Impl, DI Container
├── shared/           # Config, Token Storage
```

### 2.2 Patrón de inyección de dependencias

`src/infrastructure/di/container.ts` — contenedor manual:

```
container → LoginUseCase → AuthRepository → AxiosHttpClient → axiosInstance
         → RegisterUseCase → AuthRepository → AxiosHttpClient → axiosInstance
```

Los stores (Pinia) importan el container directamente:
```typescript
import { container } from '@/infrastructure/di/container'
```

### 2.3 Servicios HTTP (capa application)

A diferencia del patrón de repositorio usado para auth, los servicios de producto, empresa y usuario llaman directamente a `axiosInstance` (NO usan el contenedor DI ni `IHttpClient`):

| Servicio | Archivo | Endpoints |
|---|---|---|---|
| `productService` | `src/application/services/productService.ts` | GET/POST/PUT/DELETE `/products` |
| `companyService` | `src/application/services/companyService.ts` | GET `/companies/user/{id}`, POST/PUT `/companies` |
| `wineryService` | `src/application/services/wineryService.ts` | GET/POST/PUT/DELETE `/wineries` |
| `mainAddressService` | `src/application/services/mainAddressService.ts` | POST `/main-addresses` |
| `taxInformationService` | `src/application/services/taxInformationService.ts` | POST `/tax-information` |
| `economicActivityService` | `src/application/services/economicActivityService.ts` | POST `/economic-activities` |
| `userService` | `src/application/services/userService.ts` | PUT `/users/{id}` |
| `providerService` | `src/application/services/providerService.ts` | GET/POST/PUT/DELETE `/providers` |
| `productEntryService` | `src/application/services/productEntryService.ts` | GET/POST/PUT/DELETE `/product-entries` |

### 2.4 Stores (Pinia)

| Store | Archivo | Propósito |
|---|---|---|---|
| `useAuthStore` | `src/presentation/stores/authStore.ts` | Login, register, logout, sesión persistente |
| `useProductStore` | `src/presentation/stores/productStore.ts` | CRUD de productos con estado |
| `useCompanyStore` | `src/presentation/stores/companyStore.ts` | companyId global |
| `useProviderStore` | `src/presentation/stores/providerStore.ts` | CRUD de proveedores |
| `useProductEntryStore` | `src/presentation/stores/productEntryStore.ts` | CRUD de entradas de producto |
| `useWineryStore` | `src/presentation/stores/wineryStore.ts` | CRUD de bodegas |

### 2.5 Enrutamiento

- 2 rutas: `/` (Dashboard) y `/auth` (Auth)
- Guardia `beforeEach` que redirige según sesión
- Transiciones animadas con `mode="out-in"`

### 2.6 Componentes principales

| Componente | Archivo | Propósito |
|---|---|---|---|
| DashboardPage | `src/presentation/pages/DashboardPage.vue` | Panel principal con sidebar, nav, vistas dinámicas (productos, bodegas, perfil) |
| AuthPage | `src/presentation/pages/AuthPage.vue` | Login/register con tabs animados |
| ProductRegistrationForm | `src/presentation/components/products/ProductRegistrationForm.vue` | Formulario completo de producto con multi-empresa, selección proveedor/bodega, auto-winery prompt |
| ProductEditModal | `src/presentation/components/products/ProductEditModal.vue` | Modal edición producto con todos los campos |
| ProductList | `src/presentation/components/products/ProductList.vue` | Tabla de productos con búsqueda, editar, eliminar |
| ConfirmDeleteModal | `src/presentation/components/products/ConfirmDeleteModal.vue` | Confirmación con psicología de inventario |
| SupplierSelectionModal | `src/presentation/components/products/SupplierSelectionModal.vue` | Modal selección proveedor |
| WinerySelectionModal | `src/presentation/components/products/WinerySelectionModal.vue` | Modal selección bodega |
| WineryRegistrationForm | `src/presentation/components/wineries/WineryRegistrationForm.vue` | Formulario registro bodega (fecha, área, unidades) |
| CompanyRegistrationForm | `src/presentation/components/company/CompanyRegistrationForm.vue` | Wizard 6 pasos + 4 llamadas API paralelas |
| UserProfile | `src/presentation/components/profile/UserProfile.vue` | Perfil de usuario + datos de empresa |
| EditProfileModal | `src/presentation/components/profile/EditProfileModal.vue` | Modal editar perfil + empresa |
| ProductEntryForm | `src/presentation/components/productEntries/ProductEntryForm.vue` | Formulario entrada producto con tabla dinámica |
| ProviderRegistrationForm | `src/presentation/components/providers/ProviderRegistrationForm.vue` | Formulario registro proveedor |

### 2.7 Manejo de errores

- `HttpError` class con status code
- `authAlertMessages.ts` traduce errores crudos a alertas con variante, título y botones
- `AppAlert.vue` banner reutilizable con 4 variantes (error, warning, info, success)
- Validación por campo en formularios con `fieldErrors` reactivo

### 2.8 Autenticación

- JWT HS256, 24h expiración
- Token inyectado automáticamente via Axios interceptor
- Sesión persistida en `localStorage` (`auth_token`, `auth_session`)
- Store inicializa sesión desde `localStorage` al cargar

---

## 3. Backend — Paulu (Go API)

### 3.1 Arquitectura

```
cmd/api/
├── main.go                    # Entry point, registros de rutas, migraciones
internal/
├── domain/                    # Modelos de dominio (structs)
├── usecase/                   # Lógica de negocio
├── handler/                   # Handlers HTTP
├── infrastructure/            # Repositorios PostgreSQL, JWT, Bcrypt
├── repository/                # Interfaces de repositorio
├── middleware/                # Recovery middleware
├── config/                    # Configuración (DB, JWT)
├── database/                  # Creación de BD
```

### 3.2 Productos — Modelo de dominio

```go
type Product struct {
    ID           string    `json:"id"`
    CompanyID    string    `json:"company_id"`
    Name         string    `json:"name"`
    ProductCode  string    `json:"product_code"`
    Categories   []string  `json:"categories"`
    Unit         string    `json:"unit"`
    MinimumStock float64   `json:"minimum_stock"`
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`
}
```

### 3.3 Productos — Use case

**Interfaz:**
```go
type ProductUseCase interface {
    Create(companyID, name, productCode string, categories []string, unit string, minimumStock float64) (*domain.Product, error)
    GetByID(id string) (*domain.Product, error)
    GetAll() ([]*domain.Product, error)
    Update(id, name, productCode string, categories []string, unit string, minimumStock float64) (*domain.Product, error)
    Delete(id string) error
}
```

**Validaciones:**
| Campo | Validación |
|---|---|
| `companyID` | No validado en use case (viene del handler, requerido) |
| `name` | No vacío |
| `product_code` | No vacío |
| `categories` | No vacío (al menos 1) |
| `unit` | No vacío, debe estar en `validUnits` |
| `minimum_stock` | Sin validación específica |

**Unidades válidas:** `["Kg", "Litro", "Libra", "Gramos", "Unidad"]`

### 3.4 Productos — Handler HTTP

| Método | Ruta | Request body incluye |
|---|---|---|
| `GET` | `/products` | — |
| `GET` | `/products/{id}` | — |
| `POST` | `/products` | `company_id`, `name`, `product_code`, `categories`, `unit`, `minimum_stock` |
| `PUT` | `/products/{id}` | `name`, `product_code`, `categories`, `unit`, `minimum_stock` (sin `company_id`) |
| `DELETE` | `/products/{id}` | — |

### 3.5 Productos — Base de datos

**Migración:**
```sql
CREATE TABLE IF NOT EXISTS products (
    id            VARCHAR(50) PRIMARY KEY,
    company_id    VARCHAR(50) NOT NULL DEFAULT '',
    name          VARCHAR(255) NOT NULL DEFAULT '',
    product_code  VARCHAR(255) NOT NULL,
    categories    TEXT[] NOT NULL DEFAULT '{}',
    unit          VARCHAR(50) NOT NULL,
    minimum_stock DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

### 3.6 Helpers compartidos

Definidos en `internal/handler/author_handler.go`:
```go
func writeJSON(w http.ResponseWriter, data any, status int)
func writeError(w http.ResponseWriter, msg string, status int)
```

### 3.7 Configuración

| Parámetro | Valor |
|---|---|
| Puerto | `:8080` |
| CORS origines | `http://localhost:5173` |
| Base de datos | PostgreSQL (configurable vía `config.DefaultPostgresConfig()`) |
| JWT | HS256, secreto desde `config.JWTSecret()` |

---

## 4. Registro de productos — Flujo completo

### 4.1 Frontend → Backend

```
ProductRegistrationForm (mount)
  → getCompanyByUser(userId) → GET /companies/user/{userId}
  → companyId se almacena en ref local
  → Usuario llena formulario:
      - Nombre (input text)
      - Código (input text o botón "Generar" → PROD-{timestamp}-{random})
      - Categorías (tag input con Enter para agregar/quitar)
      - Unidad (select: Kg, Litro, Libra, Gramos, Unidad)
      - Stock mínimo (number input)
      - Imagen (file input → FileReader → previsualización base64)
  → handleSubmit()
      → validate() local (todos los campos llenos, stock >= 0)
      → productStore.createProduct({ company_id, name, product_code, categories, unit, minimum_stock })
      → POST /products (via productService → axiosInstance)
      → Backend: handler → useCase → repository → PostgreSQL
      → Respuesta: Product creado con id, timestamps
      → Store actualiza lista local
      → Form se resetea
      → Toast de éxito
```

### 4.2 Consideraciones de diseño

- **company_id** se obtiene automáticamente del usuario logueado, no es ingresado manualmente
- **product_code** puede ser manual o auto-generado (frontend-only, sin interacción con backend)
- **product_image** es solo previsualización frontend via `FileReader`; NO se envía al backend
- Las **unidades en español** deben coincidir exactamente entre frontend (`VALID_UNITS`) y backend (`validUnits`) o el backend rechazará la petición

---

## 5. Graphify — Análisis de grafos de código

### 5.1 Herramienta

[graphify](https://github.com/anomalyco/graphify) — análisis estático de código que genera grafos de dependencia, comunidades y métricas.

**Uso:**
```powershell
python -m graphify
```

### 5.2 Resultados

| Proyecto | Nodos | Aristas | Comunidades | Activo |
|---|---|---|---|---|---|
| Go API (Paulu) | 839 | 1484 | 96 | ✅ |
| Vue Paulus | 459 | 446 | 74 | ✅ |

### 5.3 Archivos generados

Cada proyecto genera en su directorio `graphify-out/`:
| Archivo | Descripción |
|---|---|
| `graph.json` | Datos del grafo (nodos, aristas) |
| `graph.html` | Visualización interactiva del grafo |
| `GRAPH_REPORT.md` | Reporte detallado con análisis de comunidades |

### 5.4 Skills de OpenCode

Instalados en `.claude/skills/graphify/SKILL.md` con referencias en `.claude/skills/graphify/references/`:
- `extraction-spec.md` — Especificación de extracción
- `github-and-merge.md` — Flujo de merge
- `hooks.md` — Hooks
- `query.md` — Consultas
- `transcribe.md` — Transcripción
- `update.md` — Actualización
- `exports.md` — Exportación
- `add-watch.md` — Watch mode

---

## 6. Nuevo proyecto generado — Paulu (Vue)

Generado en `C:\Users\Aizen\Desktop\paulu\src\` (42 archivos).

**Graphify:**
- 127 nodos, 137 aristas, 26 comunidades
- 100% coverage EXTRACTED

---

## 7. Convenciones del código

### 7.1 Frontend

- **Idioma:** Español (UI, validaciones, comentarios)
- **Estilo:** Composition API con `<script setup lang="ts">`
- **Tipado:** TypeScript strict mode
- **Nomenclatura API:** snake_case (`product_code`, `company_id`)
- **Nomenclatura frontend:** camelCase (`productCode`, `companyId`)
- **Mapeo API→dominio:** `name_full` → `fullName`, `id_number` → `idNumber` (en AuthRepository)
- **Estilos:** Tailwind CSS v4 con clases utilitarias
- **Store pattern:** Pinia composition stores con arrow functions

### 7.2 Backend

- **Idioma:** Inglés (código), Español (mensajes de error al usuario)
- **Nomenclatura:** camelCase en Go (`ProductCode`, `MinimumStock`), snake_case en JSON (`product_code`, `minimum_stock`)
- **Handlers:** Un solo `Handle()` por recurso con `switch (r.Method)`
- **Validación:** En use case, no en handler
- **IDs:** Generados con timestamp + random, formato `"20250613120000A"`

---

## 8. Variables de entorno

| Variable | Default | Propósito |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base de la API (frontend) |
| JWT secret (config) | `config.JWTSecret()` | Secreto para firmar tokens JWT |
| PG DSN (config) | `config.DefaultPostgresConfig()` | Conexión a PostgreSQL |

---

## 9. Comandos útiles

### Frontend (Paulus)

```powershell
# Desarrollo
cd D:\Vue\book-coffee-shop
npm run dev

# Build
npm run build

# Type check
npx vue-tsc --noEmit

# Graphify
cd D:\Vue\book-coffee-shop
graphify update .
```

### Backend (Paulu)

```powershell
# Desarrollo
cd D:\Go\api-book-coffee-shop
go run cmd/api/main.go

# Build
go build ./cmd/api/

# Graphify
cd D:\Go\api-book-coffee-shop
graphify update .
```

---

## 10. Referencias

| Recurso | Ubicación |
|---|---|
| Documentación API | `D:\Go\api-book-coffee-shop\Paulu.md` |
| Guía de usuario Paulus | `D:\Vue\book-coffee-shop\PAULU_USER_GUIDE.md` |
| Graph Report (Go) | `D:\Go\api-book-coffee-shop\graphify-out\GRAPH_REPORT.md` |
| Graph Report (Vue) | `D:\Vue\book-coffee-shop\graphify-out\GRAPH_REPORT.md` |
| Product handler | `D:\Go\api-book-coffee-shop\internal\handler\product_handler.go` |
| Product use case | `D:\Go\api-book-coffee-shop\internal\usecase\product_usecase.go` |
| Product repository | `D:\Go\api-book-coffee-shop\internal\infrastructure\postgres_product_repository.go` |
| Winery handler | `D:\Go\api-book-coffee-shop\internal\handler\winery_handler.go` |
| Winery use case | `D:\Go\api-book-coffee-shop\internal\usecase\winery_usecase.go` |
| Product form (Vue) | `D:\Vue\book-coffee-shop\src\presentation\components\products\ProductRegistrationForm.vue` |
| Winery form (Vue) | `D:\Vue\book-coffee-shop\src\presentation\components\wineries\WineryRegistrationForm.vue` |
| Product store (Vue) | `D:\Vue\book-coffee-shop\src\presentation\stores\productStore.ts` |
| Winery store (Vue) | `D:\Vue\book-coffee-shop\src\presentation\stores\wineryStore.ts` |
