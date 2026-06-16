# Graph Report - .  (2026-06-15)

## Corpus Check
- 98 files · ~55,056 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 322 nodes · 292 edges · 66 communities (47 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

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
- [[_COMMUNITY_Leaf authStore.ts|Leaf: authStore.ts]]
- [[_COMMUNITY_Leaf companyStore.ts|Leaf: companyStore.ts]]
- [[_COMMUNITY_Leaf orderStore.ts|Leaf: orderStore.ts]]
- [[_COMMUNITY_Leaf productEntryStore.ts|Leaf: productEntryStore.ts]]
- [[_COMMUNITY_Leaf productStore.ts|Leaf: productStore.ts]]
- [[_COMMUNITY_Leaf providerStore.ts|Leaf: providerStore.ts]]
- [[_COMMUNITY_Leaf shipmentStore.ts|Leaf: shipmentStore.ts]]
- [[_COMMUNITY_Leaf wineryStore.ts|Leaf: wineryStore.ts]]
- [[_COMMUNITY_Leaf appAlert.types.ts|Leaf: appAlert.types.ts]]

## God Nodes (most connected - your core abstractions)
1. `[]` - 24 edges
2. `compilerOptions` - 24 edges
3. `compilerOptions` - 16 edges
4. `AuthRepository` - 7 edges
5. `IHttpClient` - 6 edges
6. `AxiosHttpClient` - 5 edges
7. `LoginValidator` - 5 edges
8. `scripts` - 4 edges
9. `RegisterUseCase` - 4 edges
10. `RegisterValidator` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AuthSession` --references--> `User`  [EXTRACTED]
  src/domain/entities/AuthSession.ts → src/domain/entities/User.ts
- `AxiosHttpClient` --implements--> `IHttpClient`  [EXTRACTED]
  src/infrastructure/http/AxiosHttpClient.ts → src/infrastructure/http/IHttpClient.ts
- `AuthRepository` --references--> `IHttpClient`  [EXTRACTED]
  src/infrastructure/repositories/AuthRepository.ts → src/infrastructure/http/IHttpClient.ts
- `LoginValidator` --implements--> `ILoginValidator`  [EXTRACTED]
  src/presentation/validators/LoginValidator.ts → src/presentation/validators/ILoginValidator.ts
- `RegisterValidator` --implements--> `IRegisterValidator`  [EXTRACTED]
  src/presentation/validators/RegisterValidator.ts → src/presentation/validators/IRegisterValidator.ts

## Import Cycles
- None detected.

## Communities (66 total, 19 thin omitted)

### Community 0 - "Module: tsconfig.app.json"
Cohesion: 0.07
Nodes (27): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, erasableSyntaxOnly, esModuleInterop, isolatedModules (+19 more)

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
Cohesion: 0.20
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

## Knowledge Gaps
- **140 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `private`, `version` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Module: tsconfig.app.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Module: package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Module: container.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Should `Module: []` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Module: tsconfig.node.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._