# authentication Specification

## Purpose

Autenticación y gestión de cuenta de FlowSync (cubre el PRD §3.1). Cada usuario tiene
una cuenta propia y sus datos nunca son visibles para otro. La sesión se sostiene con
access tokens (prefijo `oat_`, guard `api` de `@adonisjs/auth`). La entrada se valida con
VineJS y la salida se serializa con `UserTransformer` (el `password` nunca se expone).

Esta spec documenta el comportamiento **ya implementado** en el backend:
`new_accounts_controller.ts`, `access_tokens_controller.ts`, `profiles_controller.ts` y
`validators/auth.ts`, bajo el prefijo `/api/v1`.

## Requirements

### Requirement: Registro de cuenta

El sistema SHALL permitir a un visitante crear una cuenta mediante
`POST /api/v1/account/register` con `email` y `password` (y `fullName` opcional),
validando la entrada con VineJS, y SHALL responder `201 Created` con el usuario creado y
un access token.

- El `email` SHALL ser único, normalizado (`normalizeEmail`) y con formato válido.
- El `password` SHALL tener entre 8 y 180 caracteres y almacenarse hasheado (scrypt).
- El `fullName` es opcional; si se envía, SHALL tener entre 2 y 100 caracteres.
- La respuesta SHALL tener la forma `{ user, token }`, donde `token` es el access token
  `oat_*` (se muestra una sola vez) y `user` se serializa sin `password`.

#### Scenario: Registro correcto

- **WHEN** un visitante envía `POST /api/v1/account/register` con un email no registrado y una password válida (≥ 8 caracteres)
- **THEN** el sistema crea el usuario, emite un access token
- **AND** responde `201` con `{ user, token }` sin exponer el `password`

#### Scenario: Email ya registrado

- **WHEN** un visitante se registra con un email que ya existe en la tabla `users`
- **THEN** el sistema rechaza la petición con `422 Unprocessable Entity`
- **AND** no crea un segundo usuario con ese email

#### Scenario: Password demasiado corta

- **WHEN** un visitante se registra con una password de menos de 8 caracteres
- **THEN** el sistema responde `422` con un error de validación
- **AND** no crea la cuenta

#### Scenario: Email con formato inválido

- **WHEN** un visitante se registra con un email mal formado
- **THEN** el sistema responde `422` con un error de validación

### Requirement: Inicio de sesión

El sistema SHALL permitir a un usuario registrado iniciar sesión mediante
`POST /api/v1/account/login` con `email` y `password`, verificando las credenciales, y
SHALL emitir un nuevo access token y actualizar la marca de última actividad.

- Al autenticarse con éxito, el sistema SHALL actualizar `last_seen_at` del usuario.
- La respuesta SHALL tener la forma `{ user, token }`.

#### Scenario: Login correcto

- **WHEN** un usuario envía `POST /api/v1/account/login` con credenciales válidas
- **THEN** el sistema verifica las credenciales, actualiza `last_seen_at`
- **AND** responde `200` con `{ user, token }`

#### Scenario: Credenciales inválidas

- **WHEN** un usuario envía un email o password incorrectos
- **THEN** el sistema responde `400` (E_INVALID_CREDENTIALS)
- **AND** no emite ningún token

#### Scenario: Payload de login inválido

- **WHEN** la petición de login omite el email o lo envía con formato inválido
- **THEN** el sistema responde `422` con un error de validación

### Requirement: Cierre de sesión

El sistema SHALL permitir a un usuario autenticado cerrar sesión mediante
`POST /api/v1/account/logout`, revocando el access token con el que se autenticó la
petición. Este endpoint SHALL requerir un Bearer token válido.

#### Scenario: Logout autenticado

- **WHEN** un usuario autenticado envía `POST /api/v1/account/logout` con su Bearer token
- **THEN** el sistema revoca el token actual
- **AND** responde `200` con `{ revoked: true }`

#### Scenario: Logout sin autenticación

- **WHEN** se envía `POST /api/v1/account/logout` sin token o con un token inválido
- **THEN** el sistema responde `401` (E_UNAUTHORIZED_ACCESS)

### Requirement: Perfil del usuario autenticado

El sistema SHALL exponer `GET /api/v1/account/profile`, que devuelve el usuario asociado
al access token de la petición. Este endpoint SHALL requerir un Bearer token válido.

#### Scenario: Perfil autenticado

- **WHEN** un usuario autenticado consulta `GET /api/v1/account/profile`
- **THEN** el sistema responde `200` con `{ user }` serializado sin `password`

#### Scenario: Perfil sin autenticación

- **WHEN** se consulta `GET /api/v1/account/profile` sin token o con un token inválido
- **THEN** el sistema responde `401` (E_UNAUTHORIZED_ACCESS)
