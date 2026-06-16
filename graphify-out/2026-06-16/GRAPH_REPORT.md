# Graph Report - book-coffee-shop  (2026-06-16)

## Corpus Check
- 104 files · ~60,927 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 493 nodes · 442 edges · 88 communities (63 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e385a021`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Module tsconfig.app.json|Module: tsconfig.app.json]]
- [[_COMMUNITY_Module package.json|Module: package.json]]
- [[_COMMUNITY_Module container.ts|Module: container.ts]]
- [[_COMMUNITY_Module|Module: []]]
- [[_COMMUNITY_Module tsconfig.node.json|Module: tsconfig.node.json]]
- [[_COMMUNITY_Module shipmentService.ts|Module: shipmentService.ts]]
- [[_COMMUNITY_Group orderService.ts|Group: orderService.ts]]
- [[_COMMUNITY_Group AuthSession.ts|Group: AuthSession.ts]]
- [[_COMMUNITY_Group productEntryService.ts|Group: productEntryService.ts]]
- [[_COMMUNITY_Group productService.ts|Group: productService.ts]]
- [[_COMMUNITY_Group wineryService.ts|Group: wineryService.ts]]
- [[_COMMUNITY_Group ProductSelectionModal.vue|Group: ProductSelectionModal.vue]]
- [[_COMMUNITY_Group providerService.ts|Group: providerService.ts]]
- [[_COMMUNITY_Group ILoginValidator.ts|Group: ILoginValidator.ts]]
- [[_COMMUNITY_Group IRegisterValidator.ts|Group: IRegisterValidator.ts]]
- [[_COMMUNITY_Group RegisterDto.ts|Group: RegisterDto.ts]]
- [[_COMMUNITY_Group companyService.ts|Group: companyService.ts]]
- [[_COMMUNITY_Group LoginDto.ts|Group: LoginDto.ts]]
- [[_COMMUNITY_Group authAlertMessages.ts|Group: authAlertMessages.ts]]
- [[_COMMUNITY_Group economicActivityService.ts|Group: economicActivityService.ts]]
- [[_COMMUNITY_Group mainAddressService.ts|Group: mainAddressService.ts]]
- [[_COMMUNITY_Group taxInformationService.ts|Group: taxInformationService.ts]]
- [[_COMMUNITY_Group userService.ts|Group: userService.ts]]
- [[_COMMUNITY_Group index.ts|Group: index.ts]]
- [[_COMMUNITY_Group App.vue|Group: App.vue]]
- [[_COMMUNITY_Group tsconfig.json|Group: tsconfig.json]]
- [[_COMMUNITY_Leaf OrdersPage.vue|Leaf: OrdersPage.vue]]
- [[_COMMUNITY_Leaf authStore.ts|Leaf: authStore.ts]]
- [[_COMMUNITY_Leaf companyStore.ts|Leaf: companyStore.ts]]
- [[_COMMUNITY_Leaf orderStore.ts|Leaf: orderStore.ts]]
- [[_COMMUNITY_Leaf productEntryStore.ts|Leaf: productEntryStore.ts]]
- [[_COMMUNITY_Leaf productStore.ts|Leaf: productStore.ts]]
- [[_COMMUNITY_Leaf providerStore.ts|Leaf: providerStore.ts]]
- [[_COMMUNITY_Leaf shipmentStore.ts|Leaf: shipmentStore.ts]]
- [[_COMMUNITY_Leaf wineryStore.ts|Leaf: wineryStore.ts]]
- [[_COMMUNITY_Leaf appAlert.types.ts|Leaf: appAlert.types.ts]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 87|Community 87]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 25 edges
2. `[]` - 24 edges
3. `Componentes globales` - 22 edges
4. `compilerOptions` - 16 edges
5. `/graphify` - 11 edges
6. `What You Must Do When Invoked` - 11 edges
7. `Guía de Implementación — Paulus + Paulu` - 11 edges
8. `2. Frontend — Paulus (Vue 3)` - 9 edges
9. `graphify reference: extra exports and benchmark` - 8 edges
10. `3. Backend — Paulu (Go API)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `formatDate()` --calls--> `formatCOP()`  [INFERRED]
  src/presentation/pages/OrdersPage.vue → src/presentation/components/orders/DispatchSummaryModal.vue
- `AuthSession` --references--> `User`  [EXTRACTED]
  src/domain/entities/AuthSession.ts → src/domain/entities/User.ts
- `AxiosHttpClient` --implements--> `IHttpClient`  [EXTRACTED]
  src/infrastructure/http/AxiosHttpClient.ts → src/infrastructure/http/IHttpClient.ts
- `AuthRepository` --references--> `IHttpClient`  [EXTRACTED]
  src/infrastructure/repositories/AuthRepository.ts → src/infrastructure/http/IHttpClient.ts
- `LoginValidator` --implements--> `ILoginValidator`  [EXTRACTED]
  src/presentation/validators/LoginValidator.ts → src/presentation/validators/ILoginValidator.ts

## Import Cycles
- None detected.

## Communities (88 total, 25 thin omitted)

### Community 0 - "Module: tsconfig.app.json"
Cohesion: 0.07
Nodes (28): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, erasableSyntaxOnly, esModuleInterop, ignoreDeprecations (+20 more)

### Community 1 - "Module: package.json"
Cohesion: 0.08
Nodes (24): dependencies, axios, pinia, vue, vue-router, @vueuse/motion, devDependencies, tailwindcss (+16 more)

### Community 2 - "Module: container.ts"
Cohesion: 0.13
Nodes (11): authRepository, container, httpClient, AxiosHttpClient, axiosInstance, HttpError, HttpRequestOptions, IHttpClient (+3 more)

### Community 3 - "Module: []"
Cohesion: 0.09
Nodes (18): [], activities, authStore, companyStore, currentPage, loadingCompany, navItems, notifications (+10 more)

### Community 4 - "Module: tsconfig.node.json"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 5 - "Module: shipmentService.ts"
Cohesion: 0.17
Nodes (6): CreateShipmentRequest, Recipient, ShipmentDetail, ShipmentFinancialSummary, ShipmentResponse, SourceDocument

### Community 6 - "Group: orderService.ts"
Cohesion: 0.18
Nodes (4): CreateOrderRequest, FinancialSummary, OrderDetail, OrderResponse

### Community 7 - "Group: AuthSession.ts"
Cohesion: 0.31
Nodes (5): AuthSession, User, IAuthRepository, LoginCredentials, RegisterData

### Community 8 - "Group: productEntryService.ts"
Cohesion: 0.18
Nodes (4): CreateProductEntryRequest, FinancialSummary, ProductEntryDetail, ProductEntryResponse

### Community 9 - "Group: productService.ts"
Cohesion: 0.20
Nodes (3): CreateProductRequest, ProductResponse, UpdateProductRequest

### Community 10 - "Group: wineryService.ts"
Cohesion: 0.20
Nodes (3): CreateWineryRequest, UpdateWineryRequest, WineryResponse

### Community 11 - "Group: ProductSelectionModal.vue"
Cohesion: 0.22
Nodes (5): allSelected, error, filteredProducts, loading, search

### Community 12 - "Group: providerService.ts"
Cohesion: 0.22
Nodes (3): CreateProviderRequest, ProviderResponse, UpdateProviderRequest

### Community 13 - "Group: ILoginValidator.ts"
Cohesion: 0.39
Nodes (4): ILoginValidator, LoginFieldErrors, LoginValidationResult, LoginValidator

### Community 14 - "Group: IRegisterValidator.ts"
Cohesion: 0.43
Nodes (4): IRegisterValidator, RegisterValidationResult, RegisterValidator, REQUIRED_FIELDS

### Community 19 - "Group: authAlertMessages.ts"
Cohesion: 0.60
Nodes (4): AuthAlertMessage, matches(), resolveLoginAlertMessage(), resolveRegisterAlertMessage()

### Community 66 - "Community 66"
Cohesion: 0.07
Nodes (27): 10. Referencias, 1. Resumen del proyecto, 3.1 Arquitectura, 3.2 Productos — Modelo de dominio, 3.3 Productos — Use case, 3.4 Productos — Handler HTTP, 3.5 Productos — Base de datos, 3.6 Helpers compartidos (+19 more)

### Community 67 - "Community 67"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+17 more)

### Community 68 - "Community 68"
Cohesion: 0.06
Nodes (34): 1. Clonar y acceder al proyecto, 2. Instalar dependencias, 3. Configurar variables de entorno, 4. Iniciar servidor de desarrollo, 5. Compilar para producción, `AppAlert.vue` — Alerta contextual reutilizable, `AppAlert.vue` — Alerta contextual reutilizable, `AuthButton.vue` — Botón con loading y variantes (+26 more)

### Community 69 - "Community 69"
Cohesion: 0.22
Nodes (9): 2.1 Arquitectura, 2.2 Patrón de inyección de dependencias, 2.3 Servicios HTTP (capa application), 2.4 Stores (Pinia), 2.5 Enrutamiento, 2.6 Componentes principales, 2.7 Manejo de errores, 2.8 Autenticación (+1 more)

### Community 70 - "Community 70"
Cohesion: 0.22
Nodes (8): Build, Conexión con el backend, Inicio rápido, Paulus, ¿Qué puedes hacer en Paulus?, Requisitos, Stack, Variables de entorno

### Community 71 - "Community 71"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (4): error, filteredEntries, loading, search

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 76 - "Community 76"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 87 - "Community 87"
Cohesion: 0.25
Nodes (7): Dune Lore — Paul Atreides y el Proyecto Paulus, El Juramento Paulu, La Casa Paulu, La especia debe fluir — El inventario debe controlarse, Paralelismos con Paulus (Vue), Paul Atreides — El Fundador, Paulus — El Primer Miembro

## Knowledge Gaps
- **257 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+252 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Guía de Implementación — Paulus + Paulu` connect `Community 66` to `Community 69`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _257 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Module: tsconfig.app.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Module: package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Module: container.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Should `Module: []` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Module: tsconfig.node.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._