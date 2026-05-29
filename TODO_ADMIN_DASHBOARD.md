# Admin Dashboard CMS — Implementation Plan

## Step 1: Repo audit + content inventory

- [ ] Identify all current content blocks (works/projects, hero/banner, gallery, etc.) and map to CMS entities
- [ ] Confirm Cloudinary usage patterns (image transforms + video embed handling)

## Step 2: Data model + DB design

- [ ] Create Prisma schema for users, roles, media assets, projects, project media ordering, site sections, testimonials
- [ ] Add migration plan for production

## Step 3: Backend API

- [ ] Implement Express API with authentication (JWT + refresh cookies or sessions)
- [ ] Implement RBAC middleware
- [ ] Implement CRUD endpoints for each CMS entity
- [ ] Implement batch reorder endpoints
- [ ] Implement signed Cloudinary upload flow + metadata persistence

## Step 4: Admin dashboard UI/UX

- [ ] Build React admin pages: login, dashboard, list/create/edit forms
- [ ] Implement upload widget with preview
- [ ] Implement drag-and-drop reorder for projects + gallery
- [ ] Implement search/filter/pagination
- [ ] Add confirmation modals for destructive actions

## Step 5: Public site integration

- [ ] Replace hard-coded `WORKS` with API-driven fetching (published content only)
- [ ] Maintain existing visual layout/branding
- [ ] Add caching strategy (optional)

## Step 6: Security hardening

- [ ] Rate-limit login
- [ ] CSRF strategy if cookie auth
- [ ] Input validation + output escaping
- [ ] Audit logging
- [ ] Soft delete where appropriate

## Step 7: Testing + performance

- [ ] Unit tests for API services
- [ ] E2E smoke tests for admin flows
- [ ] Validate pagination + ordering under realistic data sizes

## Step 8: Deployment

- [ ] Dockerize API + DB + build pipeline
- [ ] Configure environment variables (Cloudinary, DB, JWT secrets)
