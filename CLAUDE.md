# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent npm projects, no workspace/monorepo tooling — run commands from inside each directory.

- `hostle_backend/` — Express 5 + Mongoose REST API (ESM, `"type": "module"`, so **all relative imports need the `.js` extension**).
- `hostle_web/` — Next.js 16 App Router frontend (JS, not TS). An admin dashboard is being built; it is **not yet wired to the backend** — the only network call in `src/` is a direct browser upload to Cloudinary.

## Commands

```bash
# backend (hostle_backend/)
npm start          # nodemon index.js — needs a local mongod on 127.0.0.1:27017
                   # no test/lint script is configured ("npm test" intentionally exits 1)

# frontend (hostle_web/)
npm run dev        # next dev (turbopack is the Next 16 default)
npm run build
npm run lint       # eslint (flat config, eslint-config-next core-web-vitals)
```

There are no tests in either project.

Backend env comes from `hostle_backend/.env` (loaded via `import "dotenv/config"`): `PORT_NUMBER`, `JWT_SECREATE_KEY` (note the spelling — it is used verbatim in [jwtHelper.js](hostle_backend/common/helper/jwtHelper.js)), `USER_EMAIL`/`USER_EMAIL_PASS` for Gmail SMTP, and `CLOUDINARY_*`. The MongoDB URI is **hardcoded** in [config/db.js](hostle_backend/config/db.js), not env-driven.

Frontend env (`hostle_web/.env`): `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (unsigned preset — the browser uploads straight to Cloudinary), and `NEXT_PUBLIC_ENABLE_LOGS` which gates every `logger.*` call.

## Backend architecture

Request flow: `index.js` → `routes/index.js` → per-audience router → `verifyToken` → `validateRequest` → controller → `successHelper`/`errorHelper`.

**Routing** is mounted by audience under two prefixes in [routes/index.js](hostle_backend/routes/index.js): `/user/v1` and `/admin/v1`. Each audience has an `index.js` that mounts feature routers — admin gets `/auth`, `/invite`, `/menu`; user gets `/auth` and `/menu` (the latter being the like/comment router, [likeDislike.route.js](hostle_backend/routes/user/likeDislike.route.js)).

**Conventions that repeat everywhere — follow them when adding code:**

- *Directory naming*: Mongoose models live in `modal/` (not `models/`), grouped by audience (`modal/userModal/`, `modal/adminModal/`, `modal/menu/`). Controllers mirror that under `controller/`.
- *Validation*: every Zod schema module exports a **selector function**, e.g. `menuValidate("addMenuRule")` / `userRegisterValidate("registerRule")`, which indexes into an internal `allSchema` map. Routes call it inline: `validateRequest({ body: menuValidate("addMenuRule") })`. Reusable field-level primitives (email, password, phone, price, image, description) live in [_commonSchema.js](hostle_backend/common/validationSchema/_commonSchema.js); Mongo id validators in [mongoIdSchema.js](hostle_backend/common/validationSchema/mongoIdSchema/mongoIdSchema.js).
- *Validated data location*: [validateRequest](hostle_backend/middleware/validateRequest.js) writes parsed output back onto `req[source]` **except for `query`**, which is getter-only in Express 5. Query params must be read as `req.validated?.query ?? req.query` — see `deleteMenu`.
- *Auth*: [verifyToken](hostle_backend/middleware/verifyToken.js) reads a `Bearer` token, and because `jwtConvert` signs `{ data: payload }`, it sets `req.user = decoded.data`. Controllers destructure `const { _id: createdBy } = req.user`. `jwtVerify` does not throw — it returns `{ status: 401, ... }` on failure.
- *Responses*: never `res.json` directly. Use `successHelper(res, message, status, data)` and `errorHelper(res, { status, message })` from [globalHelper.js](hostle_backend/common/helper/globalHelper.js), with strings from `common/static/messageStatic.js` and codes from `common/static/statusCodeVar.js`. Controllers wrap everything in try/catch and fall back to `SERVER_ERROR`.
- *Password hashing* happens in the model `pre("save")` hook (both `userModal` and `adminAuth`); controllers pass the plaintext straight through and use `bcryptCompare` only on login.

**Domain model.** A `Menu` ([hostleMenu.js](hostle_backend/modal/menu/hostleMenu.js)) is a discriminated document: `type: "WEEKLY"` keys off `day`, `type: "SPECIAL"` keys off `date`. The Zod side mirrors this with a `z.discriminatedUnion("type", [...])`, and `addMenu` upserts on `{type, day}` or `{type, date}` accordingly. Each menu embeds `breakfast`/`lunch`/`dinner` meals, each containing an array of `foods`, each with an `images` array. Updates and deletes into those nested arrays are done with positional `arrayFilters` (`food._id`, `imageObj._id`) built dynamically in `updateMenu`/`deleteMenu` — that pattern is the core complexity of the menu controller. All menu queries are scoped by `createdBy` (the admin from the JWT).

**Likes and comments target a subdocument, not a collection.** Foods are embedded, so there is no `Food` model and `populate()` can never resolve one. [likeMenu.js](hostle_backend/modal/menu/likeMenu.js) and [commentsMenu.js](hostle_backend/modal/menu/commentsMenu.js) therefore address a food by the **three-part path `{ menu, mealType, food }`** — `mealType` is the literal field name (`"breakfast" | "lunch" | "dinner"`), and `food` is the subdocument `_id`. Both models carry long header comments explaining the indexes; read those before changing them.

[likeCommentC.js](hostle_backend/controller/menuController/likeCommentC.js) keeps **denormalised counters** on the food subdocument (`likeCount`, `commentCount`) in sync with every write to those collections, using the same `arrayFilters: [{ "food._id": food }]` positional-update pattern as the menu controller. A like is a toggle: `deleteOne` first, and if nothing was deleted, create. Comments are one level deep (`parent` is null or a root comment id) and soft-deleted via `isDeleted`.

**User onboarding is invite-only**: an admin POSTs to `/admin/v1/invite/send-email-register`, which signs a 24h JWT, stores an `Inviteuser` row, and emails a link to `http://localhost:3000/hostle-mgmt/register?token=…`. The user then calls `/user/v1/auth/register-via-invite` with that token; `registerApi` verifies an unused invite exists for the email and marks it `isUsed`.

## Frontend architecture

`hostle_web/CLAUDE.md` imports `AGENTS.md`, which is generated by `next dev` and instructs reading `node_modules/next/dist/docs/` before writing Next.js code — this Next version differs from older conventions. `@/*` maps to `./src/*`. React Compiler is enabled in `next.config.mjs`.

**Directory casing matters**: shared components live in `src/Components/` (capital C) and are imported as `@/Components/form`. Files mix `.js` and `.jsx` freely.

**Forms are the centre of gravity.** The stack is react-hook-form + `zodResolver` + Zod v4, and it is layered:

1. [src/Components/form/index.jsx](hostle_web/src/Components/form/index.jsx) — presentational, RHF-agnostic primitives (`Input`, `Select`, `TextArea`, `DatePicker`, `CommonSelect`, `Button`, `LoadingButton`, `SwitchButton`, `Search`, `RatingStar`). All are `forwardRef` so `{...register("field")}` works directly, and they take `label` / `error` / `required` props. Styling uses Bootstrap class names (`form-control`, `is-invalid`, `invalid-feedback`, `required`, `text-danger`) but **Bootstrap's stylesheet is never loaded** — only `react-bootstrap`'s components are. Every one of those classes has to be hand-defined in [form.scss](hostle_web/src/Components/form/form.scss), so a Bootstrap class that "should just work" renders as nothing. Note `.form-control` in particular is still a no-op: `.input` and `.multi-select` each draw their own box, and the two are kept visually in sync by hand.
2. `src/Components/RHFHelperComponent/` — `Controller`-wrapped versions for fields RHF can't `register` directly. Each file's header comment states its contract; the meaningful axis between the image uploaders is **what ends up in form state**: `RHFImgUpload` keeps raw `File` objects (for multipart submit), while the `*Live` / `RHFCloudinaryUpload` variants upload on select and store URLs. [RHFCloudinaryUpload](hostle_web/src/Components/RHFHelperComponent/RHFImages/RHFCloudinaryUpload.jsx) is the one actually in use — it POSTs each file to `https://api.cloudinary.com/v1_1/<cloud>/image/upload` with the unsigned preset and mirrors `[{ url }]` back into the field.
3. [src/utils/SchemaValidations/commonSchema/_commonSchema.js](hostle_web/src/utils/SchemaValidations/commonSchema/_commonSchema.js) — the frontend's schema library. Note it does **not** use the backend's selector-function pattern; it exports each schema as a named const (`emailSchema()`, `nameSchemaFun("Food name")`, `addMenuRule`, …). Field-level helpers come in a plain and a `…Fun(label)` flavour so messages can be relabelled.

`addMenuRule` here is a hand-maintained **mirror of the backend's menu discriminated union**, down to the `.strict()` and the `WEEKLY`/`SPECIAL` split — change one and change the other. The add-menu page ([dashboard/menu/add/page.jsx](hostle_web/src/app/dashboard/menu/add/page.jsx)) shows the intended composition: a tab switch drives the `type` discriminant, and `useFieldArray` on `${mealType}.foods` renders the nested food rows.

**Cross-cutting utils**: use `toastMessage(msg, "success" | "error" | "warning" | "info", id)` from [toastMessage.js](hostle_web/src/utils/toastMessage.js) rather than `toast` directly, and `logger.*` from [logger.js](hostle_web/src/utils/logger.js) rather than `console.*` — logger is a no-op unless `NEXT_PUBLIC_ENABLE_LOGS === "true"`.

**Layout and styling.** `/dashboard/*` renders inside `DashboardShell` (sidebar + `<main>`); nav items are data-driven from [sidebarData.js](hostle_web/src/app/dashboard/Sidebar/sidebarData.js) — add a route by appending `{ label, icon, path }` there. SCSS is global-first: [globals.scss](hostle_web/src/app/globals.scss) `@use`s `src/scss/{mixin,style,typography,variables}.scss`, and components either import a plain `.scss` (global classes, snake_case) or a `.module.scss` — both patterns are in use. Breakpoints go through the `break-point($point)` mixin with named sizes (`mobile`, `tablet`, `desktop`, …), and colours through the `$*-color` variables; don't hardcode either.

## Known rough edges

Be aware of these when touching nearby code; fix only if the task calls for it.

- **`hostle_web/.next/` build output is committed** (~47 tracked files), and there is a stray nested `hostle_web/hostle_web/.next/` directory. `hostle_web/.gitignore` does list `/.next/`, so these were added before it took effect. Avoid `git add -A` from the repo root.
- The repo root and `hostle_backend/` have no `.gitignore`, and `hostle_backend/.env` is committed.
- [userMenuC.js](hostle_backend/controller/userMenuController/userMenuC.js) is a copy of `getAllMenu` that is not wired into any route and has broken imports (missing `.js` extension, missing `getDay`/helper imports).
- The food subdocument has an `isLiked` boolean that `likeController` sets from the request body — it is a single global flag on the food, not per-user, so it reflects whoever liked last. Per-user like state has to come from the `Likes` collection (which is what its header comment says).
- `menuRouter` applies `verifyToken` at the router level *and* again on `GET /get`; `menu.route.js` and `menuSchema/index.js` also carry an unused import of `deleteMenu`.
- `hostle_backend/services/` and `hostle_backend/view/` are empty.
- [RHFImgUploadWithCropper.jsx](hostle_web/src/Components/RHFHelperComponent/RHFImages/RHFImgUploadWithCropper.jsx) will not build if imported: `react-cropper`/`cropperjs` are not installed, and it imports `@/component/form` (lowercase `c`, wrong path). Nothing imports it today.
- `sonner` is installed and `toastMessage` calls it, but no `<Toaster />` is mounted in any layout, so toasts don't render yet — including the success toast the add-menu form fires on submit.
- `src/app/layout.js` still carries the `create-next-app` metadata (`title: "Create Next App"`), and `src/assets/icons/` is a large carried-over icon set from an e-commerce project — most of it is unrelated to this app.
