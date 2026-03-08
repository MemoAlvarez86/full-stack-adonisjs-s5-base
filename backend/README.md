# backend — AdonisJS 7 API

API JSON con autenticación por access tokens.

## Stack

- AdonisJS 7 (TypeScript) · api starter kit
- Lucid ORM + SQLite (`better-sqlite3`)
- VineJS (validación)
- `@adonisjs/auth` · guard `api` (access tokens)

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor con HMR (`:3333`) |
| `npm run migration:run` | Aplica migraciones pendientes |
| `npm run migration:fresh` | Recrea la BD desde cero |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Suite de tests (Japa) |
| `node ace list:routes` | Inspecciona las rutas |

## Estructura

```
app/
├── controllers/   NewAccounts, AccessTokens, Profiles, Users, Health
├── models/        User (withAuthFinder + DbAccessTokensProvider)
├── validators/    signup / login (VineJS)
├── transformers/  UserTransformer (shape de salida)
└── middleware/    auth_middleware
config/            auth, database, encryption, ...
database/migrations/  users + auth_access_tokens
start/routes.ts    cableado de rutas (sin lógica de negocio)
```

## Convenciones

- La lógica vive en **controllers**, no en `start/routes.ts`.
- Input validado **siempre** con VineJS; salida serializada **siempre** vía transformer.
- Subpath imports (`#controllers/*`, `#models/*`, …).
