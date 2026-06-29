# Guía de Implementación — Paulu Areides

> Versión 2.2 — Documentación técnica de todo lo construido: frontend Vue 3 (Paulus),
> backend Go (Paulu), sistema de IA configurable, y herramientas de análisis (graphify).
>
> Cada sección incluye su paralelo en la saga *Dune* bajo la **Casa Paulu Areides**.
> Glosario canónico: [`raw/dune-lore-paul-atreides.md`](raw/dune-lore-paul-atreides.md)

---

## 1. Resumen del proyecto — *La Casa Paulu Areides*

> *Inspirado en el viaje de Paul Atreides — de heredero de la Casa Atreides a líder de los fremen.
> Paulu Areides es la fusión del legado Atreides con la visión digital.
> Paulus (frontend) es la voz visible; Paulu (backend) es la maquinaria que sostiene el poder.*

| Componente | Nombre | Inspiración Dune | Stack | Ubicación |
|---|---|---|---|---|
| Frontend | **Paulus** | *"El Primer Miembro de Paulu Areides"* — unificando el imperio | Vue 3 + TypeScript + Pinia + Tailwind CSS 4 + vue-markdown-render | `D:\Vue\book-coffee-shop\` |
| Backend API | **Paulu** | *"La Casa"* — la infraestructura Atreides que lo sostiene todo | Go + PostgreSQL + JWT | `D:\Go\api-book-coffee-shop\` |
| IA Configurable | **Mentat** | *"El cálculo estratégico"* — wizard de modelos + chat asistente | Fetch API + localStorage + Web Audio API | `src/application/services/aiService.ts` + `src/presentation/components/ai/` |

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
| `historyService` | `src/application/services/historyService.ts` | GET `/history`, GET `/history/{type}/{id}` + POST `/history` | *Archivos de Irulan — la memoria del imperio* |
| `aiService` | `src/application/services/aiService.ts` | Verificación de API Key contra 5 proveedores + OpenAI-compatible | *Prueba Bene Gesserit — Mentat verifica su autenticidad* |

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
| `useHistoryStore` | `src/presentation/stores/historyStore.ts` | Estado del historial: entradas, carga, errores | *Memoria genética de Paul* |

### 2.5 Composables — *Weirding Way*

| Composable | Archivo | Propósito | Referencia Dune |
|---|---|---|---|
| `useQuantityValidation` | `src/presentation/composables/useQuantityValidation.ts` | Valida cantidades de despacho vs stock de entradas | *Disciplina del agua fremen* |
| `useHistoryLogger` | `src/presentation/composables/useHistoryLogger.ts` | Funciones `logCreate`, `logUpdate`, `logDelete`, `logApprove`, `logDeduct` | *La voz de Paul registra cada acción* |

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
| HistoryTimeline | `src/presentation/components/history/HistoryTimeline.vue` | Línea de tiempo visual con búsqueda y detalle expandible | *Línea de tiempo de Muad'Dib* |
| HistoryDetailModal | `src/presentation/components/history/HistoryDetailModal.vue` | Modal de historial filtrado por entidad | *Visión enfocada de Paul* |
| AIModelsPanel | `src/presentation/components/ai/AIModelsPanel.vue` | Wizard 3 pasos: proveedor, API Key, verificación | *Entrenamiento del Mentat — Paulu Areides calcula* |
| Floating AI Button | `src/App.vue` | Botón cerebral flotante + chat modal | *El ojo de Paulu Areides en cada pantalla* |

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

### 2.10 Historial de inventario — *Visión del pasado de Paul*

> *"Paul veía los recuerdos de sus ancestros como si hubiera vivido mil vidas.
> El historial de inventario es esa misma visión aplicada al negocio: cada
> evento queda grabado en los Archivos de Irulan."*

#### 2.10.1 Arquitectura — *Las cuatro capas de la visión*

El historial atraviesa las 4 capas de Clean Architecture, como la visión de
Paul atraviesa tiempo, espacio y memoria genética:

```
domain/entities/HistoryEntry.ts              → La entidad pura (visión)
application/services/historyService.ts       → El puente HTTP (el oráculo)
presentation/stores/historyStore.ts          → Estado reactivo (memoria)
presentation/composables/useHistoryLogger.ts → Registro de acciones (la voz)
presentation/components/history/             → UI visible (el rostro de la profecía)
```

#### 2.10.2 `HistoryEntry` — *La visión*

```typescript
export interface HistoryEntry {
  id: string
  entityType: string
  entityId: string
  documentName?: string
  action: HistoryAction
  changes: Record<string, HistoryChange> | null
  userId: string
  userName: string
  details: string
  timestamp: string
  result?: string
  companyId?: string
  ipAddress?: string
}
```

| Campo | Propósito | Analogía Paul |
|-------|-----------|---------------|
| `id` | Identificador único del evento | El sello temporal de la visión |
| `entityType` | Tipo de entidad afectada (product, order, shipment…) | El dominio del imperio que Paul observa |
| `documentName` | Nombre del producto extraído del JSON del evento | El nombre de la especia revelado en la agonía |
| `action` | Tipo de acción: CREATE, UPDATE, DELETE, APPROVE, DEDUCT… | El decreto que Paul emite en su profecía |
| `userId` / `userName` | Quién ejecutó la acción | El noble que actúa bajo la mirada de Muad'Dib |
| `details` | Descripción legible del evento | La narración que Irulan escribiría en sus crónicas |
| `timestamp` | Cuándo ocurrió | El momento exacto en la línea de tiempo |
| `result` | Éxito o fallo del evento | El veredicto del oráculo |

**Tipos de acción (`HistoryAction`):**

| Acción | Significado en Paulu | Momento en la saga |
|--------|---------------------|-------------------|
| `CREATE` | Se creó un recurso | Paul pisa Arrakis por primera vez |
| `UPDATE` | Se modificó un recurso | Paul aprende el camino fremen |
| `DELETE` | Se eliminó un recurso | Jamis cae ante el crysknife |
| `APPROVE` | Se aprobó una orden | Los Fedaykin confirman la misión |
| `DEDUCT` | Se dedujo inventario | La especia fluye de Arrakis al Imperio |
| `LOGIN` / `LOGOUT` | Inicio / cierre de sesión | Duncan Idaho abre y cierra la puerta |
| `REGISTER` | Nuevo usuario registrado | Un nuevo miembro se une al sietch |
| `SHIPMENT_CREATED` | Despacho registrado | El ornitóptero despega del bled |
| `ORDER_CREATED` | Orden de compra creada | Contrato CHOAM firmado |
| `ENTRY_CREATED` | Entrada de producto creada | Kynes celebra el equilibrio ecológico |
| `RELATION_CREATED` | Relación orden↔despacho | Alianza entre dos Casas del Landsraad |

#### 2.10.3 `historyService` — *El oráculo HTTP*

```typescript
export async function getHistoryEntries(params?: {
  limit?: number; offset?: number; entityType?: string; entityId?: string
}): Promise<HistoryEntry[]>

export async function getHistoryEntriesByEntity(
  entityType: string, entityId: string
): Promise<HistoryEntry[]>

export async function createHistoryEntry(
  data: CreateHistoryRequest
): Promise<HistoryEntry>
```

- `getHistoryEntries` → `GET /history` — Paul abre el Libro de los Destinos
- `getHistoryEntriesByEntity` → `GET /history/{type}/{id}` — Paul enfoca su visión en un hilo específico
- `createHistoryEntry` → `POST /history` — La voz de Paul escribe un nuevo pergamino

**Mapper `mapToHistoryEntry`:** Transforma la respuesta `snake_case` de la API
al modelo `camelCase` del frontend, como un traductor fremen interpreta las
palabras del Imperio para el sietch.

**`extractDocumentName`:** Extrae el nombre del producto desde `new_data` o
`previous_data` (JSONB), como Paul extrae verdades del agua de vida. Analiza
el JSON del evento para encontrar `name` (producto) o `details[0].product`
(órdenes/entradas/despachos).

#### 2.10.4 `historyStore` — *Memoria genética de Paul*

```typescript
const store = useHistoryStore()

// Propiedades
store.entries      // HistoryEntry[] — todos los pergaminos cargados
store.isLoading    // boolean — el oráculo está consultando
store.error        // string | null — la visión se nubló

// Métodos
await store.fetchEntries({ limit: 10 })          // Cargar últimos eventos
await store.fetchEntriesByEntity('order', 'id')  // Cargar por entidad
await store.addEntry(data)                       // Agregar un evento (prepend)
store.clearError()                               // Limpiar el error
```

Como la memoria genética que Paul hereda de sus ancestros, el store mantiene
los eventos en orden descendente y permite filtrar por entidad.

#### 2.10.5 `useHistoryLogger` — *La voz de Paul registra*

```typescript
const logger = useHistoryLogger()

await logger.logCreate({ entityType: 'product', entityId: '123', details: 'Café especial creado' })
await logger.logUpdate({ entityType: 'order', entityId: '456', details: 'Orden actualizada', changes: { status: { old: 'pending', new: 'approved' } } })
await logger.logDelete({ entityType: 'product', entityId: '789', details: 'Producto eliminado' })
await logger.logApprove({ entityType: 'order', entityId: '012', details: 'Orden aprobada' })
await logger.logDeduct({ entityType: 'shipment', entityId: '345', details: 'Inventario deducido' })
```

Cada función extrae automáticamente el usuario de `authStore` y construye el
`CreateHistoryRequest`. Es la herramienta que los componentes usan para
registrar eventos sin preocuparse por los detalles del API — como la voz de
Paul que ordena y el universo obedece.

**Componentes que registran eventos:**

| Componente | Eventos que registra |
|---|---|
| `authStore` | `LOGIN`, `REGISTER`, `LOGOUT` |
| `ProductRegistrationForm` | `CREATE` |
| `ProductList` | `DELETE` |
| `OrderForm` | `CREATE`, `DEDUCT` |
| `OrderEditModal` | `UPDATE` |
| `OrderList` | `DELETE`, `APPROVE` |
| `ShipmentForm` | `CREATE`, `DEDUCT` |

#### 2.10.6 `HistoryTimeline` — *Línea de tiempo de Muad'Dib*

Componente visual que renderiza una línea de tiempo scrollable con:

- **Búsqueda en vivo** — filtra por descripción, tipo de entidad, acción,
  usuario, ID de entidad o nombre de producto. *(Paul recorre sus visiones
  en busca de un momento específico)*
- **Círculos de color por acción** — cada tipo de evento tiene un color
  distinto (CREATE=verde, UPDATE=azul, DELETE=rojo, etc.) con glow
  animado. *(Cada camino en la visión de Paul tiene un color)*
- **Panel expandible** — al hacer clic en el botón de expandir, se revelan
  datos adicionales: nombre real del usuario (resuelto vía API), nombre
  del producto, compañía, resultado, IP, y fecha formateada. La resolución
  de nombres es lazy: solo se consulta la API cuando se expande.
  *(Paul profundiza en una visión para ver todos sus detalles)*
- **Estados vacío, carga y sin resultados** — maneja todos los estados de UI.
  *(Incluso cuando la visión está vacía, el oráculo habla)*
- **Tema oscuro** — fondo cósmico con orbes de gradiente y sombras
  brillantes. *(Como el cielo nocturno de Arrakis bajo las estrellas)*

**Uso en DashboardPage:**

```vue
<HistoryTimeline
  :entries="historyStore.entries"
  :is-loading="historyStore.isLoading"
  title="Historial de Inventario"
/>
```

El Dashboard carga los primeros 10 eventos al montar (`fetchEntries({ limit: 10 })`)
y carga 200 eventos cuando se navega a la pestaña "Transactions".

#### 2.10.7 `HistoryDetailModal` — *Visión enfocada de Paul*

Modal que muestra el historial filtrado para una entidad específica:

```vue
<HistoryDetailModal
  entity-type="order"
  entity-id="1749372100_020"
  entity-label="Orden"
  @close="showModal = false"
/>
```

Al montarse, llama a `fetchEntriesByEntity(entityType, entityId)` para cargar
solo los eventos relacionados con ese documento. Útil para ver el ciclo de vida
completo de una orden, producto o despacho. *(Paul enfoca su visión en un solo
hilo del destino para comprenderlo por completo)*

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

### 3.7 Historial de inventario (backend) — *Archivos de Irulan*

El backend expone el endpoint `/history` (solo GET) que lista todos los
eventos de inventario registrados. Los eventos se crean automáticamente desde
los casos de uso de producto, orden, entrada y despacho mediante el
`HistoryService` inyectado.

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/history` | Lista todos los eventos ordenados por fecha descendente |
| `GET` | `/history/{document_type}/{document_id}` | Filtra por tipo y ID de documento |

**Modelo de dominio (`InventoryHistory`):**

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `history_id` | `string` | ID único del evento |
| `event_date` | `timestamp` | Cuándo ocurrió |
| `user_id` | `string` | Quién ejecutó la acción |
| `event_type` | `enum` | Tipo de evento (13 valores) |
| `company_id` | `string` | Compañía asociada |
| `document_id` | `string` | ID del documento afectado |
| `document_type` | `string` | Tipo de documento |
| `previous_data` | `JSONB` | Estado anterior (nullable) |
| `new_data` | `JSONB` | Estado posterior (nullable) |
| `description` | `text` | Descripción textual del evento |
| `ip_address` | `string` | Dirección IP de origen |
| `result` | `string` | SUCCESS / FAILURE |

**Tipos de evento (`InventoryEventType`):**

```
CREATE, UPDATE, CANCEL,
ORDER_CREATED, ORDER_UPDATED, ORDER_APPROVED,
SHIPMENT_CREATED, SHIPMENT_CANCELLED,
ENTRY_CREATED, ENTRY_DELETED,
STOCK_UPDATED, INVOICE_LINKED, RELATION_CREATED
```

**Módulos que alimentan el historial:**

| Use Case | Eventos |
|----------|---------|
| `productUseCase` | CREATE, UPDATE, STOCK_UPDATED |
| `orderUseCase` | ORDER_CREATED, ORDER_UPDATED, ORDER_APPROVED |
| `productEntryUseCase` | ENTRY_CREATED, ENTRY_DELETED |
| `shipmentUseCase` | SHIPMENT_CREATED, SHIPMENT_CANCELLED, RELATION_CREATED |
| `movementUseCase` | CREATE, UPDATE, CANCEL |

### 3.8 Configuración

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
|---|---|---|---|---|---|---|
| Go API (Paulu) | 967 | 1850 | 101 | ✅ |
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

## 9. Inteligencia Artificial — *El Mentat de Paulu Areides*

> *"Paul veía futuros posibles con cada respiración de especia. El Mentat
> de Paulu Areides calcula, verifica y asiste — aunque aún no vea el futuro."*

### 9.1 Arquitectura — *El Tercer Ojo*

El sistema de IA se compone de tres grandes módulos:

```
src/
├── application/services/aiService.ts     # Verificación contra proveedores externos
├── presentation/components/ai/
│   └── AIModelsPanel.vue                 # Wizard de configuración 3 pasos
└── App.vue                               # Chat modal con asistente Paulu
```

**Dependencias de IA:**
- `vue-markdown-render` — Renderizado de Markdown en respuestas
- `@vueuse/motion` — Animaciones spring para UI
- Web Audio API — Sonido de campana (sin dependencia externa)

Además, el botón flotante y chat modal viven en `src/App.vue` fuera del
`<router-view>`, garantizando disponibilidad global.

### 9.2 Servicio de verificación — *Prueba Bene Gesserit*

`src/application/services/aiService.ts` expone:

| Función | Propósito | Paralelo Dune |
|---|---|---|
| `verifyAiModel(params)` | Envía request de prueba a cada proveedor | *La Reverenda Madre prueba a Paul —¿es quien dice ser?* |
| `verifyGemini(apiKey, modelName)` | POST a Google AI con modelo dinámico | *El Camino de Paulu Areides — único, personal* |
| `verifyOpenAiCompatible(baseUrl, apiKey, model)` | POST a cualquier API OpenAI-compatible | *Cualquier sietch puede refugiar a un fremen* |

**Proveedores soportados:**

| Proveedor | Endpoint por defecto | Modelos disponibles |
|---|---|---|
| **Gemini** | `generativelanguage.googleapis.com` | `gemini-2.0-flash`, `2.0-pro`, `1.5-pro`, `1.5-flash` |
| **Codex** | `api.openai.com` | `gpt-4o`, `4o-mini`, `4-turbo`, `3.5-turbo` |
| **OpenCloud** | `openrouter.ai` | `openai/gpt-4o`, `anthropic/claude-3.5-sonnet`, `google/gemini-2.0-flash`, `meta-llama/llama-3-70b` |
| **Kimi** | `api.moonshot.cn` | `moonshot-v1-8k`, `v1-32k`, `v1-128k` |
| **Custom** | Usuario define URL | Usuario define nombre |

### 9.3 Wizard AIModelsPanel — *Formación del Mentat en 3 pasos*

`src/presentation/components/ai/AIModelsPanel.vue`

Carga cognitiva reducida — Paulu Areides enseñó a los fremen a tomar el desierto
**un paso a la vez**:

| Paso | Propósito | Validación | Paralelo Dune |
|---|---|---|---|
| **1. Proveedor** | Tarjeta recomendada (Gemini) + acordeón de alternativas | Selección requerida | *El Lisan al-Gaib elige su camino* |
| **2. API Key** | Modelo específico + API Key + ayuda contextual expandible | Key válida (formato según proveedor) | *La prueba de la caja de dolor* |
| **3. Revisar** | Resumen + términos + guardado | Checkbox aceptado | *El juramento fremen antes de la batalla* |

**Flujo de guardado:**

1. Usuario completa wizard y presiona "Guardar modelo"
2. Modal de verificación aparece con spinner animado — *La Reverenda Madre evalúa*
3. **Éxito** ✅ → modelo persistido en `localStorage(ai-models)`, wizard se resetea, modal se cierra
4. **Error** ❌ → se muestra mensaje de error, botones "Reintentar" y "Cancelar"
   - Cancelar = rollback completo (nada se guarda)
   - Reintentar = nuevo intento de verificación

### 9.4 Botón flotante y chat — *El Ojo de Paulu Areides*

`src/App.vue` contiene:

- **Botón cerebral** fijo (abajo-derecha, `z-50`) con gradiente violeta y sombra
- **Modal chat** teleportado al `<body>` con animación `Transition`
- **Animaciones spring** con `@vueuse/motion` (entrada, hover, tap)
- **Botón expandir/contraer** para pantalla completa
- **Mensaje de bienvenida** con opciones de navegación
- **Renderizado Markdown** en respuestas del asistente
- **Sonido de campana** de máquina de escribir al recibir respuesta

### 9.5 Asistente Paulu — *La Voz de Paulu Areides*

#### 9.5.1 System Prompt

El asistente opera bajo un system prompt estructurado:

```
# SYSTEM PROMPT — Asistente Paulu
## Identidad
Eres **Paulu**, un asistente financiero y de inventario especializado...

## Dominio permitido
- Gestión y control de inventario
- Costos, precios y márgenes de productos
- Entradas y salidas de stock
- Rotación de inventario y métricas asociadas
- Pérdidas, mermas y ajustes de inventario
- Indicadores financieros vinculados al inventario
- Rentabilidad y análisis económico del negocio
- Reportes y toma de decisiones financieras

## Formato de respuesta en chat
- Prosa directa para datos simples; tabla solo para 4+ registros
- Párrafos de máximo 3 líneas; una idea por párrafo
- Negritas solo para el dato principal; máximo 2 por mensaje
- Emojis como marcadores de sección, no como decoración
- Nunca más de 15 líneas seguidas sin pausar con una pregunta
- Cierra siempre con una pregunta corta o invitación a profundizar
- Sin saludos largos, sin frases de cierre formales

## Restricciones absolutas
R1 — Sin código de programación.
R2 — Sin temas de salud humana.
R3 — Sin literatura ni filosofía.
R4 — Sin temas fuera del dominio financiero/inventario.
R5 — Nunca menciones "API", "REST", "endpoint" ni cómo obtienes los datos.
R6 — Nunca muestres IDs internos del sistema. Usa numeración secuencial.
```

#### 9.5.2 Conexión con API real

El asistente consulta datos reales del sistema antes de responder:

```typescript
// Detección de intención
async function detectIntentAndFetch(query: string): Promise<string> {
  const q = query.toLowerCase()

  // Productos
  if (q.includes('producto') || q.includes('productos') || q.includes('stock')) {
    return await fetchProducts()
  }

  // Órdenes
  if (q.includes('orden') || q.includes('órdenes') || q.includes('pedido')) {
    return await fetchOrders()
  }

  // Entradas
  if (q.includes('entrada') || q.includes('entradas') || q.includes('compra')) {
    return await fetchEntries()
  }

  // Salidas
  if (q.includes('salida') || q.includes('salidas') || q.includes('envío')) {
    return await fetchShipments()
  }

  return ''
}
```

**Flujo de datos:**

```
Usuario escribe pregunta
  → detectIntentAndFetch(query)
  → axiosInstance.get('/products') | '/orders' | '/product-entries' | '/shipments'
  → Datos formateados como contexto
  → Se envía a LLM con system prompt + datos + historial
  → Respuesta renderizada en Markdown
  → Sonido de campana 🔔
```

#### 9.5.3 Formato de datos de la API

Los datos se presentan sin IDs internos, usando numeración secuencial:

```markdown
Productos encontrados (3):

| # | Nombre | Precio | Stock | Margen |
|---|--------|--------|-------|--------|
| 1 | Café especial | $12.000 | 45 | 35% |
| 2 | Té verde | $8.500 | 30 | 28% |
| 3 | Chocolate artesanal | $15.000 | 20 | 42% |

¿Quieres ver el detalle de alguno?
```

#### 9.5.4 Renderizado Markdown

El componente `VueMarkdown` renderiza:
- **Tablas** con estilos para tema oscuro
- **Listas** ordenadas y desordenadas
- **Encabezados** (h1-h4) con jerarquía visual
- **Negritas** y cursivas
- **Código** inline y bloques de código
- **Blockquotes** con borde violeta
- **Enlaces** con color violeta

#### 9.5.5 Sonido de campana

Generado con Web Audio API sin archivos externos:

```typescript
function playBellSound() {
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(2200, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.05)

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.15)
}
```

#### 9.5.6 Mensaje de bienvenida

Al abrir el chat, se muestra automáticamente:

```
Bienvenido. Soy Paulu, y estoy aquí para ayudarte a mantener el orden
en lo que más importa: el flujo de tu negocio.

En mi casa aprendemos que el control de los recursos no es solo una tarea —
es la base sobre la que se sostiene cualquier operación. Un inventario sin
visibilidad es como navegar sin mapa: se avanza, pero sin rumbo.

Aquí tendrás claridad. Cada producto, cada orden, cada entrada y salida
tiene su lugar, y juntos nos aseguraremos de que nada quede en la oscuridad.

¿Por dónde quieres empezar?
• Inventario — Stock, Entradas y Salidas
• Órdenes — Estado y seguimiento
• Finanzas — Márgenes y rentabilidad
• Productos — Más vendidos y rotación
```

### 9.6 Modelo Local — *El Mentat del Sietch*

Conexión directa a modelos locales sin dependencia de servicios externos:

| Campo | Tipo | Descripción |
|---|---|---|
| `baseUrl` | `string` | URL del servidor (ej: `http://localhost:11434`) |
| `modelName` | `string` | Nombre del modelo (ej: `llama3`) |
| `contextWindow` | `number` | Tamaño máximo de contexto en tokens |
| `maxTokens` | `number` | Límite máximo de tokens en respuesta |
| `apiKey` | `string` | API Key opcional para autenticación |

**Proveedores compatibles:**
- Ollama (`http://localhost:11434`)
- LM Studio (`http://localhost:1234`)
- vLLM (`http://localhost:8000`)
- Cualquier servidor compatible con OpenAI API

### 9.7 Persistencia — *Memoria genética en localStorage*

Los modelos se almacenan en `localStorage('ai-models')` como array JSON:

```json
[{
  "id": "uuid",
  "provider": "gemini",
  "label": "Gemini",
  "modelName": "gemini-2.0-flash",
  "apiKey": "AIza...",
  "verifiedAt": "2026-06-20T...",
  "baseUrl": null,
  "contextWindow": null,
  "maxTokens": null
}]
```

- La API Key se almacena en texto plano — *confianza de Paulu Areides en su Casa*
- `maskKey()` la enmascara en UI (`sk-ab...wxyz`)
- Sin expiración — el Mentat recuerda siempre
- Para modelos locales: `baseUrl`, `contextWindow`, `maxTokens` se persisten

### 9.8 Consideraciones de seguridad — *El Escudo Atreides*

| Riesgo | Mitigación | Paralelo Dune |
|---|---|---|
| API Key en localStorage | Solo accesible desde el mismo origen | *El escudo personal de Paul — solo él lo activa* |
| Verificación por fetch | Sin proxy; el cliente llama directo al proveedor | *El fremen negocia cara a cara, sin intermediarios* |
| Key expuesta en UI | `type="password"` + `maskKey()` en listados | *Traje stillsuit — oculta lo esencial* |
| Rollback en fallo | El modelo solo persiste si `verifiedAt` tiene fecha | *Si la especia es veneno, no se cosecha* |

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
