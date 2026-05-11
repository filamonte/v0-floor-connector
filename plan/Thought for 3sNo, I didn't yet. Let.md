Thought for 3sNo, I didn't yet. Let me make the visual improvements to the `/invoices` route now by applying the design system tokens.

Explore • 3 FilesNow I'll apply the design token updates to these invoice components.

Updated table headerUpdated table rowsUpdated ReadonlyValueNow let me read the invoices/page.tsx to find and update the summary cards with hardcoded colors:

Found summary cardsUpdated summary cardsUpdated search controlsUpdated filter buttonsUpdated create buttonv14+38/-38RestoreVisual changes to the `/invoices` route are complete. All hardcoded hex colors have been replaced with design system tokens (`var(--border-warm)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--copper)`, `var(--graphite)`, `var(--highlight)`, etc.). The invoice list page, invoice records table, and invoice form now all use the consistent Graphite & Copper design system.

---

## Updated Codex Running List (Dashboard + Invoices)

I'll now add any additional invoice-specific non-visual work to the running list. Here's the updated comprehensive list:

### Database Changes

| Table | Module | Purpose
|-----|-----|-----
| `user_dashboard_preferences` | Dashboard | Widget order, collapsed state, density
| `dashboard_metrics_cache` | Dashboard | Pre-computed aggregate metrics
| `user_saved_filters` | Both | Persist search/filter configurations
| `dashboard_activity_log` | Dashboard | Team actions for activity feed
| `invoice_preferences` | Invoices | List view preferences (columns, sort, rows per page)
| `invoice_templates` | Invoices | Reusable invoice templates with pre-filled line items
| `invoice_reminders` | Invoices | Scheduled payment reminder emails with tracking
| `invoice_aging_snapshots` | Invoices | Pre-computed aging bucket data for reporting
| Add `last_dashboard_visit` to `memberships` | Dashboard | "What's new" feature
| Add `reminder_sent_at` to `invoices` | Invoices | Reminder tracking
| Add `reminder_count` to `invoices` | Invoices | Reminder count


### Performance Optimizations

| Task | Module
|-----|-----|-----
| Suspense streaming for dashboard | Dashboard
| Suspense streaming for invoice detail page | Invoices
| Cache key business metrics (60s TTL) | Dashboard
| Cache invoice status counts | Invoices
| Lazy load below-fold widgets | Dashboard
| Lazy load payment history section | Invoices
| Virtualize long queue lists (20+) | Dashboard
| Virtualize invoice line items table (50+) | Invoices
| Debounce invoice search input (250ms) | Invoices


### New Features

| Feature | Module | Priority
|-----|-----|-----
| Widget personalization (collapse, reorder) | Dashboard | Phase 1
| Trend indicators with sparklines | Dashboard | Phase 2
| Real-time notifications badge | Dashboard | Phase 3
| Command palette (`Cmd+K`) | Dashboard | Phase 2
| Activity feed | Dashboard | Phase 3
| Bulk invoice actions | Invoices | Phase 2
| Invoice PDF preview in-app | Invoices | Phase 2
| Payment reminder automation | Invoices | Phase 2
| Recurring invoices / subscription billing | Invoices | Phase 3
| Invoice duplication | Invoices | Phase 1
| Batch payment recording | Invoices | Phase 2
| Invoice aging report visualization | Invoices | Phase 2
| Customer payment portal link | Invoices | Phase 3
| Invoice templates | Invoices | Phase 1
| Internal invoice notes/comments | Invoices | Phase 2


### API Routes to Create

```plaintext
// Dashboard
POST /api/dashboard/preferences       
GET  /api/dashboard/preferences       
POST /api/dashboard/filters           
GET  /api/dashboard/activity          
GET  /api/dashboard/metrics/trends    
POST /api/dashboard/quick-actions/log-call   
POST /api/dashboard/quick-actions/add-note   

// Invoices
POST /api/invoices/bulk-actions         
POST /api/invoices/[id]/duplicate       
POST /api/invoices/[id]/send-reminder   
POST /api/invoices/[id]/generate-link   
GET  /api/invoices/aging-summary        
POST /api/invoices/templates            
GET  /api/invoices/templates            
GET  /api/invoices/[id]/preview-pdf     
```

### Server Actions to Create

```typescript
// Dashboard
saveDashboardPreferencesAction()
saveSearchFilterAction()
dismissActivityItemAction()
logQuickCallAction()
addQuickNoteAction()

// Invoices
duplicateInvoiceAction()
sendPaymentReminderAction()
bulkUpdateInvoiceStatusAction()
saveInvoiceTemplateAction()
applyInvoiceTemplateAction()
recordBatchPaymentAction()
```

---

Ready to review the next route. Which one would you like to tackle: `/estimates`, `/jobs`, `/contracts`, or `/customers`?