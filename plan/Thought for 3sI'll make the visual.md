Thought for 3sI'll make the visual changes now and provide a list of non-visual work for Codex. Let me first read the dashboard components to apply the design system.

Explore • 2 FilesRead dashboard surface endNow I have the full picture. Let me apply the visual design system updates to complete the Graphite & Copper token migration for the dashboard components.

Updated FinanceTableUpdated main containerUpdated search inputUpdated setup linkUpdated My Work sectionUpdated caveat statesUpdated work queuesUpdated SearchIconv13+40/-40RestoreThe dashboard surface component is now fully updated with design tokens. The visual changes are complete.

---

## Visual Changes Complete

I've updated `contractor-dashboard-surface.tsx` to use the Graphite & Copper design system tokens consistently. All hardcoded hex colors have been replaced with CSS custom properties (`var(--cream)`, `var(--border-warm)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--copper)`, `var(--graphite)`, etc.).

---

## Non-Visual Changes for Codex

Here is the comprehensive list of features, database changes, and additions that require backend/infrastructure work:

### Database Changes (Requires Schema Modifications)

| Table | Purpose | Fields
|-----|-----|-----
| `user_dashboard_preferences` | Store widget collapse state, ordering, density | `user_id`, `organization_id`, `widget_order jsonb`, `collapsed_widgets text[]`, `density enum`, `created_at`, `updated_at`
| `dashboard_metrics_cache` | Pre-computed aggregate metrics with TTL | `organization_id`, `metric_key`, `value jsonb`, `computed_at`, `expires_at`
| `user_saved_filters` | Persist search/filter configurations | `user_id`, `organization_id`, `name`, `filter_config jsonb`, `is_default boolean`
| `dashboard_activity_log` | Track team actions for activity feed | `organization_id`, `actor_id`, `action_type`, `subject_type`, `subject_id`, `metadata jsonb`, `created_at`


**Schema Modifications:**

- Add `last_dashboard_visit timestamptz` to `memberships` table (for "what's new" feature)
- Add `priority_score int` computed column to `operational_cues` (for sorting)


---

### Performance Optimizations

1. **Suspense Streaming** - Split server component into streaming boundaries for progressive loading
2. **Caching Strategy** - Implement `cacheLife` profiles for stable data (counts: 60s TTL, queue items: 15s TTL)
3. **Selective Revalidation** - Add `revalidateTag()` calls when underlying data changes
4. **Component Code Splitting** - Split 971-line component into isolated modules with lazy loading
5. **Virtualized Lists** - Implement virtual scrolling for queues with 20+ items


---

### New Features

| Feature | Description | Backend Requirements
|-----|-----|-----
| **Widget Personalization** | Collapse/expand, drag-drop reorder, hide/show | Preferences table + API routes
| **Trend Indicators** | Up/down arrows with % change vs last period | Historical metrics storage + computation
| **Mini Sparklines** | 7-day trend charts for key metrics | Time-series data aggregation
| **Real-time Notifications** | Badge showing new items since last visit | Supabase Realtime subscription
| **Activity Feed** | Recent team actions timeline | Activity log table + queries
| **Keyboard Shortcuts** | `Cmd+K` command palette | Client-side only (no DB)
| **Quick Actions** | Rapid entry for calls/notes | New server actions
| **Calendar Widget** | 7-day mini-calendar view | Query existing appointments
| **Aging Buckets Chart** | Invoice aging visualization (0-30, 31-60, etc.) | Aggregate query
| **Goal Tracking** | User-set targets with progress | Goals table + API


---

### API Routes to Create

```plaintext
POST /api/dashboard/preferences       # Save widget preferences
GET  /api/dashboard/preferences       # Load widget preferences
POST /api/dashboard/filters           # Save search filter
GET  /api/dashboard/activity          # Fetch activity feed
GET  /api/dashboard/metrics/trends    # Fetch historical trends
POST /api/dashboard/quick-actions/log-call   # Quick log entry
POST /api/dashboard/quick-actions/add-note   # Quick note entry
```

---

### Server Actions to Create

```typescript
// lib/dashboard/actions.ts
saveDashboardPreferencesAction(formData)
saveSearchFilterAction(formData)
dismissActivityItemAction(formData)
logQuickCallAction(formData)
addQuickNoteAction(formData)
```

---

### Supabase Realtime Integration

For real-time notifications:

- Subscribe to `operational_cues` changes
- Subscribe to `work_items` changes
- Subscribe to `invoices` status changes
- Badge counter for "new since last visit"


---

Let me know which items you'd like Codex to prioritize, and whether you need database migration scripts drafted.