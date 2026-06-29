# Graph Report - .  (2026-06-28)

## Corpus Check
- 168 files · ~113,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 491 nodes · 459 edges · 103 communities (71 shown, 32 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_TypeScript Config (App)|TypeScript Config (App)]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Clean Architecture  Auth|Clean Architecture / Auth]]
- [[_COMMUNITY_Vue Best Practices|Vue Best Practices]]
- [[_COMMUNITY_Vue Router Patterns|Vue Router Patterns]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_TypeScript Config (Node)|TypeScript Config (Node)]]
- [[_COMMUNITY_Product Entry Service|Product Entry Service]]
- [[_COMMUNITY_Order Service|Order Service]]
- [[_COMMUNITY_Sale Service|Sale Service]]
- [[_COMMUNITY_Shipment Service|Shipment Service]]
- [[_COMMUNITY_Graphify Integration|Graphify Integration]]
- [[_COMMUNITY_Domain Entities|Domain Entities]]
- [[_COMMUNITY_Product Service|Product Service]]
- [[_COMMUNITY_Winery Service|Winery Service]]
- [[_COMMUNITY_Product Selection UI|Product Selection UI]]
- [[_COMMUNITY_Provider Service|Provider Service]]
- [[_COMMUNITY_Login Validation|Login Validation]]
- [[_COMMUNITY_AI Service|AI Service]]
- [[_COMMUNITY_Company Service|Company Service]]
- [[_COMMUNITY_History Service|History Service]]
- [[_COMMUNITY_Registration Validation|Registration Validation]]
- [[_COMMUNITY_Registration Use Case|Registration Use Case]]
- [[_COMMUNITY_Orders UI|Orders UI]]
- [[_COMMUNITY_History Composable & Store|History Composable & Store]]
- [[_COMMUNITY_Theme Composable|Theme Composable]]
- [[_COMMUNITY_Login Use Case|Login Use Case]]
- [[_COMMUNITY_Auth Alert Messages|Auth Alert Messages]]
- [[_COMMUNITY_User Profile|User Profile]]
- [[_COMMUNITY_User Service|User Service]]
- [[_COMMUNITY_History Entity|History Entity]]
- [[_COMMUNITY_Sale Detail Modal|Sale Detail Modal]]
- [[_COMMUNITY_Economic Activity Service|Economic Activity Service]]
- [[_COMMUNITY_Invoice Service|Invoice Service]]
- [[_COMMUNITY_Main Address Service|Main Address Service]]
- [[_COMMUNITY_Tax Information Service|Tax Information Service]]
- [[_COMMUNITY_TypeScript Config (Root)|TypeScript Config (Root)]]
- [[_COMMUNITY_Router Config|Router Config]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_Company Store|Company Store]]
- [[_COMMUNITY_Order Store|Order Store]]
- [[_COMMUNITY_Product Entry Store|Product Entry Store]]
- [[_COMMUNITY_Product Store|Product Store]]
- [[_COMMUNITY_Provider Store|Provider Store]]
- [[_COMMUNITY_Sale Store|Sale Store]]
- [[_COMMUNITY_Shipment Store|Shipment Store]]
- [[_COMMUNITY_Winery Store|Winery Store]]
- [[_COMMUNITY_Alert Types|Alert Types]]
- [[_COMMUNITY_Computed API|Computed API]]
- [[_COMMUNITY_Reactive API|Reactive API]]
- [[_COMMUNITY_ShallowRef API|ShallowRef API]]
- [[_COMMUNITY_Ref API|Ref API]]
- [[_COMMUNITY_Watch API|Watch API]]
- [[_COMMUNITY_Dashboard Prompt|Dashboard Prompt]]
- [[_COMMUNITY_DefineOptions Macro|DefineOptions Macro]]
- [[_COMMUNITY_DefineSlots Macro|DefineSlots Macro]]
- [[_COMMUNITY_Vue Best Practices License|Vue Best Practices License]]
- [[_COMMUNITY_Vue Best Practices Sync|Vue Best Practices Sync]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 25 edges
2. `Vue Best Practices Workflow` - 17 edges
3. `compilerOptions` - 16 edges
4. `graphify SKILL.md (main skill)` - 11 edges
5. `Implementation Guide - Paulu Areides` - 10 edges
6. `Vue Router Best Practices Skill` - 9 edges
7. `AuthRepository` - 7 edges
8. `Reactivity Core Patterns` - 7 edges
9. `IHttpClient` - 6 edges
10. `Paulus (Vue 3 frontend application)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `shallowRef for Performance` --semantically_similar_to--> `Route Param Changes Don't Trigger Lifecycle Hooks`  [INFERRED] [semantically similar]
  .agents/skills/vue-best-practices/references/reactivity.md → .agents/skills/vue-router-best-practices/reference/router-param-change-no-lifecycle.md
- `Vue script setup with TypeScript` --conceptually_related_to--> `Composable Pattern (Vue 3)`  [INFERRED]
  README.md → .agents/skills/vue/references/core-new-apis.md
- `Vue script setup with TypeScript` --conceptually_related_to--> `script setup syntax (Vue 3 SFC)`  [INFERRED]
  README.md → .agents/skills/vue/references/script-setup-macros.md
- `Implementation Guide - Paulu Areides` --references--> `graphify SKILL.md (main skill)`  [EXTRACTED]
  IMPLEMENTATION_GUIDE.md → .claude/skills/graphify/SKILL.md
- `project CLAUDE.md (graphify integration)` --references--> `graphify SKILL.md (main skill)`  [EXTRACTED]
  CLAUDE.md → .claude/skills/graphify/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vue Best Practices Workflow Sections** — vue-best-practices_skill, references_component-data-flow, references_composables, references_perf-virtualize-large-lists, references_perf-v-once-v-memo-directives, references_perf-avoid-component-abstraction-in-lists [EXTRACTED 1.00]
- **Vue Core Design Principles** — vue-best-practices_keep-state-predictable, vue-best-practices_props-down-events-up, vue-best-practices_avoid-unnecessary-rerenders, vue-best-practices_favor-small-focused-components [EXTRACTED 1.00]
- **Vue Route View Nesting Pattern** — references_component-suspense, references_component-transition, references_component-keep-alive [EXTRACTED 1.00]
- **Vue Router Navigation Guard Gotchas** — reference_beforeenter_param_trigger, reference_beforerouteenter_no_this, reference_async_guard_await, reference_guard_infinite_loop, reference_next_deprecated, concept_guard_execution_order, concept_return_based_guards [INFERRED 0.85]
- **Vue Reactivity and Performance Optimization Patterns** — references_reactivity, concept_shallowref, concept_computed_purity, references_updated_hook_performance, references_sfc, references_render_functions [INFERRED 0.85]
- **Vue 3 Composition API Skill Ecosystem** — vue_skill, references_advanced_patterns, references_reactivity, references_sfc, vue_router_best_practices_skill [INFERRED 0.85]
- **Vue 3 Reactivity and Composables** — core_new_apis_ref, core_new_apis_shallowref, core_new_apis_computed, core_new_apis_reactive, core_new_apis_watch, core_new_apis_watcheffect, core_new_apis_effectscope, core_new_apis_composable_pattern [EXTRACTED 1.00]
- **Graphify Skill References** — graphify_extraction_spec, graphify_add_watch, graphify_exports, graphify_github_merge, graphify_hooks, graphify_query, graphify_transcribe, graphify_update [EXTRACTED 1.00]
- **Paulus Full-Stack Architecture** — paulus_vue3_app, paulu_go_backend, clean_architecture, di_container, product_flow, inventory_history_system, ai_configurable_system [EXTRACTED 1.00]

## Communities (103 total, 32 thin omitted)

### Community 0 - "TypeScript Config (App)"
Cohesion: 0.07
Nodes (28): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, erasableSyntaxOnly, esModuleInterop, ignoreDeprecations (+20 more)

### Community 1 - "Package Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, axios, pdfmake, pinia, @tailwindcss/typography, vue, vue-router, @vueuse/motion (+19 more)

### Community 2 - "Clean Architecture / Auth"
Cohesion: 0.12
Nodes (12): Clean Architecture (4 layers), authRepository, container, httpClient, AxiosHttpClient, axiosInstance, HttpError, HttpRequestOptions (+4 more)

### Community 3 - "Vue Best Practices"
Cohesion: 0.10
Nodes (25): Plugin Install Contract, Return-Based Navigation Guard Syntax, Symbol Injection Keys for Type Safety, Class-based Animations for Non-Enter/Leave Effects, State-driven Animations with CSS Transitions and Style Bindings, Async Component Best Practices, Component Data Flow Best Practices, Component Fallthrough Attributes Best Practices (+17 more)

### Community 4 - "Vue Router Patterns"
Cohesion: 0.13
Nodes (22): Computed Property Purity, Event Listener Lifecycle Cleanup, Navigation Guard Execution Order, Route Component Instance Reuse, shallowRef for Performance, SSR State Isolation, Async Navigation Guard Promise Handling, beforeEnter Guard Ignores Param Changes (+14 more)

### Community 5 - "Project Overview"
Cohesion: 0.14
Nodes (20): AI Configurable System (Mentat), AIModelsPanel wizard (3-step AI config), aiService (AI provider verification), Composable Pattern (Vue 3), effectScope (Vue 3 reactivity), watchEffect (Vue 3 watcher), Implementation Guide - Paulu Areides, index.html entry point (+12 more)

### Community 6 - "TypeScript Config (Node)"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 7 - "Product Entry Service"
Cohesion: 0.15
Nodes (5): CreateProductEntryRequest, Deduction, FinancialSummary, ProductEntryDetail, ProductEntryResponse

### Community 8 - "Order Service"
Cohesion: 0.17
Nodes (5): CreateOrderRequest, FinancialSummary, OrderCreateResponse, OrderDetail, OrderResponse

### Community 9 - "Sale Service"
Cohesion: 0.17
Nodes (4): CreateSaleRequest, SaleListResponse, SaleProduct, SaleResponse

### Community 10 - "Shipment Service"
Cohesion: 0.17
Nodes (6): CreateShipmentRequest, Recipient, ShipmentDetail, ShipmentFinancialSummary, ShipmentResponse, SourceDocument

### Community 11 - "Graphify Integration"
Cohesion: 0.24
Nodes (11): graphify section in CLAUDE.md, graphify add URL and watch mode, graphify export options (wiki, neo4j, falkordb, svg, graphml, mcp), graphify extraction specification, graphify GitHub clone and cross-repo merge, graphify commit hook and CLAUDE.md integration, graphify query, path, explain, graphify SKILL.md (main skill) (+3 more)

### Community 12 - "Domain Entities"
Cohesion: 0.31
Nodes (5): AuthSession, User, IAuthRepository, LoginCredentials, RegisterData

### Community 13 - "Product Service"
Cohesion: 0.20
Nodes (3): CreateProductRequest, ProductResponse, UpdateProductRequest

### Community 14 - "Winery Service"
Cohesion: 0.20
Nodes (3): CreateWineryRequest, UpdateWineryRequest, WineryResponse

### Community 16 - "Product Selection UI"
Cohesion: 0.22
Nodes (5): allSelected, error, filteredProducts, loading, search

### Community 17 - "Provider Service"
Cohesion: 0.22
Nodes (3): CreateProviderRequest, ProviderResponse, UpdateProviderRequest

### Community 18 - "Login Validation"
Cohesion: 0.39
Nodes (4): ILoginValidator, LoginFieldErrors, LoginValidationResult, LoginValidator

### Community 19 - "AI Service"
Cohesion: 0.32
Nodes (7): AiProvider, PROVIDER_ENDPOINTS, verifyAiModel(), verifyGemini(), verifyOpenAiCompatible(), VerifyParams, VerifyResult

### Community 21 - "History Service"
Cohesion: 0.32
Nodes (5): createHistoryEntry(), CreateHistoryRequest, extractDocumentName(), HistoryApiResponse, mapToHistoryEntry()

### Community 22 - "Registration Validation"
Cohesion: 0.43
Nodes (4): IRegisterValidator, RegisterValidationResult, RegisterValidator, REQUIRED_FIELDS

### Community 25 - "Orders UI"
Cohesion: 0.29
Nodes (3): formatCOP(), formatDate(), formatDate()

### Community 26 - "History Composable & Store"
Cohesion: 0.33
Nodes (3): useHistoryLogger(), useAuthStore, useHistoryStore

### Community 29 - "Auth Alert Messages"
Cohesion: 0.60
Nodes (4): AuthAlertMessage, matches(), resolveLoginAlertMessage(), resolveRegisterAlertMessage()

### Community 32 - "History Entity"
Cohesion: 0.50
Nodes (3): HistoryAction, HistoryChange, HistoryEntry

### Community 36 - "Invoice Service"
Cohesion: 0.67
Nodes (3): generateInvoicePDF(), get(), paymentMethodLabels

## Knowledge Gaps
- **179 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Implementation Guide - Paulu Areides` connect `Project Overview` to `Clean Architecture / Auth`, `Graphify Integration`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TypeScript Config (App)` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Clean Architecture / Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Vue Best Practices` be split into smaller, more focused modules?**
  _Cohesion score 0.10333333333333333 - nodes in this community are weakly interconnected._
- **Should `Vue Router Patterns` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._