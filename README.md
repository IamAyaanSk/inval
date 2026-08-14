# Inval — Multi-Rate Pricing & Document Calculator

Inval is a full-stack web application designed for creating, calculating, and managing quotes and billing documents. It provides precise server-side line-item rate calculations, per-line mixed discounts and tax rules, strict document lifecycle immutability, and date-range summary reports.

---

## Tech Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Node.js](https://nodejs.org/)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query) (React Query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Validation**: [Zod v4](https://zod.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with Zod resolvers
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)

> **Authentication Choice & Trade-offs**:  
> I used **Better Auth** to ensure maximum security, velocity, and production-grade session management for this assignment.
>
> If I were to implement authentication **from scratch**, here is how I would structure it in a simplified manner:
>
> ```typescript
> // 1. Sign-Up Route Handler (Simplified)
> export async function POST(req: Request) {
>   const body = await req.json();
>   const { email, name, password } = signUpSchema.parse(body);
>
>   const existingUser = await db.user.findUnique({ where: { email } });
>   if (existingUser) {
>     return NextResponse.json({ error: "User already exists" }, { status: 400 });
>   }
>
> const hashedPassword = await bcrypt.hash(password, 10);
> const user = await db.user.create({
> data: { email, name, password: hashedPassword }
> });
>
> return NextResponse.json({ success: true, userId: user.id });
> }
>
> // 2. Sign-In Route Handler (Simplified)
> export async function POST(req: Request) {
> const body = await req.json();
> const { email, password } = signInSchema.parse(body);
>
> const user = await db.user.findUnique({ where: { email } });
> if (!user || !(await bcrypt.compare(password, user.password))) {
> return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
> }
>
> const session = await db.session.create({
> data: { userId: user.id, expiresAt: new Date(Date.now() + 7 \* 86400000) }
> });
>
> const response = NextResponse.json({ success: true });
> response.cookies.set("session_id", session.id, {
> httpOnly: true,
> secure: process.env.NODE_ENV === "production",
> });
>
> return response;
> }
>
> // Then simply read cookie and validate from db
> ```

Just used better-auth to create a better auth for this assignment 😛

---

## Local Setup & Installation

### Prerequisites

- Node.js `^20.0.0` or higher
- `pnpm` (or `npm`/`yarn`)
- PostgreSQL database instance (local or hosted like Neon (This example uses neon adapter to instanciate prisma client, you may need to change that if you change db provider))

### Step-by-Step Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/IamAyaanSk/inval.git
   cd inval
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the project root:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/inval"
   BETTER_AUTH_SECRET="your-super-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Database Setup & Migrations**

   ```bash
   pnpm prisma:push
   ```

5. **Run the Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Run Unit Tests**

   ```bash
   pnpm test
   ```

7. **Production Build & Start**
   ```bash
   pnpm build
   pnpm start
   ```

---

## Rounding Policy & Calculation Module

All money computations are performed strictly **server-side** in `src/lib/rate-calculator.ts` using `Prisma.Decimal` to prevent floating-point representation drift. [Prisma.Decimal](https://www.prisma.io/docs/orm/v6/prisma-client/special-fields-and-types#working-with-decimal) uses [Decimal.js](https://mikemcl.github.io/decimal.js/) internally which is a popular library to carry out decimal arithmetic operations (and yes, i even added unit test for the same).

### Calculation Sequence (Per Line Item)

1. **Line Subtotal**: `quantity * unitPrice`
2. **Apply Discount**:
   - **Percentage**: `subtotal * (discount / 100)`
   - **Fixed Amount**: `discount` (validated so `discount <= subtotal`)
3. **After Discount Amount**: `subtotal - discountAmount`
4. **Apply Tax**: `afterDiscount * (taxPercentage / 100)` (tax is applied to the discounted amount, not the raw subtotal)
5. **Line Total**: `afterDiscount + taxAmount`
6. **Rounding Rule**: Each step rounds to **2 decimal places** using Decimal.js `toDecimalPlaces(2)` method.

### Worked Verification Example

This is what calculation and rounding would look like, considering the example given in the assignment doc:

| Line            | Qty | Unit Price |    Discount    | Tax | Subtotal | Discount Amt | After Discount | Tax Amt | Line Total  |
| :-------------- | :-: | :--------: | :------------: | :-: | :------: | :----------: | :------------: | :-----: | :---------: |
| **Widget A**    |  2  |  $100.00   |      10%       | 5%  | $200.00  |    $20.00    |    $180.00     |  $9.00  | **$189.00** |
| **Widget B**    |  1  |   $50.00   |       —        | 5%  |  $50.00  |    $0.00     |     $50.00     |  $2.50  | **$52.50**  |
| **Service Fee** |  1  |  $200.00   | $20.00 (fixed) |  —  | $200.00  |    $20.00    |    $180.00     |  $0.00  | **$180.00** |

**Document Totals Derived**:

- **Subtotal**: $200.00 + $50.00 + $200.00 = **$450.00**
- **Total Discount**: $20.00 + $0.00 + $20.00 = **$40.00**
- **Total Tax**: $9.00 + $2.50 + $0.00 = **$11.50**
- **Grand Total**: $189.00 + $52.50 + $180.00 = **$421.50**

---

## Document Finalize & Immutability Rules

1. **Draft Status (`DRAFT`)**:
   - Fully editable. Users can update title, customer, issue date, add/edit/delete line items.
2. **Finalized Status (`FINALIZED`)**:
   - Read-only and immutable.
   - When document is finalized, totals are calculated and locked.
   - Any attempt to modify or delete a finalized document or its line items via the API returns error.
3. **Duplication (Stretch Goal)**:
   - Users can duplicate any document (Draft or Finalized) into a brand new `DRAFT` document.
   - I have used transactions here to prevent incomplete duplication, so no worries!!

---

## Core Features

- **Multi-Rate Pricing & Tax Calculator**: Supports per-line item quantities, unit prices, mixed discounts (fixed dollar amount or percentage), and tax percentages.
- **Server-Side Money Engine**: All calculations are executed server-side using `Decimal.js` to guarantee arithmetic accuracy and eliminate floating-point drift.
- **Real-Time Interactive Editor**: Live debounced auto-saving form with Zod validation tooltips on hover.
- **Side-by-Side Invoice Preview**: Real-time invoice preview styled to professional billing standards.
- **Strict Immutability & Document Lifecycle**: Draft documents remain fully editable; finalizing a document permanently freezes its contents and totals.
- **Atomic Document Duplication**: Copy any document (Draft or Finalized) into a new editable Draft using Prisma database `$transaction`.
- **Date-Range Summary Reports**: Summary report dashboard filtering document counts, total revenue, total tax, and total discounts by issue date.
- **Print & PDF Export**: Print or export your documents easily.
- **API Key Authentication & External Access**: Integration-ready API key support (`x-api-key` header) for external programmatic access.

## Designing the Product

Upon reviewing the assignment requirements, I concluded the following to ensure best user experience:

1. **Simple yet Powerful Workflow**: Streamlined invoice and quote creation for everyday business usage.
2. **Dashboard Overview**: Summary report metrics (total revenue, tax, discount) displayed at top, followed directly by recent draft documents (to quickly pick up work) and finalized documents (for instant viewing or printing).
3. **Documents Management**: Dedicated documents page listing all user documents with quick search and status indicators.
4. **Document Editor**: Seamless real-time side-by-side editor and preview with hover validation tooltips.
5. **API Key Management**: Simple, clean interface to generate, view, and revoke API keys.

---

## Assumptions & Trade-offs

1. **Summary Report Metric Scoping**:
   - _Assumption_: The summary report only includes **finalized** documents in revenue, tax, and discount aggregations.
   - _Trade-off_: Draft document amounts are excluded from summary totals.
   - _Benefit_: I feel this dramatically improves UX and financial accuracy by preventing uncommitted draft estimates from skewing actual report metrics. As I won't want to look at draft amounts in my totals.

2. **Immutable Totals Storage**:
   - _Assumption_: Calculated totals for finalized documents cannot change.
   - _Benefit_: Storing calculated totals directly on the document record upon finalization allows ultra-fast, optimized database aggregations for date-range reports without recalculating line items on every query.

---

## Future Improvements Before Production

While I built this to be production-ready and performant, here are key areas I would enhance before a full prod launch:

1. **Advanced Document Filtering**: Add status filtering (Draft vs. Finalized) and created-at date range pickers on the main Documents page.
2. **Multi-Currency Support**: Support multi-currency transactions and formatting for international regions. (As I saw CrossVal supports MENA so this could be a needed feature)
3. **Detailed Customer Profiles**: Expand customer fields to include billing address, company logos, and regional tax compliance details (e.g., GSTIN / VAT IDs).
4. **Enhanced Design System**: Further unify micro-interactions and dark/light mode contrast across edge cases.

### Further Things I Feel We Can Add To This

1. **Document Templates**: Pre-made line-item templates for common service packages.
2. **Email Dispatch**: Send finalized invoices directly to customer email addresses via one-click integration.

---

## Live Deployed URL

- **Live Application**: [https://inval.vercel.app](https://inval.vercel.app)

---

## API Reference

All API requests require authentication by passing an API key header (`x-api-key: <YOUR_API_KEY>`.

### Documents

| Method   | Endpoint                       | Description                                      |
| :------- | :----------------------------- | :----------------------------------------------- |
| `GET`    | `/api/documents`               | List all documents for the authenticated user    |
| `POST`   | `/api/documents`               | Create a new draft document                      |
| `GET`    | `/api/documents/:id`           | Get document details including line items        |
| `PUT`    | `/api/documents/:id`           | Update document metadata (_Draft only_)          |
| `DELETE` | `/api/documents/:id`           | Delete document (_Draft only_)                   |
| `PUT`    | `/api/documents/:id/finalize`  | Finalize document and lock totals (_Draft only_) |
| `POST`   | `/api/documents/:id/duplicate` | Duplicate document into a new draft              |

### Line Items

| Method   | Endpoint                                | Description                         |
| :------- | :-------------------------------------- | :---------------------------------- |
| `POST`   | `/api/documents/:id/line-items`         | Add a line item to a draft document |
| `PUT`    | `/api/documents/:id/line-items/:itemId` | Update a line item (_Draft only_)   |
| `DELETE` | `/api/documents/:id/line-items/:itemId` | Delete a line item (_Draft only_)   |

### Summary Report

| Method | Endpoint                                 | Description                                                                    |
| :----- | :--------------------------------------- | :----------------------------------------------------------------------------- |
| `GET`  | `/api/documents/summary?from=ISO&to=ISO` | Get aggregate totals for finalized documents in date range and document counts |

---
