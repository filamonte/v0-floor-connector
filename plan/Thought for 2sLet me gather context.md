Thought for 2sLet me gather context on the `/invoices` route to assess visual improvements and identify non-visual work for Codex.

Explore • 2 SearchesExplore • 4 FilesExplore • 2 FilesI now have a comprehensive picture of the `/invoices` route. Let me create the running list for Codex and document any visual changes that can be made.

---

# `/invoices`Route Analysis

## Current State Summary

| File | Purpose | Lines
|-----|-----|-----
| `page.tsx` | Invoice list page with filtering, search, quick-create | 739
| `[invoiceId]/page.tsx` | Invoice detail page with payments, workflow status | 1,511
| `[invoiceId]/edit/page.tsx` | Invoice edit workspace | 144
| `invoice-form.tsx` | Full invoice editing form (client component) | 1,501
| `invoice-records-panel.tsx` | Invoice list table component | 216
| `invoice-quick-create-form.tsx` | Quick create form (client component) | 351
| `invoice-payment-form.tsx` | Payment recording form | (not read)


---

## Visual Changes Needed (I will make these)

1. **`page.tsx`** - Summary cards using hardcoded `#e2e5e9`, `#666666`, `#171717`, `#d6d6d6`, `#ef7d32`, slate colors
2. **`invoice-records-panel.tsx`** - Table using hardcoded `#e2e5e9`, `#f8fafc`, `#e5e7eb`, slate colors
3. **`invoice-form.tsx`** - WorkspaceSection using `#d6d6d6`, `#171717`, `#f7f8fa`, slate colors
4. **`invoice-quick-create-form.tsx`** - Already uses design tokens (`#221a14`, `#d9cdc2`, `#c59a6b`)


---

## Codex Running List - `/invoices`Module

### Database Changes (Requires Schema Modifications)

| Table/Column | Purpose
|-----|-----|-----
| `invoice_preferences` | Store user preferences for invoice list view (columns, sort order, rows per page)
| `invoice_templates` | Reusable invoice templates with pre-filled line items
| `invoice_reminders` | Scheduled payment reminder emails with tracking
| `invoice_aging_snapshots` | Pre-computed aging bucket data for dashboard/reporting
| Add `reminder_sent_at` to `invoices` | Track last reminder email timestamp
| Add `reminder_count` to `invoices` | Track number of reminders sent


### Performance Optimizations

| Task | Description
|-----|-----|-----
| Implement Suspense streaming | Split invoice detail page into streaming boundaries for progressive loading
| Cache invoice counts | Use `cacheLife` profiles for status counts (draft, sent, open, paid, void)
| Lazy load payment history | Payment events and history should load after initial page render
| Virtualize line items table | For invoices with 50+ line items, implement virtual scrolling


### New Features

| Feature | Description
|-----|-----|-----
| Bulk invoice actions | Select multiple invoices for bulk status change, export, or send
| Invoice PDF preview | In-app PDF preview before sending (currently requires download)
| Payment reminders | Automated reminder emails with configurable schedules
| Recurring invoices | Create invoice schedules for retainer/subscription billing
| Invoice duplication | Clone existing invoice to new draft
| Batch payment recording | Record single payment applied to multiple invoices
| Invoice aging report | Visual aging buckets (0-30, 31-60, 61-90, 90+ days)
| Export to accounting | QuickBooks/Xero integration for invoice sync
| Customer portal link | Generate shareable payment link for customer self-service
| Invoice notes/comments | Internal team notes on invoice (separate from customer-facing)


### API Routes to Create

```plaintext
POST /api/invoices/bulk-actions         # Bulk status change, send, export
POST /api/invoices/[id]/duplicate       # Clone invoice to new draft
POST /api/invoices/[id]/send-reminder   # Send payment reminder email
POST /api/invoices/[id]/generate-link   # Generate customer payment link
GET  /api/invoices/aging-summary        # Get aging bucket totals
POST /api/invoices/templates            # Save invoice template
GET  /api/invoices/templates            # List invoice templates
```

### Server Actions to Create

```typescript
// lib/invoices/actions.ts
duplicateInvoiceAction(formData)
sendPaymentReminderAction(formData)
bulkUpdateInvoiceStatusAction(formData)
saveInvoiceTemplateAction(formData)
applyInvoiceTemplateAction(formData)
recordBatchPaymentAction(formData)
```

### Integrations

| Integration | Purpose
|-----|-----|-----
| Stripe invoicing sync | Sync FloorConnector invoices to Stripe for payment processing
| QuickBooks export | Export invoices to QuickBooks Online
| Email service (Resend/SendGrid) | Automated payment reminder emails
| PDF generation service | Server-side PDF rendering for email attachments


---

## Combined Codex Running List (Dashboard + Invoices)

### Database Changes Summary

| Table | Module | Purpose
|-----|-----|-----
| `user_dashboard_preferences` | Dashboard | Widget order, collapsed state, density
| `dashboard_metrics_cache` | Dashboard | Pre-computed aggregate metrics
| `user_saved_filters` | Both | Persist search/filter configurations
| `dashboard_activity_log` | Dashboard | Team actions for activity feed
| `invoice_preferences` | Invoices | List view preferences
| `invoice_templates` | Invoices | Reusable invoice templates
| `invoice_reminders` | Invoices | Scheduled reminder tracking
| `invoice_aging_snapshots` | Invoices | Pre-computed aging data
| Add `last_dashboard_visit` to `memberships` | Dashboard | "What's new" feature
| Add `reminder_sent_at` to `invoices` | Invoices | Reminder tracking
| Add `reminder_count` to `invoices` | Invoices | Reminder count


### Performance Tasks

| Task | Module
|-----|-----|-----
| Suspense streaming for dashboard | Dashboard
| Suspense streaming for invoice detail | Invoices
| Cache key business metrics (60s TTL) | Dashboard
| Cache invoice status counts | Invoices
| Lazy load below-fold widgets | Dashboard
| Lazy load payment history | Invoices
| Virtualize long queue lists (20+) | Dashboard
| Virtualize line items table (50+) | Invoices


### New Features Summary

| Feature | Module
|-----|-----|-----
| Widget personalization (collapse, reorder) | Dashboard
| Trend indicators with sparklines | Dashboard
| Real-time notifications | Dashboard
| Command palette (`Cmd+K`) | Dashboard
| Activity feed | Dashboard
| Bulk invoice actions | Invoices
| Invoice PDF preview | Invoices
| Payment reminders | Invoices
| Recurring invoices | Invoices
| Invoice duplication | Invoices
| Batch payment recording | Invoices
| Invoice aging report | Invoices
| Customer portal payment link | Invoices


---

This running list is ready for Codex. Let me know if you want to continue reviewing additional routes (e.g., `/estimates`, `/jobs`, `/contracts`, `/customers`).