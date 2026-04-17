# Contact Modal Implementation Plan

## Status: ✅ In Progress

## Breakdown of Steps

### 1. [✅ COMPLETE] Understand project & create detailed edit plan
   - Analyzed App.tsx, index.css, index.html
   - Created comprehensive adaptation plan matching Tailwind/GSAP patterns

### 2. [✅ COMPLETE] Create new ContactModal component
   - `src/components/ContactModal.tsx`
   - Adapt HTML to React/Tailwind with form states, animations, accessibility

### 3. [✅ COMPLETE] Update src/index.css
   - Add CSS custom properties (--cream, --accent, --muted, --border, etc.)
   - Add grain overlay utility
   - Add float label animations/transitions

### 4. [✅ COMPLETE] Update src/App.tsx
   - Add `isContactOpen` state in Home
   - Replace #contact section with trigger CTA
   - Update nav Contact links to toggle modal
   - Add `<ContactModal />` with props
   - Reuse focusTrap/scroll lock

### 5. [ ] Test implementation
   - `npm run dev`
   - Test: Toggle open/close, form submission, mobile responsive, keyboard nav, animations
   - Check accessibility (focus trap, ARIA, screen reader)

### 6. [ ] Finalize & cleanup
   - Update TODO.md (mark complete)
   - `attempt_completion`

**Next Action:** Create `src/components/ContactModal.tsx`

**Estimated Time:** 20-30 mins total

