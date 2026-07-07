# Tarea M5 — Revisión de backlog + Auditoría de documentación

## Parte A — Revisión del backlog de historias de usuario (pre-S4)

### Paso 2 — Contraste con lo que sé ahora

**1. ¿Siguen teniendo sentido las historias tal como las generé? ¿El alcance sigue ceñido al MVP?**

El alcance se mantiene ceñido al MVP del PRD. De hecho, al construir el prompt para el ejercicio pre-S4 me di cuenta de que yo mismo había metido dos features fuera de scope (verificación por email y recuperación de contraseña) antes de que lo hiciera la IA. Las saqué del PRD antes de ejecutar el prompt, así que el output final no las incluye, y no veo ninguna story que se haya "colado" fuera del MVP.

**2. ¿Hay historias cuyos criterios de aceptación ahora veo incompletos o poco verificables?**

Ya lo había detectado sin darme cuenta del todo, en realidad, cuando hice el ejercicio de poke-holes sobre la story de "Creación de eventos a partir de tareas con fecha límite". Ahí encontré varios huecos que siguen sin resolverse en el backlog. No se define si la fecha límite incluye hora o solo día (eso determina si el evento en Google Calendar es de todo el día o con horario específico), no hay ningún criterio para cuando el usuario revoca el acceso a Google directamente desde su cuenta (un error de autorización, no un fallo transitorio de API), y tampoco se especifica qué pasa cuando se agotan los reintentos de sincronización. Son criterios que suenan verificables en el papel ("el sistema reintenta la sincronización más tarde") pero que en la práctica no se pueden probar, porque no dicen cuántas veces, cada cuánto, ni qué ve el usuario si todo falla.

**3. ¿Hay historias que han cambiado de naturaleza desde entonces?**

Al menos una sí cambió: la story de "Creación de eventos a partir de tareas con fecha límite" cambió de naturaleza en cuanto detecté que ninguna story del backlog contempla guardar el ID del evento de Google Calendar asociado a cada tarea. Cuando la escribí, la traté como una simple llamada a una API externa, pero sin ese ID persistido en algún lado, las stories de actualizar o borrar el evento (que sí existen en el backlog) son imposibles de implementar. Asumen que "el evento correspondiente" existe, pero no dicen cómo el sistema lo identifica. Eso significa que esta story ya no es solo "crear un evento": implícitamente exige un cambio en el modelo de datos (un campo tipo `google_event_id` en la tarea) que no estaba contemplado al principio.

**4. ¿Hay historias nuevas que no aparecieron cuando lo generé y que ahora sí deberían estar?**

Con lo que encontré en el poke-holes, veo al menos dos candidatas que faltan en el backlog:
- Una story específica para cuando el usuario revoca el acceso a Google desde fuera de FlowSync: el sistema debería detectar ese error de autorización (distinto de un fallo temporal de API) y pedirle al usuario que reconecte su cuenta, en vez de seguir reintentando indefinidamente.
- Una story (o al menos un criterio explícito) sobre evitar eventos duplicados: si una creación de evento tiene éxito en Google pero la respuesta llega con timeout, FlowSync no sabe que ya se creó y podría reintentar, generando un evento duplicado en el calendario del usuario. Eso no está cubierto por ningún scenario actual.

**5. Contraste con el backlog de Iván en Linear (S4)**

Iván el mentor partió también de una primera versión generada por IA (5 épicas, 20 user stories, más que mis 17) y la refinó en tres pasadas: primero granularidad (marcó la épica de Google Calendar como `needs splitting` por ser grande y tener demasiado desconocimiento técnico), luego scope creep hacia atrás (quitó del backlog stories que sí estaban dentro del MVP del PRD pero que no consideró imprescindibles para una primera entrega — por ejemplo cierre de sesión y la pantalla de onboarding en autenticación, o borrar tarea y cambiar de estado en la gestión de tareas), y por último la revisión de criterios de aceptación (que cada story tuviera happy path + edge case + error, no solo el caminito feliz jeje).

La diferencia que más me llamó la atención es cómo tratamos la épica de Google Calendar. Yo escribí las 5 stories completas con sus criterios de aceptación y usé `(asumido)` donde me faltaba información, y después usé poke-holes para encontrar los huecos. Iván, en cambio, ni siquiera intentó escribir esas stories: las sacó del backlog "de verdad" y creó una única issue de tipo spike ("explorar la API de Google Calendar y proponer descomposición"), con una propuesta tentativa de 2-3 stories candidatas, sin comprometerlas todavía.

Creo que en ese punto acertó más Iván. Su enfoque evita invertir tiempo detallando criterios de aceptación para una épica que probablemente se replantee entera en cuanto el spike arroje resultados técnicos (por ejemplo, cómo se resuelven las zonas horarias o los rate limits de la API). Yo, en cambio, gasté ese esfuerzo de antemano. Dicho esto, no creo que mi trabajo haya sido en vano: los gaps concretos que encontré con el poke-holes (el ID del evento, el token revocado, los reintentos, los duplicados) son exactamente el tipo de pregunta que ese spike necesitaría responder, así que mi backlog termina siendo un buen insumo para alimentar ese spike, aunque el orden ideal hubiera sido spike primero, stories detalladas después.

En el resto de épicas (autenticación, tareas) sí coincidimos en el criterio de acotar al MVP, aunque Iván fue un paso más allá que yo: no solo respetó el scope del PRD, sino que lo recortó aún más para una primera iteración dentro del propio MVP. Yo mantuve las 17 stories como un solo bloque sin esa segunda capa de priorización.

### Paso 3 — Ajustes concretos

**Ajuste 1:** Añadir un campo `google_event_id` al modelo de tarea, y actualizar la story de "Creación de eventos" para que incluya explícitamente el criterio de que ese ID se guarda al crear el evento.
**Motivo:** Sin ese dato, las stories de actualización y borrado de evento (que ya existen en el backlog) no se pueden implementar — dependen de "encontrar el evento correspondiente" sin especificar cómo. Lo detecté en el ejercicio de poke-holes sobre la story de creación de eventos.

**Ajuste 2:** Añadir una story nueva para el caso de token de Google revocado desde fuera de FlowSync (por ejemplo, si el usuario revoca el acceso desde su propia cuenta de Google).
**Motivo:** Es un tipo de error de autorización, no un fallo transitorio de API. Reintentar no sirve de nada; el sistema necesita detectarlo específicamente y pedirle al usuario que reconecte su cuenta. Ahora mismo el único scenario de error cubierto es "la API de Google no está disponible", que es un caso distinto.

**Ajuste 3:** Definir y documentar el comportamiento de reintentos de sincronización (cuántas veces, cada cuánto, y qué pasa si se agotan todos los intentos — si el usuario se entera de que su tarea quedó sin sincronizar o no).
**Motivo:** Tal como está escrito ahora, "el sistema reintenta la sincronización más tarde" no es un criterio verificable. Es justo el comportamiento que el usuario va a vivir cuando algo sale mal, así que no puede quedar abierto.

**Ajuste 4:** Añadir un criterio o story sobre prevención de eventos duplicados cuando una creación tiene éxito en Google pero la respuesta a FlowSync llega con timeout.
**Motivo:** En ese escenario el sistema no sabe si el evento ya se creó y podría reintentar, generando un duplicado visible para el usuario. Es peor que no sincronizar en absoluto, y ningún scenario actual lo contempla.

**Nota — conexión con S5:** viendo estos cuatro ajustes con la perspectiva de la sesión de documentación, me doy cuenta de que no son solo huecos de producto — son decisiones técnicas sin registrar. Cómo se define el tipo de evento (todo el día vs. con horario), la política de reintentos, y qué campo identifica la relación tarea↔evento son exactamente el tipo de decisión que S5 enseña a capturar como ADR en el momento en que se implementen. Si estas decisiones se toman durante el desarrollo sin dejar un registro (contexto, opciones consideradas, por qué se eligió una), se repite el mismo patrón que encontré en la auditoría de la Parte B: la decisión existe en la cabeza de quien la tomó, pero no en un documento consultable.

---

## Parte B — Auditoría de documentación del proyecto

> Repositorio auditado: mi copia de `full-stack-adonisjs-s5-base` (fork del template LIDR-academy). Backend AdonisJS 7 + Lucid + SQLite + VineJS; frontend React 19 + Vite.

### Auditoría por tipo de documentación

| Tipo de documentación | Estado | Observación | Ubicación |
|---|---|---|---|
| README de proyecto | **Completa** | El README raíz permite arrancar el proyecto de cero sin preguntar: requisitos (Node 24+), pasos de backend (`npm install`, `.env`, `generate:key`, migraciones, `npm run dev`) y frontend, tabla de los 7 endpoints reales, y flujo de trabajo con OpenSpec. El backend tiene además su propio README con la estructura de carpetas. Único hueco menor: no explica variable por variable el contenido de `.env.example`. | `README.md` (raíz), `backend/README.md` |
| Descripción de arquitectura general | **Parcial o pobre** | No hay ningún diagrama (C4 o de otro tipo) ni documento dedicado a arquitectura, pese a que `docs/README.md` anuncia que el PRD "genera un diagrama C4" — ese diagrama no está presente en el repo. Lo más parecido es la sección de convenciones en `CLAUDE.md` (controllers/validators/transformers) y el árbol de carpetas del README, que sugieren capas pero no relaciones entre componentes a nivel de sistema. | `CLAUDE.md`, `docs/README.md` (referencia a un diagrama que no existe) |
| Documentación de API / endpoints | **Parcial o pobre** | Hay una tabla de endpoints en el README (método, ruta, auth, descripción) que cubre los 7 endpoints reales — suficiente para una integración básica. Pero no hay spec OpenAPI/Swagger, ni ejemplos de request/response, ni catálogo de códigos de error (`401 E_UNAUTHORIZED_ACCESS`, `404 E_ROW_NOT_FOUND`, `422` de VineJS) fuera de las specs de OpenSpec. No hay endpoint `/docs` ni `/openapi` montado (adonis-autoswagger no está instalado). | `README.md` §"Endpoints del backend" |
| Docstrings y comentarios (TSDoc/JSDoc) | **Parcial o pobre** | Los controllers (`users_controller.ts`, `new_accounts_controller.ts`, `access_tokens_controller.ts`, `profiles_controller.ts`, `health_controller.ts`) tienen un comentario corto de 1-2 líneas por método (ruta HTTP + qué hace), útil pero sin `@param`, `@returns` ni `@throws`. El modelo `user.ts` no tiene ningún comentario, ni siquiera en columnas con nombres poco obvios como `lastSeenAt`. No existe carpeta `app/services/` todavía. | `backend/app/controllers/*.ts` (comentarios mínimos), `backend/app/models/user.ts` (sin comentarios) |
| Decisiones técnicas registradas (ADRs) | **Inexistente** | No existe ninguna carpeta `docs/adr/` ni archivo de tipo ADR/MADR en el repo. `docs/README.md` lo reconoce explícitamente ("ADRs y diagramas de arquitectura se añaden en sesiones posteriores"), así que es una ausencia declarada, no un olvido silencioso. Pero el matiz importante es otro: las decisiones sí existen — SQLite + `better-sqlite3`, VineJS para validación, `@adonisjs/auth` con guard `api` — solo que viven dispersas como prosa en la tabla "Stack" de `CLAUDE.md` y en `docs/PRD.md` §5, sin contexto de alternativas descartadas ni consecuencias. El contenido de la decisión existe; el formato que la haría trazable, no. | `CLAUDE.md` (tabla Stack) y `docs/PRD.md` §5 (decisiones dispersas, no en formato ADR) |
| Guía operacional (deploy, runbooks, troubleshooting) | **Inexistente** | No hay carpeta `.github/` en el repo (sin workflows de CI/CD, sin plantillas de PR/issues), ni ningún documento de despliegue, runbook de incidencias o troubleshooting. El PRD menciona observabilidad de logs de sincronización como requisito no funcional, pero es aspiracional: esa feature (Google Calendar) ni siquiera está implementada en el código actual. | No existe |
| Convenciones de código (CLAUDE.md / AGENTS.md) | **Completa** | `CLAUDE.md` en la raíz es concreto y accionable: stack, comandos de backend/frontend, convenciones reales (lógica en controllers, validación con VineJS, serialización siempre vía `UserTransformer`, imports con subpaths, prefijo `/api/v1`) y una sección "No hacer" con reglas explícitas. Coincide con lo que se ve en el código. Aún no existe `AGENTS.md` — el propio `CLAUDE.md` indica que ese enlace se formaliza en una sesión posterior. | `CLAUDE.md` (raíz) |
| Especificación OpenSpec y trazabilidad con código | **Parcial o pobre — divergencia real detectada** | Existen dos specs (`openspec/specs/authentication/spec.md` y `openspec/specs/users/spec.md`). Los endpoints de `authentication` (register, login, logout, profile) coinciden exactamente con el código. Pero la spec de `users` documenta un requirement completo — "Listado de usuarios activos", `GET /api/v1/users/active` con 3 escenarios — que **no existe en el código**: `users_controller.ts` solo implementa `index` y `show`, y no hay ninguna ruta `/users/active` en `start/routes.ts`. El dato subyacente (`lastSeenAt`) sí existe en el modelo y se actualiza en cada login, así que la spec describe una capability que el dato soporta pero el endpoint no expone. | `openspec/specs/users/spec.md` (requirement "Listado de usuarios activos") vs. `backend/app/controllers/users_controller.ts` y `backend/start/routes.ts` |

### Top 3 carencias que más duelen
1. La divergencia spec ↔ código en `users` es la que más me preocupa: la spec de OpenSpec promete `GET /api/v1/users/active` y el código no lo implementa. Es el tipo de desalineación que rompe la confianza en la spec como fuente de verdad, porque cualquiera que integre contra ella asumiría que ese endpoint existe.
2. No hay nada de documentación de arquitectura, ni un diagrama Mermaid básico ni un `workspace.dsl`. Para un proyecto que va a crecer (auth → tareas → sincronización externa), no tener ninguna vista de componentes hace más difícil el onboarding de cualquier persona nueva. Con un Mermaid embebido en el README (entidades del modelo + secuencia del flujo de auth) se cerraría buena parte de esta carencia, y con costo casi cero.
3. Las decisiones técnicas existen pero no en un formato trazable, y encima no hay ningún CI de documentación: las decisiones de stack están dispersas en prosa (ver fila de ADRs) y no hay `.github/workflows` ni un solo check automático de calidad de código o de documentación. Introducir `log4brains` para pasar esas decisiones a formato MADR, más un workflow simple de `markdownlint-cli2` + `lychee` sobre `docs/` y el README, serían las mejoras de menor esfuerzo y mayor señal para empezar.

### Top 3 cosas que ya están bien
1. El README raíz funciona de verdad: permite levantar el proyecto de cero, backend y frontend, sin tener que preguntarle a nadie. Instrucciones completas y en el orden correcto.
2. `CLAUDE.md` es corto, concreto y accionable. Dice exactamente cómo se estructura el código y qué no hacer, y coincide con lo que hay implementado, que es lo que más valoro de un documento así.
3. Las specs de `authentication` están 100% alineadas con el código real, con escenarios claros de éxito y error. Es el ejemplo a replicar el día que se corrija la spec de `users`.

---

## Paso 7 — Exploración rápida de formatos de documentación

**C4 model:** Aporta algo que las notas sueltas nunca dan por sí solas: una vista jerárquica (Context → Container → Component → Code) que deja claro en qué nivel de zoom se está mirando el sistema, evitando que cualquiera mezcle "quién usa esto" con "qué librería usa este módulo" en el mismo documento.

**ADR (architecture-decision-record):** Lo que aporta frente a un comentario o un hilo de Slack es que fija el contexto y las alternativas descartadas junto a la decisión — así, meses después, alguien puede entender *por qué no* se hizo de otra forma, no solo qué se hizo.

**OpenAPI spec:** A diferencia de una tabla de endpoints en un README, una spec OpenAPI es machine-readable: permite generar clientes, mocks y documentación interactiva (Scalar/Swagger) automáticamente, y detectar divergencias con el código de forma automatizada en vez de manual.
