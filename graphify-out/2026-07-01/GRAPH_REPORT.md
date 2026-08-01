# Graph Report - .  (2026-06-30)

## Corpus Check
- 168 files · ~117,863 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 677 nodes · 639 edges · 139 communities (99 shown, 40 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Vue Reactivity & Composables|Vue Reactivity & Composables]]
- [[_COMMUNITY_HTTP Client & Auth Repository|HTTP Client & Auth Repository]]
- [[_COMMUNITY_TypeScript Config (App)|TypeScript Config (App)]]
- [[_COMMUNITY_Clean Architecture Layers|Clean Architecture Layers]]
- [[_COMMUNITY_TypeScript Config (Node)|TypeScript Config (Node)]]
- [[_COMMUNITY_Vue Best Practices|Vue Best Practices]]
- [[_COMMUNITY_Vue Keep-Alive & Transitions|Vue Keep-Alive & Transitions]]
- [[_COMMUNITY_Product Entry Service|Product Entry Service]]
- [[_COMMUNITY_Vite & Dev Dependencies|Vite & Dev Dependencies]]
- [[_COMMUNITY_Order Service|Order Service]]
- [[_COMMUNITY_Sale Service|Sale Service]]
- [[_COMMUNITY_Shipment Service|Shipment Service]]
- [[_COMMUNITY_Vue SFC & Directives|Vue SFC & Directives]]
- [[_COMMUNITY_Vue Component Data Flow|Vue Component Data Flow]]
- [[_COMMUNITY_Auth Domain Entities|Auth Domain Entities]]
- [[_COMMUNITY_Product Service|Product Service]]
- [[_COMMUNITY_Winery Service|Winery Service]]
- [[_COMMUNITY_Vue Async Components|Vue Async Components]]
- [[_COMMUNITY_Package Config|Package Config]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Product Selection Modal|Product Selection Modal]]
- [[_COMMUNITY_Provider Service|Provider Service]]
- [[_COMMUNITY_Login Validator|Login Validator]]
- [[_COMMUNITY_State Management Setup|State Management Setup]]
- [[_COMMUNITY_AI Service|AI Service]]
- [[_COMMUNITY_History Service|History Service]]
- [[_COMMUNITY_Register Validator|Register Validator]]
- [[_COMMUNITY_Vue Animations|Vue Animations]]
- [[_COMMUNITY_Vue Data Flow Patterns|Vue Data Flow Patterns]]
- [[_COMMUNITY_Register Use Case|Register Use Case]]
- [[_COMMUNITY_Frontend Tech Stack|Frontend Tech Stack]]
- [[_COMMUNITY_Orders Page|Orders Page]]
- [[_COMMUNITY_Vue Pinia State|Vue Pinia State]]
- [[_COMMUNITY_Vue Custom Directives|Vue Custom Directives]]
- [[_COMMUNITY_Auth & History Stores|Auth & History Stores]]
- [[_COMMUNITY_Theme Composable|Theme Composable]]
- [[_COMMUNITY_Login Use Case|Login Use Case]]
- [[_COMMUNITY_Backend Infrastructure|Backend Infrastructure]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_Vue Debounce & Updates|Vue Debounce & Updates]]
- [[_COMMUNITY_Virtual Scrolling|Virtual Scrolling]]
- [[_COMMUNITY_Auth Alert Messages|Auth Alert Messages]]
- [[_COMMUNITY_Render Functions|Render Functions]]
- [[_COMMUNITY_Fallthrough Attributes|Fallthrough Attributes]]
- [[_COMMUNITY_Vue Router|Vue Router]]
- [[_COMMUNITY_User Profile|User Profile]]
- [[_COMMUNITY_User Service|User Service]]
- [[_COMMUNITY_Vue Suspense|Vue Suspense]]
- [[_COMMUNITY_History Entry Entity|History Entry Entity]]
- [[_COMMUNITY_Suspense Nesting|Suspense Nesting]]
- [[_COMMUNITY_Sale Detail Modal|Sale Detail Modal]]
- [[_COMMUNITY_Economic Activity Service|Economic Activity Service]]
- [[_COMMUNITY_Invoice Service|Invoice Service]]
- [[_COMMUNITY_Main Address Service|Main Address Service]]
- [[_COMMUNITY_Tax Information Service|Tax Information Service]]
- [[_COMMUNITY_Transition Group|Transition Group]]
- [[_COMMUNITY_Performance Abstraction|Performance Abstraction]]
- [[_COMMUNITY_Vue v-memo & v-once|Vue v-memo & v-once]]
- [[_COMMUNITY_Conditional Slots|Conditional Slots]]
- [[_COMMUNITY_TSConfig Base|TSConfig Base]]
- [[_COMMUNITY_Readonly Bindings|Readonly Bindings]]
- [[_COMMUNITY_Composables Patterns|Composables Patterns]]
- [[_COMMUNITY_Shallow Reactivity|Shallow Reactivity]]
- [[_COMMUNITY_Teleport Component|Teleport Component]]
- [[_COMMUNITY_Fallthrough Attributes (Alt)|Fallthrough Attributes (Alt)]]
- [[_COMMUNITY_Vue Plugins|Vue Plugins]]
- [[_COMMUNITY_Teleport & Media Query|Teleport & Media Query]]
- [[_COMMUNITY_Scoped CSS|Scoped CSS]]
- [[_COMMUNITY_Company Store|Company Store]]
- [[_COMMUNITY_Order Store|Order Store]]
- [[_COMMUNITY_Product Entry Store|Product Entry Store]]
- [[_COMMUNITY_Product Store|Product Store]]
- [[_COMMUNITY_Provider Store|Provider Store]]
- [[_COMMUNITY_Sale Store|Sale Store]]
- [[_COMMUNITY_Shipment Store|Shipment Store]]
- [[_COMMUNITY_Winery Store|Winery Store]]
- [[_COMMUNITY_Injection Keys|Injection Keys]]
- [[_COMMUNITY_App Alert Types|App Alert Types]]
- [[_COMMUNITY_Vue Transition|Vue Transition]]
- [[_COMMUNITY_Vue SFC Scoped Styles|Vue SFC Scoped Styles]]
- [[_COMMUNITY_Vue SFC Build|Vue SFC Build]]
- [[_COMMUNITY_Vue SFC Dev Server|Vue SFC Dev Server]]
- [[_COMMUNITY_Vue SFC Production|Vue SFC Production]]
- [[_COMMUNITY_Vue SFC Test|Vue SFC Test]]
- [[_COMMUNITY_Vue SFC Lint|Vue SFC Lint]]
- [[_COMMUNITY_Vue SFC Format|Vue SFC Format]]
- [[_COMMUNITY_Vue SFC Preview|Vue SFC Preview]]
- [[_COMMUNITY_Vue SFC Deploy|Vue SFC Deploy]]
- [[_COMMUNITY_Vue SFC CICD|Vue SFC CI/CD]]
- [[_COMMUNITY_Vue SFC Docker|Vue SFC Docker]]
- [[_COMMUNITY_Vue SFC Kubernetes|Vue SFC Kubernetes]]
- [[_COMMUNITY_Vue SFC AWS|Vue SFC AWS]]
- [[_COMMUNITY_Vue SFC GCP|Vue SFC GCP]]
- [[_COMMUNITY_Vue SFC Azure|Vue SFC Azure]]
- [[_COMMUNITY_Vue SFC Vercel|Vue SFC Vercel]]
- [[_COMMUNITY_Vue SFC Netlify|Vue SFC Netlify]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 25 edges
2. `compilerOptions` - 16 edges
3. `AuthRepository` - 7 edges
4. `IHttpClient` - 6 edges
5. `AxiosHttpClient` - 5 edges
6. `LoginValidator` - 5 edges
7. `scripts` - 4 edges
8. `RegisterUseCase` - 4 edges
9. `RegisterValidator` - 4 edges
10. `LoginDto` - 3 edges

## Surprising Connections (you probably didn't know these)
- `formatDate()` --calls--> `formatCOP()`  [INFERRED]
  src/presentation/components/orders/OrderList.vue → src/presentation/components/orders/DispatchSummaryModal.vue
- `formatDate()` --calls--> `formatCOP()`  [INFERRED]
  src/presentation/pages/OrdersPage.vue → src/presentation/components/orders/DispatchSummaryModal.vue
- `useHistoryLogger()` --calls--> `useAuthStore`  [INFERRED]
  src/presentation/composables/useHistoryLogger.ts → src/presentation/stores/authStore.ts
- `useHistoryLogger()` --calls--> `useHistoryStore`  [INFERRED]
  src/presentation/composables/useHistoryLogger.ts → src/presentation/stores/historyStore.ts
- `AuthSession` --references--> `User`  [EXTRACTED]
  src/domain/entities/AuthSession.ts → src/domain/entities/User.ts

## Import Cycles
- None detected.

## Communities (139 total, 40 thin omitted)

### Community 0 - "Vue Reactivity & Composables"
Cohesion: 0.05
Nodes (37): component split triggers, composable organization, composables concept, computed, defineSlots, feature folder layout, onMounted, onUnmounted (+29 more)

### Community 1 - "HTTP Client & Auth Repository"
Cohesion: 0.08
Nodes (15): Axios 1.17, authRepository, container, httpClient, AxiosHttpClient, axiosInstance, HttpError, HttpRequestOptions (+7 more)

### Community 2 - "TypeScript Config (App)"
Cohesion: 0.07
Nodes (28): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, erasableSyntaxOnly, esModuleInterop, ignoreDeprecations (+20 more)

### Community 3 - "Clean Architecture Layers"
Cohesion: 0.10
Nodes (28): AI Service (Verification), Application Layer (Services, Use Cases), useAuthStore (Pinia), Axios HTTP Instance, Clean Architecture (4 Layers), Company Service, useCompanyStore (Pinia), Domain Layer (Entities, Value Objects) (+20 more)

### Community 4 - "TypeScript Config (Node)"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 5 - "Vue Best Practices"
Cohesion: 0.12
Nodes (17): Vue 3, apply essential Vue foundations, vue-best-practices, class-based animation, confirm architecture before coding, consider optional features, core principles, Options API (+9 more)

### Community 6 - "Vue Keep-Alive & Transitions"
Cohesion: 0.17
Nodes (13): defineOptions, onActivated, onDeactivated, GPU-Friendly Transform/Opacity Animations, defineOptions, KeepAlive, keepalive cache invalidation, onActivated (+5 more)

### Community 7 - "Product Entry Service"
Cohesion: 0.15
Nodes (5): CreateProductEntryRequest, Deduction, FinancialSummary, ProductEntryDetail, ProductEntryResponse

### Community 8 - "Vite & Dev Dependencies"
Cohesion: 0.17
Nodes (11): devDependencies, @tailwindcss/vite, @types/node, @types/pdfmake, vite, vite-tsconfig-paths, @vitejs/plugin-vue, vue-tsc (+3 more)

### Community 9 - "Order Service"
Cohesion: 0.17
Nodes (5): CreateOrderRequest, FinancialSummary, OrderCreateResponse, OrderDetail, OrderResponse

### Community 10 - "Sale Service"
Cohesion: 0.17
Nodes (4): CreateSaleRequest, SaleListResponse, SaleProduct, SaleResponse

### Community 11 - "Shipment Service"
Cohesion: 0.17
Nodes (6): CreateShipmentRequest, Recipient, ShipmentDetail, ShipmentFinancialSummary, ShipmentResponse, SourceDocument

### Community 12 - "Vue SFC & Directives"
Cohesion: 0.17
Nodes (11): Composition API, DOMPurify, sfc, scoped CSS, <script setup>, single-file component, useTemplateRef, v-for (+3 more)

### Community 13 - "Vue Component Data Flow"
Cohesion: 0.20
Nodes (10): defineEmits, defineModel, defineProps, InjectionKey, Props Down / Events Up Pattern, Provide/Inject Pattern, Template Ref Pattern, useTemplateRef (+2 more)

### Community 14 - "Auth Domain Entities"
Cohesion: 0.31
Nodes (5): AuthSession, User, IAuthRepository, LoginCredentials, RegisterData

### Community 15 - "Product Service"
Cohesion: 0.20
Nodes (3): CreateProductRequest, ProductResponse, UpdateProductRequest

### Community 16 - "Winery Service"
Cohesion: 0.20
Nodes (3): CreateWineryRequest, UpdateWineryRequest, WineryResponse

### Community 17 - "Vue Async Components"
Cohesion: 0.22
Nodes (9): defineAsyncComponent, hydrateOnIdle, hydrateOnVisible, Lazy Hydration Strategies, async components, defineAsyncComponent, lazy hydration, loading flicker prevention (+1 more)

### Community 18 - "Package Config"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 19 - "Package Dependencies"
Cohesion: 0.22
Nodes (8): dependencies, pdfmake, pinia, @tailwindcss/typography, vue, vue-markdown-render, pdfmake, vue-markdown-render

### Community 21 - "Product Selection Modal"
Cohesion: 0.22
Nodes (5): allSelected, error, filteredProducts, loading, search

### Community 22 - "Provider Service"
Cohesion: 0.22
Nodes (3): CreateProviderRequest, ProviderResponse, UpdateProviderRequest

### Community 23 - "Login Validator"
Cohesion: 0.39
Nodes (4): ILoginValidator, LoginFieldErrors, LoginValidationResult, LoginValidator

### Community 24 - "State Management Setup"
Cohesion: 0.25
Nodes (8): App.vue (Root Component), createGlobalState (VueUse), localStorage (Browser), main.ts (Entry Point), @vueuse/motion, Pinia State Management, State Management Strategy, @vueuse/motion 3

### Community 25 - "AI Service"
Cohesion: 0.32
Nodes (7): AiProvider, PROVIDER_ENDPOINTS, verifyAiModel(), verifyGemini(), verifyOpenAiCompatible(), VerifyParams, VerifyResult

### Community 26 - "History Service"
Cohesion: 0.32
Nodes (5): createHistoryEntry(), CreateHistoryRequest, extractDocumentName(), HistoryApiResponse, mapToHistoryEntry()

### Community 27 - "Register Validator"
Cohesion: 0.43
Nodes (4): IRegisterValidator, RegisterValidationResult, RegisterValidator, REQUIRED_FIELDS

### Community 28 - "Vue Animations"
Cohesion: 0.25
Nodes (8): bounce animation, Animation Class-Based Technique, highlight animation, pulse animation, shake animation, GSAP, state-driven animation, useAnimation composable

### Community 29 - "Vue Data Flow Patterns"
Cohesion: 0.25
Nodes (8): component data flow, defineEmits, defineModel, defineProps, InjectionKey, props down events up, provide/inject, component-data-flow

### Community 32 - "Frontend Tech Stack"
Cohesion: 0.29
Nodes (7): JWT Authentication (HS256), tailwindcss, typescript, Paulus (Vue 3 Frontend), TailwindCSS 4.1, TypeScript 6.0, Vue 3 Composition API

### Community 33 - "Orders Page"
Cohesion: 0.29
Nodes (3): formatCOP(), formatDate(), formatDate()

### Community 34 - "Vue Pinia State"
Cohesion: 0.29
Nodes (7): auth state, cart store, createGlobalState, defineStore, Pinia, state-management, state management

### Community 35 - "Vue Custom Directives"
Cohesion: 0.29
Nodes (7): directives concept, getSSRProps, directives, v-focus directive, v-highlight directive, v-resize directive, v-tooltip directive

### Community 36 - "Auth & History Stores"
Cohesion: 0.33
Nodes (3): useHistoryLogger(), useAuthStore, useHistoryStore

### Community 39 - "Backend Infrastructure"
Cohesion: 0.33
Nodes (6): Go Language Backend, Graphify Code Analysis Tool, Mentat AI System, Paulu (Go API Backend), Paulu Areides Project, PostgreSQL Database

### Community 41 - "Vue Debounce & Updates"
Cohesion: 0.33
Nodes (6): lodash debounce, $nextTick, onUpdated, updated-hook-performance, updated hook performance, useDebounceFn

### Community 42 - "Virtual Scrolling"
Cohesion: 0.47
Nodes (6): DynamicScroller, RecycleScroller, perf-virtualize-large-lists, @tanstack/vue-virtual, virtual list, vue-virtual-scroller

### Community 43 - "Auth Alert Messages"
Cohesion: 0.60
Nodes (4): AuthAlertMessage, matches(), resolveLoginAlertMessage(), resolveRegisterAlertMessage()

### Community 44 - "Render Functions"
Cohesion: 0.40
Nodes (5): Functional Component, Render Function Patterns and Performance, withDirectives, withKeys, withModifiers

### Community 45 - "Fallthrough Attributes"
Cohesion: 0.40
Nodes (5): onUpdated, useAttrs, useDebounceFn (VueUse), Component Fallthrough Attributes Best Practices, Avoid Expensive Operations in Updated Hook

### Community 46 - "Vue Router"
Cohesion: 0.40
Nodes (4): vue-router, router, routes, Vue Router

### Community 49 - "Vue Suspense"
Cohesion: 0.40
Nodes (5): component-suspense, Suspense, @fallback event, @pending event, @resolve event

### Community 50 - "History Entry Entity"
Cohesion: 0.50
Nodes (3): HistoryAction, HistoryChange, HistoryEntry

### Community 51 - "Suspense Nesting"
Cohesion: 0.50
Nodes (4): RouterView → Transition → KeepAlive → Suspense Nesting Order, Suspense Timeout for Fallback Timing, suspensible Prop for Nested Suspense, Suspense Component Best Practices

### Community 55 - "Invoice Service"
Cohesion: 0.67
Nodes (3): generateInvoicePDF(), get(), paymentMethodLabels

### Community 58 - "Transition Group"
Cohesion: 0.50
Nodes (4): Stagger List Animation Pattern, component-transition-group, stagger list animation, TransitionGroup

### Community 59 - "Performance Abstraction"
Cohesion: 0.50
Nodes (4): performance list abstraction, perf-avoid-component-abstraction-in-lists, UserCard, UserStatusIndicator

### Community 60 - "Vue v-memo & v-once"
Cohesion: 0.50
Nodes (4): perf-v-once-v-memo-directives, v-memo, v-once, v-once/v-memo

### Community 61 - "Conditional Slots"
Cohesion: 0.67
Nodes (3): Conditional Slot Rendering with $slots, defineSlots, Component Slots Best Practices

### Community 63 - "Readonly Bindings"
Cohesion: 0.67
Nodes (3): Directive Arguments Read-Only Pattern, getSSRProps, Directive Best Practices

### Community 64 - "Composables Patterns"
Cohesion: 0.67
Nodes (3): Options Object Pattern for Parameters, Return Readonly State with Explicit Actions, Composable Organization Patterns

### Community 65 - "Shallow Reactivity"
Cohesion: 0.67
Nodes (3): shallowReactive, shallowRef, Reactivity Core Patterns (ref, reactive, shallowRef, computed, watch)

### Community 66 - "Teleport Component"
Cohesion: 0.67
Nodes (3): Teleport to body Pattern, useMediaQuery (VueUse), Teleport Component Best Practices

### Community 67 - "Fallthrough Attributes (Alt)"
Cohesion: 0.67
Nodes (3): fallthrough attributes, component-fallthrough-attrs, useAttrs

### Community 68 - "Vue Plugins"
Cohesion: 0.67
Nodes (3): plugins concept, plugins, useAuth composable

### Community 69 - "Teleport & Media Query"
Cohesion: 0.67
Nodes (3): component-teleport, Teleport, useMediaQuery

## Knowledge Gaps
- **140 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Package Dependencies` to `State Management Setup`, `HTTP Client & Auth Repository`, `Package Config`, `Vue Router`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Vite & Dev Dependencies` to `Frontend Tech Stack`, `Package Config`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `vue-router` connect `Vue Router` to `Package Dependencies`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `composables concept` (e.g. with `component split triggers` and `reactivity concept`) actually correct?**
  _`composables concept` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vue Reactivity & Composables` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `HTTP Client & Auth Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.08199643493761141 - nodes in this community are weakly interconnected._