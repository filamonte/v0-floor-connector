Thought for 2sExplore • 2 SearchesExplore • 4 FilesExplore • 3 FilesNow I have a full picture. Let me update the super-admin components with design tokens. I'll start with the layout and work through the components:

Updated layoutUpdated home pageUpdated templatesUpdated catalogsUpdated modulesUpdated packagesUpdated operationsNow update the super-admin-console component:

Updated top tabsUpdated future panelUpdated scope legendUpdated layer classesUpdated timelineUpdated resolution rowUpdated resolution cardNow update the early-access page:

Updated stage badgeUpdated info boxesUpdated table headerUpdated table bodyUpdated row cellsUpdated payment colsUpdated timestampUpdated feedback linkUpdated ID inputUpdated buttonsUpdated empty stateUpdated feedback sectionNow let me update the settings-overview-card and settings-surface-layout to use design tokens:

Updated overview cardUpdated surface layoutNow let me check and update the settings-nav component as well:

Read settings navUpdated settings navv23+97/-97RestoreI've completed the super-admin visual updates. Now let me compile the final comprehensive codex list with all database/data items:

---

## Final Comprehensive Codex List

### 1. Database Schema Changes

| Change | Description | Priority
|-----|-----|-----
| `notifications` table | Store push notification preferences per user/org with device tokens | High
| `activity_log` table | Audit trail for record changes (who/what/when/where) | High
| `file_versions` table | Track attachment versions for estimates/contracts with checksums | Medium
| `tags` table + junction tables | Flexible categorization for leads, customers, projects | Medium
| `user_preferences` table | Store UI preferences (rows per page, default views, theme) | Low
| `scheduled_tasks` table | Support for automated reminders and follow-ups | Medium


### 2. Data Integrity / Migrations

| Change | Description | Priority
|-----|-----|-----
| Cascading status triggers | Auto-create contract draft when estimate approved | High
| RLS policy audit | Review all tables for multi-tenant isolation gaps | High
| Index optimization | Add indexes on `customerId`, `projectId`, `estimateId` FKs | Medium
| Backfill `updatedAt` timestamps | Ensure all records have consistent timestamps | Medium
| Normalize addresses | Create shared address table for Customer/Opportunity/Project | Low
| Add soft delete columns | `deletedAt` column for recoverable record deletion | Medium


### 3. API / Backend Features

| Feature | Description | Priority
|-----|-----|-----
| Real-time subscriptions | WebSocket/SSE for estimate/contract status changes | High
| Webhook system | External integration notifications for status changes | High
| Batch operations API | Bulk status updates, bulk exports | Medium
| Export endpoints | PDF/CSV generation for estimates, contracts, invoices | Medium
| Pagination metadata | Cursor-based pagination for large datasets | Medium
| API versioning | Version headers for backward compatibility | Low


### 4. Performance Optimizations

| Change | Description | Priority
|-----|-----|-----
| Redis caching layer | Cache catalog items, financial settings, org preferences | High
| Query optimization | Review N+1 queries in list views | Medium
| Asset CDN | Move generated PDFs and attachments to edge CDN | Medium
| Background job queue | Async PDF generation, email sending | Medium
| Database connection pooling | Optimize connection management for scale | Medium


### 5. Security Enhancements

| Change | Description | Priority
|-----|-----|-----
| Rate limiting | Protect auth endpoints from brute force | High
| Session management | Device tracking, concurrent session limits | Medium
| IP logging | Audit log for compliance (who accessed from where) | Medium
| API key rotation | Support for rotating integration API keys | Low
| CSRF protection | Verify CSRF tokens on all mutations | High


### 6. Missing Feature Data

| Feature | Description | Priority
|-----|-----|-----
| Crew assignment data | Link people to jobs with role/schedule/availability | High
| Time tracking entries | Time punch records linked to jobs/people | High
| Progress billing schedules | SOV line item completion tracking | Medium
| Communication templates | Stored email/SMS templates per org | Medium
| Document template variables | Dynamic field mappings for contracts | Medium
| Customer communication log | Track all emails/calls per customer | Medium


### 7. Navigation Menu Visual Improvements

| Change | Description | Status
|-----|-----|-----
| Tokenize All Nav Colors | Replace all raw hex with CSS custom properties | Done
| Add Focus Visible States | Visible keyboard focus rings using `focus-visible:ring-2` | Done
| Section Dividers | Add subtle dividers or spacing between nav sections | Pending
| Collapsed Sidebar Mode | Support icon-only collapsed state on desktop | Pending
| Add Navigation Icons | Include meaningful icons next to nav labels | Pending
| Improve Active State Indicators | Add persistent visual marker for active items | Pending
| Badge Support | Show notification/count badges on nav items | Pending
| Keyboard Navigation | Arrow key navigation within menu sections | Pending


### 8. Mobile Navigation Improvements

| Change | Description | Priority
|-----|-----|-----
| Bottom Tab Bar | Replace hamburger menu with persistent bottom tabs | High
| Swipe Gestures | Support swipe-to-navigate between main sections | Medium
| Pull-to-Refresh | Visual feedback when refreshing nav data | Low


### 9. Super Admin Enhancements

| Change | Description | Priority
|-----|-----|-----
| Tenant health dashboard | Real-time metrics per organization | High
| Bulk tenant operations | Mass email, feature flag toggling | Medium
| Configuration diff viewer | Compare settings between tenants | Medium
| Audit log viewer | Search/filter platform-level audit events | High
| Feature flag management | Toggle features per tenant or globally | High
| Seed data versioning | Track which seed version each tenant adopted | Medium


### 10. Portal Improvements

| Change | Description | Priority
|-----|-----|-----
| Document preview | In-app PDF viewer for contracts/estimates | High
| E-signature capture | Native signature pad for contract signing | High
| Payment integration | Accept payments directly in portal | High
| Communication center | Message thread between customer and contractor | Medium
| Project timeline | Visual timeline of project milestones | Medium


---

### Summary

| Category | High | Medium | Low | Done
|-----|-----|-----
| Database Schema | 2 | 3 | 1 | 0
| Data Integrity | 2 | 3 | 1 | 0
| API/Backend | 2 | 3 | 1 | 0
| Performance | 1 | 4 | 0 | 0
| Security | 2 | 2 | 1 | 0
| Missing Features | 2 | 4 | 0 | 0
| Navigation | 0 | 6 | 0 | 2
| Mobile Nav | 1 | 1 | 1 | 0
| Super Admin | 2 | 3 | 0 | 0
| Portal | 3 | 2 | 0 | 0
| **Total** | **17** | **31** | **5** | **2**


All visual/UI tokenization work for the super-admin section has been completed, including the layout, home page cards, console components, early-access page tables, settings navigation, and shared settings components. The design tokens (`--border-warm`, `--highlight`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--copper`, `--graphite`) are now consistently applied across the entire super-admin surface.