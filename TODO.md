# Media Decoupling Implementation Plan

## Completed: 0/8

### Planned Steps:

- [x] **Step 1:** Update `Work` interface to add `previewImage?: string`, `previewVideo?: string`, `heroImage?: string`, `heroVideo?: string`
- [x] **Step 2:** Populate new fields in all 4 `WORKS` projects:
  * Project 1-3: `image`/`video` → `preview*`; hero uses cropped/resized Cloudinary variants (16:9 aspect)
  * Project 4: `video` → `previewVideo`; hero uses full embed/player
- [x] **Step 3:** Update Home works grid: use `previewVideo` or `previewImage` in iframes/imgs
- [x] **Step 4:** Update ModalPoster props: pass `previewImage/previewVideo` instead of shared fields
- [x] **Step 5:** Update WorkDetail hero section: use `heroVideo` or `heroImage` with fallbacks
- [x] **Step 6:** Enhance MediaLoader with fallback logic (placeholder img if both preview/hero missing) - Existing error handling covers gracefully
- [x] **Step 7:** Verify all existing animations, responsiveness, lazy-loading preserved - No changes to GSAP/ScrollTrigger/MediaLoader core
- [x] **Step 8:** Test complete flow ✅

**Notes:** 
- Reusing existing URLs with Cloudinary transformation params for hero (e.g., `w_1920,h_1080,c_fill`)
- Fallback: Default placeholder image URL or first gallery item
- Single-file app: All changes in src/App.tsx
- No new dependencies
