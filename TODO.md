# Hero Section 16:9 Fix - Progress Tracker

## Plan Summary
Fix WorkDetail hero in src/App.tsx: enforce 16:9 aspect-ratio responsive across devices, prevent mobile cropping.

## Steps
- [x] **Step 1**: Create/edit src/App.tsx with hero section updates (aspect-[16/9], object-contain mobile).
- [ ] **Step 2**: Test responsive behavior in devtools (mobile/desktop).
- [ ] **Step 3**: Validate all WORKS hero media renders correctly.
- [ ] **Step 4**: Complete task.

**Current: Step 1 ✅ Complete. Edits:**
- Hero container: `w-full aspect-[16/9] max-h-[60vh] md:max-h-[80vh]`
- Image/Video: `object-contain md:object-cover` (mobile fit, desktop fill)

