# users Specification

## Purpose

Consulta del directorio de usuarios de FlowSync. Todos los endpoints cuelgan de
`/api/v1/users`, requieren un Bearer token válido (guard `api`) y serializan la salida
con `UserTransformer` (nunca exponen el `password`).

Esta spec documenta el comportamiento **ya implementado** en `users_controller.ts`.

## Requirements

### Requirement: Listado de usuarios

El sistema SHALL exponer `GET /api/v1/users`, que devuelve todos los usuarios ordenados
por `created_at` de forma descendente. Este endpoint SHALL requerir un Bearer token
válido y SHALL envolver el resultado en `{ users }`.

#### Scenario: Listado autenticado

- **WHEN** un usuario autenticado consulta `GET /api/v1/users`
- **THEN** el sistema responde `200` con `{ users }` ordenados por `created_at` descendente
- **AND** cada usuario se serializa sin `password`

#### Scenario: Listado sin autenticación

- **WHEN** se consulta `GET /api/v1/users` sin token o con un token inválido
- **THEN** el sistema responde `401` (E_UNAUTHORIZED_ACCESS)

### Requirement: Consulta de usuario por id

El sistema SHALL exponer `GET /api/v1/users/:id`, que devuelve un único usuario por su
identificador. Este endpoint SHALL requerir un Bearer token válido y SHALL envolver el
resultado en `{ user }`.

#### Scenario: Usuario existente

- **WHEN** un usuario autenticado consulta `GET /api/v1/users/:id` con un id existente
- **THEN** el sistema responde `200` con `{ user }` serializado sin `password`

#### Scenario: Usuario inexistente

- **WHEN** un usuario autenticado consulta `GET /api/v1/users/:id` con un id que no existe
- **THEN** el sistema responde `404` (E_ROW_NOT_FOUND)

#### Scenario: Consulta sin autenticación

- **WHEN** se consulta `GET /api/v1/users/:id` sin token o con un token inválido
- **THEN** el sistema responde `401` (E_UNAUTHORIZED_ACCESS)
