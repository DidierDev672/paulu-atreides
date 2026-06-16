# Graph Report - src  (2026-06-13)

## Corpus Check
- 43 files · ~13,792 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 139 nodes · 146 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `[]` - 20 edges
2. `AuthRepository` - 7 edges
3. `IHttpClient` - 6 edges
4. `AxiosHttpClient` - 5 edges
5. `LoginValidator` - 5 edges
6. `RegisterUseCase` - 4 edges
7. `RegisterValidator` - 4 edges
8. `LoginDto` - 3 edges
9. `RegisterDto` - 3 edges
10. `LoginUseCase` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AuthSession` --references--> `User`  [EXTRACTED]
  domain/entities/AuthSession.ts → domain/entities/User.ts
- `AxiosHttpClient` --implements--> `IHttpClient`  [EXTRACTED]
  infrastructure/http/AxiosHttpClient.ts → infrastructure/http/IHttpClient.ts
- `AuthRepository` --references--> `IHttpClient`  [EXTRACTED]
  infrastructure/repositories/AuthRepository.ts → infrastructure/http/IHttpClient.ts
- `LoginValidator` --implements--> `ILoginValidator`  [EXTRACTED]
  presentation/validators/LoginValidator.ts → presentation/validators/ILoginValidator.ts
- `RegisterValidator` --implements--> `IRegisterValidator`  [EXTRACTED]
  presentation/validators/RegisterValidator.ts → presentation/validators/IRegisterValidator.ts

## Import Cycles
- None detected.

## Communities (29 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (11): authRepository, container, httpClient, AxiosHttpClient, axiosInstance, HttpError, HttpRequestOptions, IHttpClient (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (16): [], activities, authStore, currentPage, loadingCompany, navItems, notifications, paginatedTransactions (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.31
Nodes (5): AuthSession, User, IAuthRepository, LoginCredentials, RegisterData

### Community 3 - "Community 3"
Cohesion: 0.39
Nodes (4): ILoginValidator, LoginFieldErrors, LoginValidationResult, LoginValidator

### Community 4 - "Community 4"
Cohesion: 0.43
Nodes (4): IRegisterValidator, RegisterValidationResult, RegisterValidator, REQUIRED_FIELDS

### Community 9 - "Community 9"
Cohesion: 0.60
Nodes (4): AuthAlertMessage, matches(), resolveLoginAlertMessage(), resolveRegisterAlertMessage()

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (3): CreateProductRequest, ProductResponse, UpdateProductRequest

## Knowledge Gaps
- **37 isolated node(s):** `CompanyRequest`, `CompanyResponse`, `ProductResponse`, `CreateProductRequest`, `UpdateProductRequest` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `CompanyRequest`, `CompanyResponse`, `ProductResponse` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._