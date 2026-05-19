# POS System — Refactoring Plan

**Audited:** 2026-04-11  
**Stack:** Next.js 15, React 19, Prisma, PostgreSQL, Zod, SWR, TypeScript  
**Total issues found:** ~50 | Critical: 3 | Major: 27 | Moderate: 15

---

## Issue Summary

| Category | Severity | Count |
|---|---|---|
| Security | Critical | 3 |
| Type Safety | Major | 15+ |
| API Consistency | Major | 12 |
| Error Handling | Major | 8 |
| Validation | Moderate | 6 |
| Code Quality | Moderate | 8 |
| Performance | Moderate | 3 |

---

## Phase 1 — Critical Fixes (Do First)

### 1.1 Add Authentication & Authorization

**Problem:** Every API route and page is publicly accessible. No user identity, no roles, no session.

**What to do:**
- Install `next-auth` (or `better-auth`) and configure a provider (credentials + JWT is fine to start)
- Create an auth middleware in `middleware.ts` at the project root to protect all `/api/*` and dashboard routes
- Define roles: `ADMIN`, `CASHIER` — store on the User model in Prisma
- Wrap protected API routes with a role check helper

```ts
// src/lib/auth.ts — example guard
export async function requireRole(req: Request, role: Role) {
  const session = await getServerSession();
  if (!session || session.user.role !== role) {
    return failure("UNAUTHORIZED", "Forbidden", 403);
  }
}
```

**Files to create/modify:**
- `middleware.ts` (new)
- `prisma/schema.prisma` — add `User` model with `role` field
- `src/lib/auth.ts` (new)
- All `src/app/api/**/route.ts` files

---

### 1.2 Fix `await params` in All Dynamic Routes

**Problem:** Next.js 15 requires `params` to be awaited in route handlers. Only `inventory-logs/[id]/route.ts` does this correctly. All other dynamic routes access `params.id` directly, which causes runtime warnings and will break.

**Affected files:**
- `src/app/api/categories/[id]/route.ts`
- `src/app/api/menu-items/[id]/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/order-items/[id]/route.ts`
- `src/app/api/payments/[id]/route.ts`

**Fix pattern:**
```ts
// BEFORE (wrong)
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

// AFTER (correct)
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
```

---

### 1.3 Remove `console.log` from `fetcher.ts`

**Problem:** `src/lib/fetcher.ts` logs every API response to the console. This exposes order data, prices, and customer info in browser DevTools and server logs.

**Fix:** Delete the `console.log` line entirely. SWR handles error states — logging raw responses is not needed.

---

## Phase 2 — API Consistency

### 2.1 Standardize All API Responses

**Problem:** Some routes use the `success()` / `failure()` helpers from `src/lib/apiResponse.ts`. Others return raw `NextResponse.json()`. This means the frontend has to handle two different shapes.

**Standard shape (already defined — use it everywhere):**
```ts
// Success
{ ok: true, data: T }

// Failure
{ ok: false, error: { code: string, message: string, details?: unknown } }
```

**Routes to migrate to the standard helpers:**
- `src/app/api/order-items/route.ts`
- `src/app/api/order-items/[id]/route.ts`
- `src/app/api/payments/route.ts`
- `src/app/api/payments/[id]/route.ts`
- `src/app/api/orders/[id]/route.ts` (returns raw `NextResponse.json` currently)

**Rule:** Every route must use `success()` or `failure()`. No raw `NextResponse.json()`.

---

### 2.2 Add `try/catch` to Every Route Handler

**Problem:** `src/app/api/orders/[id]/route.ts` has no try/catch. A DB failure will throw an unhandled exception and crash the handler with a 500 and no useful response body.

**Pattern to apply to every handler:**
```ts
export async function GET(_: Request, { params }: ...) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (isNaN(id)) return failure("INVALID_ID", "ID must be a number", 400);

    const record = await db.something.findUnique({ where: { id } });
    if (!record) return failure("NOT_FOUND", "Record not found", 404);

    return success(record);
  } catch (error) {
    return handlePrismaError(error);
  }
}
```

**Add `isNaN` guard to:**
- `src/app/api/categories/[id]/route.ts` (missing)
- `src/app/api/orders/[id]/route.ts` (missing)
- `src/app/api/order-items/[id]/route.ts` (missing)
- `src/app/api/payments/[id]/route.ts` (missing)

---

## Phase 3 — Type Safety

### 3.1 Eliminate All `any` Types

**Problem:** Multiple components use `any` for props and state, defeating TypeScript entirely.

**Files and fixes:**

| File | Location | Replace `any` with |
|---|---|---|
| `src/components/NewOrderPopup.tsx` | `onSubmit: (payload: any)` | `onSubmit: (payload: CreateOrderPayload) => Promise<HookResult>` |
| `src/components/NewOrderPopup.tsx` | `item: any`, `cat: any` in `.map()` | `MenuItem`, `Category` from `src/types` |
| `src/components/InvLogPopup.tsx` | `onSubmit: (payload: any)` | `onSubmit: (payload: CreateInventoryLogInput) => Promise<HookResult>` |
| `src/components/InvLogPopup.tsx` | `initialData?: any` | `initialData?: InventoryLog` |
| `src/app/debug/categories/CategorySection.tsx` | `useState<any>(null)` | `useState<Category \| null>(null)` |
| `src/app/categories/page.tsx` | `cat: any` in `.map()` | `Category` |

**Action:** Define all missing input types in `src/types/index.ts` (e.g. `CreateOrderPayload`, `CreateInventoryLogInput`).

---

### 3.2 Add Return Types to Hook Functions

**Problem:** Hook functions like `createOrderItem` in `useOrderItems.ts` have inferred return types. Explicit `Promise<HookResult>` annotations make the contract clear and catch type errors early.

```ts
// BEFORE
const createOrderItem = async (values: unknown) => {

// AFTER
const createOrderItem = async (values: unknown): Promise<HookResult> => {
```

**Affected hooks:**
- `src/hooks/useOrderItems.ts`
- `src/hooks/usePayments.ts`

---

## Phase 4 — Validation & Error Handling in Hooks

### 4.1 Replace `.parse()` with `.safeParse()` in All Hooks

**Problem:** `useOrderItems.ts` and `usePayments.ts` use `schema.parse(values)`, which **throws** on invalid input. If that exception isn't caught by the caller, the app crashes silently. `useCategories.ts` already does this correctly with `.safeParse()`.

**Fix:**
```ts
// BEFORE (throws)
const parsed = orderItemSchema.parse(values);

// AFTER (safe)
const parsed = orderItemSchema.safeParse(values);
if (!parsed.success) {
  return { ok: false, error: parsed.error.flatten().fieldErrors };
}
```

**Affected:**
- `src/hooks/useOrderItems.ts`
- `src/hooks/usePayments.ts`

---

### 4.2 Add Missing `Content-Type` Headers to Fetch Calls

**Problem:** POST requests in `useOrderItems.ts` and `usePayments.ts` send a JSON body without `Content-Type: application/json`. Some servers and middleware will reject or misparse this.

```ts
// BEFORE
const res = await fetch(BASE_URL, { method: "POST", body: JSON.stringify(parsed) });

// AFTER
const res = await fetch(BASE_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(parsed.data),
});
```

---

### 4.3 Replace `alert()` with `toast()` in UI Components

**Problem:** `src/app/categories/page.tsx` uses `alert(error)` for error display. This blocks the UI thread, looks unprofessional, and logs the raw error object as `[object Object]`. The project already has `react-hot-toast` installed.

**Fix:** Replace every `alert(...)` call with `toast.error(...)`.

---

## Phase 5 — Code Quality

### 5.1 Fix the `ZBcart` Typo

**Problem:** `src/components/NewOrderPopup.tsx` line 27:
```ts
const [cart, ZBcart] = useState<Record<number, CartItem>>({});
```
`ZBcart` is obviously meant to be `setCart`. This is a naming error that makes the code unreadable.

**Fix:** Rename `ZBcart` → `setCart` everywhere in the file.

---

### 5.2 Strengthen Validation Schemas

**Problem:** `menuItemSchema` in `src/lib/validation.ts` is weaker than `categorySchema`. No max lengths, no upper bounds on price, no custom error messages.

```ts
// BEFORE
export const menuItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  categoryId: z.number().int(),
});

// AFTER
export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  price: z.number().positive("Price must be positive").max(99999, "Price too high"),
  categoryId: z.number().int("Category ID must be an integer").positive(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
});
```

Apply the same rigor to all other schemas in `validation.ts`.

---

### 5.3 Protect or Remove the `/debug` Route

**Problem:** `/debug` is linked in the main nav (`src/app/layout.tsx`) and provides full CRUD access to all entities with no auth check.

**Options (pick one):**
1. **Short term:** Add an environment check — render the nav link and allow access only when `NODE_ENV === "development"`
2. **Long term:** Remove the route entirely once the main UI supports all operations

```ts
// layout.tsx — hide link in production
{process.env.NODE_ENV === "development" && (
  <li><a href="/debug">Debug</a></li>
)}
```

Also add a guard at the top of `src/app/debug/page.tsx`:
```ts
if (process.env.NODE_ENV !== "development") redirect("/");
```

---

### 5.4 Clean Up Commented-Out Code

**Problem:** `src/app/debug/page.tsx` has a commented-out import:
```ts
// import PaymentSection from "./payments/PaymentSection";
```

The file it references (`PaymentSection.tsx`) does not exist. Either implement it or remove the comment.

**Rule:** Do not leave dead imports or commented-out code in the repo. Use git history to recover deleted code if needed.

---

## Phase 6 — Validation Schema Completeness

### 6.1 Add Business Rule Validation

**Problem:** The application has no enforcement of business rules at the API level.

**What to add:**

| Rule | Where to enforce |
|---|---|
| Payment amount must match order total | `src/app/api/payments/route.ts` POST handler |
| Order can only be CANCELLED if it is PENDING | `src/app/api/orders/[id]/route.ts` PATCH handler |
| Cannot add items to a COMPLETED or CANCELLED order | `src/app/api/order-items/route.ts` POST handler |
| Inventory stock cannot go below 0 | `src/app/api/inventory-logs/route.ts` POST handler |

---

## Phase 7 — Configuration & Housekeeping

### 7.1 Add Security Headers to `next.config.ts`

**Problem:** `next.config.ts` is empty. Next.js ships no security headers by default.

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

---

### 7.2 Add `.env.example`

**Problem:** `.env` contains a real database password. It is unclear what variables are required when setting up the project fresh.

**Fix:**
1. Create `.env.example` with placeholder values:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/pos-system"
NEXTAUTH_SECRET="replace-with-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```
2. Confirm `.env` is in `.gitignore` (it should already be, but verify).

---

### 7.3 Fix Misleading Comment in `schema.prisma`

**Problem:** The datasource block has a comment `// or "mysql"` which is misleading — the seed file and some queries use PostgreSQL-specific behavior.

**Fix:** Remove the comment.

---

## Execution Order

```
Phase 1 — Critical        (Security + params bug)
Phase 2 — API Consistency (Standardize responses + try/catch)
Phase 3 — Type Safety     (Remove any, add return types)
Phase 4 — Hooks           (safeParse, Content-Type, alert→toast)
Phase 5 — Code Quality    (typo, schema strength, debug route, dead code)
Phase 6 — Business Rules  (API-level rule enforcement)
Phase 7 — Config          (Security headers, .env.example)
```

Phases 1–4 should be done before any new feature work. Phases 5–7 can run in parallel with features.
