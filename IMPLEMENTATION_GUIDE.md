# Guía de Implementación — Paulus + Paulu

> Versión 2.1 — Documentación técnica de todo lo construido: frontend Vue 3 (Paulus), backend Go (Paulu), y herramientas de análisis (graphify).
>
> Cada sección incluye su paralelo en la saga *Dune*. Glosario canónico:
> [`raw/dune-lore-paul-atreides.md`](raw/dune-lore-paul-atreides.md)

---

## 1. Resumen del proyecto — *El ascenso de Muad'Dib*

> *Inspirado en el viaje de Paul Atreides — de heredero de la Casa Atreides a líder de los fremen.
> Paulus (frontend) es la voz visible; Paulu (backend) es la maquinaria que sostiene el poder.*

| Componente | Nombre | Inspiración Dune | Stack | Ubicación |
|---|---|---|---|---|
| Frontend | **Paulus** | *"El Primer Miembro"* — como Paul al unir a los fremen | Vue 3 + TypeScript + Pinia + Tailwind CSS 4 | `D:\Vue\book-coffee-shop\` |
| Backend API | **Paulu** | *"La Casa"* — la infraestructura Atreides que lo sostiene todo | Go + PostgreSQL + JWT | `D:\Go\api-book-coffee-shop\` |

---

## 2. Frontend — Paulus (Vue 3) — *Rostro de Paul ante los fremen*

### 2.1 Arquitectura — *Caladan: estructura noble en cuatro capas*

Clean Architecture con 4 capas:

```
src/
├── presentation/     # Componentes Vue, Pages, Stores, Router — *Rostro visible de Muad'Dib*
├── application/      # Use Cases, Services (HTTP), DTOs — *Estrategia de Thufir Hawat*
├── domain/           # Entities, Value Objects, Repository Interfaces — *Código de honor Atreides*
├── infrastructure/   # HTTP Client (Axios), Repository Impl, DI Container — *Fortaleza Sardaukar*
├── shared/           # Config, Token Storage — *Reservas de agua del sietch*
```

### 2.2 Patrón de inyección de dependencias — *Mentat Thufir*

`src/infrastructure/di/container.ts` — contenedor manual:

```
container → LoginUseCase → AuthRepository → AxiosHttpClient → axiosInstance
         → RegisterUseCase → AuthRepository → AxiosHttpClient → axiosInstance
```

Los stores (Pinia) importan el container directamente:
```typescript
import { container } from '@/infrastructure/di/container'
```

### 2.3 Servicios HTTP (capa application) — *Exploradores fremen*

A diferencia del patrón de repositorio usado para auth (*Duncan Idaho — protocolo formal*), los servicios de producto, empresa, órdenes y despachos llaman directamente a `axiosInstance` via *Gurney Halleck* (NO usan el contenedor DI ni `IHttpClient`):

| Servicio | Archivo | Endpoints | Referencia Dune |
|---|---|---|---|
| `productService` | `src/application/services/productService.ts` | GET/POST/PUT/DELETE `/products` | *Cosecha de melange* |
| `companyService` | `src/application/services/companyService.ts` | GET `/companies/user/{id}`, POST/PUT `/companies` | *Fundar Casa en Arrakis* |
| `wineryService` | `src/application/services/wineryService.ts` | GET/POST/PUT/DELETE `/wineries` | *Sietch Tabr* |
| `mainAddressService` | `src/application/services/mainAddressService.ts` | POST `/main-addresses` | *Coordenadas del bled* |
| `taxInformationService` | `src/application/services/taxInformationService.ts` | POST `/tax-information` | *Desierto fiscal* |
| `economicActivityService` | `src/application/services/economicActivityService.ts` | POST `/economic-activities` | *Actividad CHOAM* |
| `userService` | `src/application/services/userService.ts` | PUT `/users/{id}` | *Identidad de Usul* |
| `providerService` | `src/application/services/providerService.ts` | GET/POST/PUT/DELETE `/providers` | *Tratados del Landsraad* |
| `productEntryService` | `src/application/services/productEntryService.ts` | GET/POST/PUT/DELETE `/product-entries` | *Ecosistema de Kynes* |
| `orderService` | `src/application/services/orderService.ts` | GET/POST/PUT/DELETE `/orders`, PATCH `/orders/{id}/approve` | *Contratos CHOAM + Fedaykin* |
| `shipmentService` | `src/application/services/shipmentService.ts` | GET/POST/PUT/DELETE `/shipments` | *Ornitópteros de salida* |

### 2.4 Stores (Pinia) — *Sietch Tabr: memoria colectiva*

| Store | Archivo | Propósito | Referencia Dune |
|---|---|---|---|
| `useAuthStore` | `src/presentation/stores/authStore.ts` | Login, register, logout, sesión persistente | *Memoria de Duncan Idaho* |
| `useProductStore` | `src/presentation/stores/productStore.ts` | CRUD de productos con estado | *Reserva de melange* |
| `useCompanyStore` | `src/presentation/stores/companyStore.ts` | companyId global, multi-empresa | *Casa activa del Landsraad* |
| `useProviderStore` | `src/presentation/stores/providerStore.ts` | CRUD de proveedores | *Rolodex del Landsraad* |
| `useProductEntryStore` | `src/presentation/stores/productEntryStore.ts` | CRUD de entradas de producto | *Cisternas de Kynes* |
| `useWineryStore` | `src/presentation/stores/wineryStore.ts` | CRUD de bodegas | *Mapa de sietchs* |
| `useOrderStore` | `src/presentation/stores/orderStore.ts` | CRUD de órdenes + `approveOrder` | *Archivo CHOAM* |
| `useShipmentStore` | `src/presentation/stores/shipmentStore.ts` | CRUD de despachos | *Hangar de ornitópteros* |

### 2.5 Composables — *Weirding Way*

| Composable | Archivo | Propósito | Referencia Dune |
|---|---|---|---|
| `useQuantityValidation` | `src/presentation/composables/useQuantityValidation.ts` | Valida cantidades de despacho vs stock de entradas | *Disciplina del agua fremen* |

### 2.6 Enrutamiento — *Navegadores Guild*

- 2 rutas: `/` (Dashboard) y `/auth` (Auth)
- Guardia `beforeEach` que redirige según sesión — *Duncan Idaho en la puerta*
- Transiciones animadas con `mode="out-in"` — *Weirding Way entre vistas*

### 2.7 Componentes principales — *Arsenal del sietch*

| Componente | Archivo | Propósito | Referencia Dune |
|---|---|---|---|
| DashboardPage | `src/presentation/pages/DashboardPage.vue` | Panel con sidebar, nav, vistas dinámicas | *Sala de mando de Muad'Dib* |
| AuthPage | `src/presentation/pages/AuthPage.vue` | Login/register con tabs animados | *Puerta de Duncan Idaho* |
| ProductRegistrationForm | `src/presentation/components/products/ProductRegistrationForm.vue` | Formulario producto multi-empresa | *Cosecha de especia* |
| ProductEditModal | `src/presentation/components/products/ProductEditModal.vue` | Modal edición producto | *Refinar la cosecha* |
| ProductList | `src/presentation/components/products/ProductList.vue` | Tabla productos con búsqueda | *Inventario del sietch* |
| ConfirmDeleteModal | `src/presentation/components/products/ConfirmDeleteModal.vue` | Confirmación con psicología de inventario | *Agua derramada* |
| SupplierSelectionModal | `src/presentation/components/products/SupplierSelectionModal.vue` | Modal selección proveedor | *Elegir aliado fremen* |
| WinerySelectionModal | `src/presentation/components/products/WinerySelectionModal.vue` | Modal selección bodega | *Elegir sietch destino* |
| WineryRegistrationForm | `src/presentation/components/wineries/WineryRegistrationForm.vue` | Formulario bodega | *Fundar sietch* |
| CompanyRegistrationForm | `src/presentation/components/company/CompanyRegistrationForm.vue` | Wizard 6 pasos + 4 API paralelas | *Duke Leto funda la Casa* |
| UserProfile | `src/presentation/components/profile/UserProfile.vue` | Perfil + datos empresa | *Identidad de Usul* |
| EditProfileModal | `src/presentation/components/profile/EditProfileModal.vue` | Modal editar perfil + empresa | *Renacer en el sietch* |
| ProductEntryForm | `src/presentation/components/productEntries/ProductEntryForm.vue` | Entrada con tabla dinámica | *Dr. Kynes* |
| ProductEntryList | `src/presentation/components/productEntries/ProductEntryList.vue` | Lista de entradas | *Registro de cosechas* |
| ProviderRegistrationForm | `src/presentation/components/providers/ProviderRegistrationForm.vue` | Registro proveedor | *Tratado Landsraad* |
| OrderForm | `src/presentation/components/orders/OrderForm.vue` | Orden compra/venta | *Contrato CHOAM* |
| OrderList | `src/presentation/components/orders/OrderList.vue` | Lista órdenes + aprobación | *Archivo imperial* |
| OrderEditModal | `src/presentation/components/orders/OrderEditModal.vue` | Edición de orden | *Thufir revisa estrategia* |
| DispatchSummaryModal | `src/presentation/components/orders/DispatchSummaryModal.vue` | Resumen post-despacho | *Informe post-batalla* |
| AutomationConfirmModal | `src/presentation/components/orders/AutomationConfirmModal.vue` | Confirmación automatización | *Profecía de Muad'Dib* |
| ShipmentForm | `src/presentation/components/shipments/ShipmentForm.vue` | Despacho con validación stock | *Ornitóptero cargado* |
| ShipmentList | `src/presentation/components/shipments/ShipmentList.vue` | Lista despachos | *Registro de vuelos* |
| ShipmentEditModal | `src/presentation/components/shipments/ShipmentEditModal.vue` | Edición despacho | *Recalcular ruta* |
| ShipmentDetailModal | `src/presentation/components/shipments/ShipmentDetailModal.vue` | Detalle despacho | *Manifiesto de carga* |
| EntrySelectionModal | `src/presentation/components/shipments/EntrySelectionModal.vue` | Selección entradas origen | *Cisternas de agua* |

### 2.8 Manejo de errores — *Voz Bene Gesserit*

- `HttpError` class con status code — *Barón Harkonnen contenido*
- `authAlertMessages.ts` traduce errores crudos a alertas — *Traducción de profecías*
- `AppAlert.vue` banner reutilizable con 4 variantes — *Voz Bene Gesserit*
- Validación por campo con `fieldErrors` reactivo — *Prueba de Lady Jessica*

### 2.9 Autenticación — *Sello Atreides*

- JWT HS256, 24h expiración — *Anillo de sello Atreides*
- Token inyectado via Axios interceptor — *Gurney lleva el mensaje*
- Sesión en `localStorage` (`auth_token`, `auth_session`) — *Traje stillsuit*
- Store inicializa sesión al cargar — *Duncan recuerda al visitante*

---

## 3. Backend — Paulu (Go API) — *Sardaukar: disciplina del desierto*

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

## 5. Graphify — Análisis de grafos de código — *Mentat Thufir*

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

## 7. Convenciones del código — *Código de honor Atreides*

### 7.1 Frontend — *Lenguaje de Usul*

- **Idioma:** Español (UI, validaciones, comentarios)
- **Estilo:** Composition API con `<script setup lang="ts">`
- **Tipado:** TypeScript strict mode
- **Nomenclatura API:** snake_case (`product_code`, `company_id`)
- **Nomenclatura frontend:** camelCase (`productCode`, `companyId`)
- **Mapeo API→dominio:** `name_full` → `fullName`, `id_number` → `idNumber` (en AuthRepository)
- **Estilos:** Tailwind CSS v4 con clases utilitarias
- **Store pattern:** Pinia composition stores con arrow functions

### 7.2 Backend — *Lenguaje del Imperio*

- **Idioma:** Inglés (código), Español (mensajes de error al usuario)
- **Nomenclatura:** camelCase en Go (`ProductCode`, `MinimumStock`), snake_case en JSON (`product_code`, `minimum_stock`)
- **Handlers:** Un solo `Handle()` por recurso con `switch (r.Method)`
- **Validación:** En use case, no en handler
- **IDs:** Generados con timestamp + random, formato `"20250613120000A"`

---

## 8. Variables de entorno — *Coordenadas del Guild Navigator*

| Variable | Default | Propósito |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base de la API (frontend) |
| JWT secret (config) | `config.JWTSecret()` | Secreto para firmar tokens JWT |
| PG DSN (config) | `config.DefaultPostgresConfig()` | Conexión a PostgreSQL |

---

## 9. Comandos útiles — *Manual del ornitóptero*

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

> *"Una referencia sin contexto es como un fremen sin desierto."*

| Recurso | Ubicación |
|---|---|
| Dune Lore — Paul Atreides | `raw/dune-lore-paul-atreides.md` |
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
