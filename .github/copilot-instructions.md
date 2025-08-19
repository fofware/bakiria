## Objetivo rápido

Este archivo orienta a agentes de código (Copilot / agentes autónomos) a ser inmediatamente productivos en este mono-repo (frontend Angular + backend Node/TS). Contiene la arquitectura, flujos críticos, convenciones y ejemplos concretos.

## Checklist de lo que debes conocer primero
- Monorepo con al menos dos proyectos importantes:
  - `bakiria-workspace/` — aplicación Angular (frontend). Ver `projects/bk-app/src`.
  - `bk-backend/` — API Node + TypeScript (auth, MongoDB).
- Cómo ejecutar cada parte (comandos y variables de entorno).
- Dónde están las piezas críticas de autenticación: `bk-backend/src/auth/*`.

## Arquitectura (big picture)
- Frontend: Angular CLI app en `bakiria-workspace/` (puerto dev habitual `4200`).
- Backend: Express + Passport en `bk-backend/src/index.ts` + `bk-backend/src/auth/*`.
  - Autenticación soportada: local (email/password), Google, Facebook, JWT.
  - Persistencia: MongoDB con modelos Mongoose en `bk-backend/src/auth/user.ts`.
- Comunicación: frontend consume la API del backend (ej. rutas bajo `/api/` y `/auth/*`).

## Flujos clave y comandos (útiles de inmediato)
- Backend (desde `bk-backend`):

```bash
cd bk-backend
npm install
npm run build   # compila TS -> dist
npm run start   # arranca dist/index.js
npm run watch   # tsc-watch + reinicio automático
```

- Frontend (desde `bakiria-workspace`):

```bash
cd bakiria-workspace
npm install
ng serve        # arranca dev server en http://localhost:4200
```

Nota: los `scripts` del backend están en `bk-backend/package.json` y usan `type: commonjs`.

## Variables de entorno críticas
- Crea `.env` en `bk-backend/` con al menos:
  - `MONGODB_URI` (p.ej. mongodb://localhost:27017/authdb)
  - `JWT_SECRET` (secreto para firmar tokens)
  - `APP_PORT` (p.ej. 3000)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (si usas OAuth)
  - `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL`

Ejemplo mínimo:

```env
MONGODB_URI=mongodb://localhost:27017/authdb
JWT_SECRET=change_me_now
APP_PORT=3000
```

## Patrones y convenciones específicas del proyecto
- Autenticación y rutas:
  - Rutas principales: `bk-backend/src/auth/routes.ts`. Ejemplos: `/register`, `/login`, `/auth/google`, `/profile`, `/logged`.
  - Token JWT: producido por `genToken` en `routes.ts` y validado por `passport-jwt` en `passport.ts`.
  - Passport strategies declaradas en `bk-backend/src/auth/passport.ts`.
- Modelos:
  - Usuario: `AuthUser` en `bk-backend/src/auth/user.ts` (campo `providers` para múltiples proveedoressociales).
  - Proveedor externo: `AuthProvider` almacena datos por proveedor.
- Convención: muchas funciones usan `findOrCreateUser(...)` (ver `user.ts`) para unificar creación/actualización de usuarios sociales y locales.

## Integraciones y puntos de atención
- MongoDB: la app se conecta en `bk-backend/src/index.ts` usando `MONGODB_URI`.
- OAuth: Google y Facebook redirigen a `http://localhost:4200/auth/login?token=...` por defecto — esto es útil para pruebas pero inseguro en producción (evitar pasar tokens en URL en producción).
- Dependencias a vigilar: `passport-*`, `mongoose`, `jsonwebtoken`, `bcryptjs`.

## Ejemplos concretos a usar como referencia
- Generar token de login: ver `bk-backend/src/auth/routes.ts` — función `genToken`.
- Estrategia JWT: ver `bk-backend/src/auth/passport.ts` — usa `ExtractJwt.fromAuthHeaderAsBearerToken()`.
- Creación de usuarios sociales y locales: `bk-backend/src/auth/user.ts` (`findOrCreateUser`).

## Qué evitar / notas de seguridad
- Evitar dejar `JWT_SECRET` por defecto en producción.
- Evitar pasar tokens por query string en producción. Usa postMessage, cookies seguras o páginas intermedias.

## Qué buscar cuando modifiques código
- Si tocas auth: actualiza tests o manualmente verifica `/profile` y `/logged` rutas.
- Si cambias modelos Mongoose: revisa `strict: false` en esquemas (esto permite campos adicionales; los cambios de esquema son menos restrictivos aquí).

## Dónde abrir PRs y convenciones de commit
- No hay convención estricta en repo; prefieren PRs en `master`. Mantén commits pequeños, con referencia a la tarea.

## Preguntas que deberías hacer al humano si algo no está claro
- ¿Quieres que la app use un proxy CORS específico para el frontend en desarrollo?
- ¿Necesitamos revocar tokens o implementar refresh tokens (actualmente el backend proporciona sólo token de expiración simple)?

---
Si quieres, puedo ajustar el tono (más técnico o más resumido) o añadir secciones automáticas (ej. cómo agregar tests unitarios para `user.ts`). ¿Qué quieres que mejore o detalle ahora?
