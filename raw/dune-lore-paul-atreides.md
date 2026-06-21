# Dune Lore — Paul Atreides y el Ecosistema Paulu

> *"Quien controla el patrimonio, controla el futuro."*
> — Adaptación de la liturgia fremen para la gestión empresarial colombiana

Este documento es la **fuente canónica de paralelismos** entre la saga *Dune* (Frank Herbert)
y cada concepto técnico del ecosistema **Paulu**. Toda la documentación del proyecto debe
referenciar un miembro, lugar o concepto de la saga cuando describe arquitectura, módulos
o herramientas.

---

## Paul Atreides — El Fundador (*Muad'Dib*)

Paul Atreides, también conocido como *Muad'Dib*, *Usul* y *Lisan al-Gaib*, es el
protagonista de la saga. Su viaje — de heredero noble en Caladan a líder mesiánico en
Arrakis — inspira la transformación digital que **Paulus** (frontend) y **Paulu**
(backend) llevan a las empresas colombianas.

| Nombre Paulu | Rol en el ecosistema | Paralelo Dune |
|---|---|---|
| **Paulus** | Frontend Vue 3 — la voz visible | *Muad'Dib* — el que guía a través del desierto |
| **Paulu** | Backend Go API — la infraestructura | *La Casa Atreides* — honor, deber y poder |
| **Paulu** (ecosistema) | Plataforma completa | *El Imperio que Paul vislumbra* |

---

## La Casa Paulu

Paulu no es solo una API. Es una **Casa Mayor** del Landsraad digital colombiano.
Nuestro símbolo no es el Halcón Atreides, sino una estrella estelar que guía a los
empresarios a través del desierto burocrático.

### El Juramento Paulu

> *"Lucharé por el control del patrimonio.*
> *Aceptaré el caos del inventario como mi maestro.*
> *Enseñaré a otros el camino de la gestión consciente.*
> *No temeré al desierto fiscal ni a la burocracia.*
> *Porque soy Paulu, y el desierto se rinde ante quien lo comprende."*

---

## La especia debe fluir — El inventario debe controlarse

En Arrakis, la **especia** (*melange*) es el recurso más valioso del universo.
En el mundo empresarial colombiano, **el inventario es la especia**.

- Sin control de inventario → crisis económica (*como la escasez de melange en el Imperio*)
- Sin proveedores confiables → colapso de la cadena (*como la traición de la Casa Atreides*)
- Sin bodegas organizadas → pérdida de recursos (*como las tormentas de arena en el bled*)
- Sin órdenes aprobadas → caos logístico (*como el caos previo al ascenso de Muad'Dib*)
- Sin salidas controladas → fuga de especia (*como el contrabando en el desierto profundo*)

---

## Paulus — El Primer Miembro

Como Paul Atreides fue el primero en unir a los fremen bajo una visión compartida,
**Paulus** es la primera aplicación del ecosistema **Paulu** en llegar al mercado.
Le seguirán más herramientas, más poder, más control.

> *"El control del patrimonio mediante el honor y la estrategia."*
> — Lema de Paulus

---

## Personajes y conceptos de la saga — Glosario Paulu

| Personaje / Concepto Dune | Rol en la saga | Equivalente Paulu |
|---|---|---|
| **Paul Atreides** (*Muad'Dib*) | Líder visionario | **Paulus** — frontend que transforma el negocio |
| **Duke Leto Atreides** | Honor y liderazgo paternal | Registro de **empresa** — establecer la Casa con integridad |
| **Lady Jessica** | Sabiduría Bene Gesserit, formación | **Validadores** — disciplina antes de actuar |
| **Chani** | Compañera fremen, lealtad | **Proveedores** — alianzas en el desierto comercial |
| **Stilgar** | Naib del sietch, guardián | **Bodegas** (*wineries*) — custodios del almacén |
| **Duncan Idaho** | Maestro de espadas, lealtad absoluta | **Autenticación JWT** — guardián de la puerta |
| **Thufir Hawat** | Mentat jefe de espías, estratega | **DI Container** + **Use Cases** — orquestación |
| **Gurney Halleck** | Guerrero-poeta, conexión emocional | **Axios / HTTP** — el puente entre mundos |
| **Dr. Liet-Kynes** | Ecologista de Arrakis | **Entradas de producto** — equilibrio del ecosistema |
| **Shadout Mapes** | Portadora de verdad, prueba de confianza | **CompanyRequiredModal** — la verdad antes de avanzar |
| **Irulan Corrino** | Cronista imperial | **Documentación + Historial** — registro de lo ocurrido en el inventario |
| **Jamis** | Primer fremen que Paul vence, inicio de su leyenda | **`CREATE`** — el primer evento de toda entidad en el historial |
| **Duncan Idaho (resucitado)** | Ghola que guarda recuerdos de vidas pasadas | **`UPDATE`** — los cambios se acumulan capa sobre capa |
| **Barón Vladimir Harkonnen** | Antagonista, caos calculado | **Errores HTTP** — fuerzas que hay que contener |
| **Feyd-Rautha** | Rival directo | **Competencia desleal** — pérdida de mercado |
| **Los Fremen** | Pueblo del desierto, productivos | **Usuarios colombianos** — pragmáticos y resilientes |
| **Bene Gesserit** | Orden de sabiduría y prueba | **Validación de formularios** — *"Revisaré tus palabras"* |
| **Mentats** | Analistas humanos de datos | **Graphify** — análisis del grafo de código |
| **Sardaukar** | Élite militar imperial | **Backend Go** — disciplina y resistencia |
| **Navegadores Guild** | Rutas interestelares | **Vue Router** — caminos entre vistas |
| **Ornitópteros** | Transporte ágil en Arrakis | **Despachos / Shipments** — salida de mercancía |
| **Shai-Hulud** (*gusano de arena*) | Poder del desierto | **Sistema de inventario** — temido y esencial |
| **Sietch Tabr** | Comunidad subterránea fremen | **Pinia Stores** — memoria colectiva del estado |
| **Visión del pasado de Paul** | Paul veía los recuerdos de sus ancestros en la especia | **Historial de inventario** — visión completa de cada evento ocurrido en el imperio |
| **Agonía de la especia** | Ritual donde Paul accede a la memoria genética | **`useHistoryLogger`** — registro en tiempo real de cada acción del negocio |
| **Traje stillsuit** | Conservación de agua | **localStorage** — persistencia de sesión |
| **Disciplina del agua** | No desperdiciar gota alguna | **useQuantityValidation** — no exceder stock |
| **Kwisatz Haderach** | El que ve todos los caminos | **Full-stack developer** — frontend + backend |
| **CHOAM** | Compañía que controla la economía | **Órdenes de compra/venta** — contratos comerciales |
| **Landsraad** | Consejo de Casas Mayores | **Ecosistema de empresas** registradas en Paulu |
| **Litany Against Fear** | Oración contra el miedo | **OnboardingModal** — enfrentar el desierto fiscal |
| **Weirding Way** | Arte marcial fremen | **@vueuse/motion** — movimiento con propósito |
| **Voz Bene Gesserit** | Comando irresistible | **AppAlert** — mensajes que exigen atención |
| **Escudo Holtzman** | Protección perimetral | **CORS + Middleware** — frontera de la API |
| **Crysknife** | Arma forjada con precisión | **TypeScript strict** — tipos que no fallan |
| **Caladan** | Mundo oceánico, origen noble | **Clean Architecture** — estructura antes del desierto |
| **Arrakis** | Desierto de oportunidad y peligro | **Entorno empresarial colombiano** |
| **Salusa Secundus** | Planeta de entrenamiento extremo | **Build de producción** — prueba final antes del despliegue |
| **Fedaykin** | Guardia personal de Muad'Dib | **Aprobación de órdenes** (`approveOrder`) |
| **Lisan al-Gaib** | El Agua de Vida, el esperado | **Dashboard en tiempo real** — visión del futuro |
| **Agua de Vida** | Ritual de transformación | **Registro exitoso** — el negocio renace |
| **Yihad Butleriana** | Prohibición de pensar-máquinas | **Transformación digital consciente** — herramientas que potencian, no reemplazan |
| **Ixianos** | Tecnología prohibida avanzada | **Graphify / Vite** — herramientas de vanguardia |
| **Tleilaxu** | Clonadores, artífices | **Generación automática de códigos** (`PROD-{timestamp}`) |

---

## Paralelismos técnicos — Stack y arquitectura

| Concepto técnico | Referencia Dune | Significado en Paulu |
|---|---|---|
| **Vue 3 + Composition API** | *Visión de Muad'Dib* | Reactividad que anticipa el estado del negocio |
| **TypeScript strict** | *Crysknife* | Precisión forjada; un tipo mal cortado duele |
| **Vite 8** | *Ornitóptero* | Despliegue veloz sobre el desierto de compilación |
| **TailwindCSS 4** | *Traje stillsuit* | Capas adaptativas; UI que sobrevive al entorno |
| **Pinia 3** | *Sietch Tabr* | Estado compartido entre componentes del clan |
| **Vue Router 5** | *Navegadores Guild* | Rutas sagradas entre `/` y `/auth` |
| **Axios + interceptor JWT** | *Gurney Halleck* | Mensajero leal que lleva el sello Atreides en cada petición |
| **@vueuse/motion 3** | *Weirding Way* | Animaciones con intención, no adorno vacío |
| **Historial de inventario** | *Visión del pasado de Paul* | Línea de tiempo completa de eventos; como Paul recordando cada camino recorrido |
| **`HistoryTimeline`** | *Viaje en el tiempo de Paul* | Visualización de eventos con búsqueda y detalle expandible |
| **`HistoryDetailModal`** | *Visión enfocada de Muad'Dib* | Modal que muestra el historial de una entidad específica |
| **`historyStore`** | *Memoria genética del sietch* | Estado reactivo que almacena los pergaminos del pasado |
| **`useHistoryLogger`** | *La voz de Paul registra* | Composable que captura cada acción (crear, actualizar, eliminar, aprobar) y la escribe en los Archivos |
| **`HistoryAction` (CREATE/UPDATE/DELETE)** | *Momentos de la profecía* | Cada tipo de evento es un hito en el camino de la especia |
| **`extractDocumentName`** | *Revelación en el agua de vida* | Extrae el nombre del producto desde los datos JSON del evento |
| **Clean Architecture (4 capas)** | *Caladan → Arrakis* | Estructura noble antes de enfrentar el desierto |
| `domain/` | *Código de honor Atreides* | Reglas puras, sin dependencias externas |
| `application/` | *Thufir Hawat* | Casos de uso y estrategia de negocio |
| `infrastructure/` | *Fortaleza Sardaukar* | Axios, repos, JWT — la muralla técnica |
| `presentation/` | *Rostro de Paul ante los fremen* | Vue, stores, router — lo que el usuario ve |
| `shared/` | *Reservas de agua del sietch* | Config y token storage compartidos |
| **DI Container** (`container.ts`) | *Mentat Thufir* | Conecta dependencias como un mentat conecta hechos |
| **Direct Axios Services** | *Exploradores fremen* | Servicios ágiles fuera del contenedor (productos, órdenes…) |
| **PostgreSQL** | *Acuíferos del bled* | Almacén profundo y persistente |
| **JWT HS256** | *Anillo de sello Atreides* | Credencial que abre puertas imperiales |
| **Graphify** | *Mentat de análisis* | Grafo de dependencias; ver el imperio del código |

---

## Paralelismos técnicos — Módulos de negocio

| Módulo / Componente | Referencia Dune | Significado en Paulu |
|---|---|---|
| **AuthPage / LoginForm** | *Duncan Idaho en la puerta* | Solo entra quien porta el sello correcto |
| **RegisterForm** | *Iniciación fremen* | El primer paso para unirse al sietch |
| **DashboardPage** | *Sala de mando de Muad'Dib* | Visión global del imperio empresarial |
| **CompanyRegistrationForm** | *Duke Leto establece la Casa en Arrakis* | 6 pasos para fundar la presencia legal |
| **OnboardingModal** | *Litany Against Fear* | Enfrentar el miedo al desierto fiscal |
| **CompanyRequiredModal** | *Shadout Mapes* | La verdad incómoda: sin Casa no hay gestión |
| **ProductRegistrationForm** | *Cosecha de especia* | Registrar cada grano de melange del inventario |
| **ProductList** | *Inventario del sietch* | Tabla de riqueza acumulada |
| **ProductEditModal** | *Refinar la cosecha* | Ajustar lo ya extraído del desierto |
| **ConfirmDeleteModal** | *Agua derramada* | Advertencia: lo eliminado no vuelve al sietch |
| **ProviderRegistrationForm** | *Tratado con el Landsraad* | Forjar alianza con proveedores |
| **SupplierSelectionModal** | *Elegir aliado fremen* | Selección consciente de socio comercial |
| **WineryRegistrationForm** | *Fundar un sietch* | Bodega = refugio subterráneo del stock |
| **WinerySelectionModal** | *Elegir sietch destino* | Dónde guardar la especia |
| **ProductEntryForm** | *Dr. Kynes — entrada al ecosistema* | Entrada de mercancía con balance ecológico |
| **ProductEntryList** | *Registro de cosechas* | Histórico de lo que entró a Arrakis |
| **OrderForm** | *Contrato CHOAM* | Orden de compra/venta con detalle financiero |
| **OrderList** | *Archivo de contratos imperiales* | Listado de órdenes pendientes y aprobadas |
| **OrderEditModal** | *Thufir revisa la estrategia* | Edición de orden existente |
| **approveOrder** | *Fedaykin confirman la misión* | Aprobación antes de ejecutar |
| **DispatchSummaryModal** | *Informe post-batalla* | Resumen tras despacho |
| **AutomationConfirmModal** | *Profecía de Muad'Dib* | Confirmar automatización con visión clara |
| **ShipmentForm** | *Ornitóptero cargado de especia* | Salida de inventario hacia destinatario |
| **ShipmentList** | *Registro de vuelos del desierto* | Histórico de despachos |
| **ShipmentEditModal** | *Recalcular ruta del ornitóptero* | Edición de salida existente |
| **ShipmentDetailModal** | *Manifiesto de carga* | Detalle completo del despacho |
| **EntrySelectionModal** | *Elegir cisterna de agua* | Seleccionar entradas como origen del despacho |
| **useQuantityValidation** | *Disciplina del agua fremen* | No despachar más de lo que el sietch tiene |
| **UserProfile** | *Identidad de Usul* | Quién eres en el desierto |
| **EditProfileModal** | *Renacer en el sietch* | Actualizar identidad y datos de la Casa |
| **AppAlert** | *Voz Bene Gesserit* | Alerta que no puede ignorarse |
| **authAlertMessages.ts** | *Traducción de profecías* | Errores crudos → mensajes comprensibles |
| **Navigation guard** | *Duncan Idaho* | Redirige al intruso sin sello |
| **Axios interceptor** | *Sello Atreides en cada mensaje* | Bearer token automático |
| **tokenStorage / localStorage** | *Traje stillsuit* | Conserva sesión entre tormentas de recarga |
| **companyStore** | *Casa activa del Landsraad* | Empresa seleccionada en sesión |
| **productStore** | *Reserva de melange* | Estado CRUD de productos |
| **orderStore** | *Archivo CHOAM* | Estado CRUD de órdenes |
| **shipmentStore** | *Hangar de ornitópteros* | Estado CRUD de despachos |
| **productEntryStore** | *Cisternas de Kynes* | Estado CRUD de entradas |
| **providerStore** | *Rolodex del Landsraad* | Estado CRUD de proveedores |
| **wineryStore** | *Mapa de sietchs* | Estado CRUD de bodegas |
| **authStore** | *Memoria de Duncan* | Sesión, login, logout |
| **historyStore** | *Memoria genética de Paul* | Estado del historial: entradas, carga, errores |
| **HistoryTimeline** | *Línea de tiempo de Muad'Dib* | Componente visual de eventos con búsqueda y detalle |
| **HistoryDetailModal** | *Visión enfocada de Paul* | Modal que filtra historial por entidad específica |
| **useHistoryLogger** | *Escriba de Paul* | Funciones `logCreate`, `logUpdate`, `logDelete`, `logApprove`, `logDeduct` |
| **Dashboard > Transactions** | *Sala de crónicas de Paul* | Vista de historial completo en el panel principal |

---

## Paralelismos técnicos — Backend Paulu (Go API)

| Concepto backend | Referencia Dune | Significado |
|---|---|---|
| **Go API** | *Sardaukar* | Backend disciplinado, rápido, implacable |
| **PostgreSQL** | *Acuífero del desierto* | Persistencia profunda |
| **Handlers HTTP** | *Emisarios de la Casa* | Puerta de entrada al Imperio |
| **Use Cases** | *Consejo de Thufir* | Lógica de negocio pura |
| **Repositories** | *Archiveros del sietch* | Acceso a datos sin contaminar dominio |
| **JWT middleware** | *Escudo Holtzman* | Solo peticiones autorizadas pasan |
| **Recovery middleware** | *Mentat ante el caos* | Captura pánico y restaura orden |
| **CORS** | *Frontera de Arrakis* | Solo `localhost:5173` entra al desierto |
| **Migraciones SQL** | *Terraformación de Kynes* | Preparar el planeta (BD) para la vida |
| `/products` | *Campos de melange* | CRUD de la especia |
| `/orders` | *Contratos CHOAM* | Órdenes de compra y venta |
| `/orders/{id}/approve` | *Fedaykin aprueban* | PATCH de aprobación |
| `/shipments` | *Salidas en ornitóptero* | Despachos de inventario |
| `/product-entries` | *Entradas ecológicas* | Ingresos al ecosistema |
| `/providers` | *Aliados del Landsraad* | Proveedores |
| `/wineries` | *Sietchs registrados* | Bodegas |
| `/companies` | *Casas del Landsraad* | Empresas |
| `/auth/login` | *Reconocimiento del sello* | Autenticación |
| `/auth/register` | *Iniciación al sietch* | Registro de usuario |
| `/history` | *Archivos de Irulan / Visión de Paul* | Historial completo de inventario |
| `/history/{type}/{id}` | *Visión enfocada de Paul* | Historial por documento específico |

---

## Paralelismos técnicos — Herramientas y convenciones

| Herramienta / Convención | Referencia Dune | Significado |
|---|---|---|
| **Graphify** | *Mentat* | Análisis del grafo de dependencias del código |
| **vue-tsc** | *Prueba del crysknife* | Verificación de tipos antes de la batalla |
| **npm run dev** | *Primer vuelo en ornitóptero* | Desarrollo local en el desierto |
| **npm run build** | *Salusa Secundus* | Entrenamiento final antes de producción |
| **snake_case API** | *Lenguaje del Imperio* | Convención del backend (`product_code`) |
| **camelCase frontend** | *Lenguaje de Usul* | Convención Vue (`productCode`) |
| **Español en UI** | *Fremenki* | Idioma del pueblo que usa Paulus |
| **Tema stellar/cósmico** | *Cielo de Arrakis de noche* | Dark mode con estrellas y nebulosas |

---

## Cómo usar este documento

1. Al documentar un **nuevo módulo**, busca primero un paralelo en las tablas anteriores.
2. Si no existe, elige un personaje o concepto de *Dune* cuyo **rol narrativo** coincida
   con la función técnica (guardián, estratega, transporte, validación, etc.).
3. Incluye la referencia en el título o subtítulo del apartado: *"Módulo X — *Paralelo Dune*"*.
4. Mantén coherencia: **Paulus** = visión/frontend, **Paulu** = infraestructura/backend,
   **especia** = inventario, **sietch** = bodega/store, **ornitóptero** = despacho.

> *"Una referencia sin contexto es como un fremen sin desierto."*
> — Thufir Hawat, adaptado para documentación Paulu
