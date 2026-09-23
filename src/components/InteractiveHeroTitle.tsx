import React, { useState, useEffect, useRef } from 'react';

// SVG Glyph definitions for each letter in "JAKE AMPONSAH"
// All paths use viewBox="0 0 W 100" and fill="currentColor"
// Styled to match the creative agency interactive character swap effect.

type GlyphComponent = React.FC<{ className?: string }>;

/* ══════════════════════════════════════════════════════════════════════
   LETTER J VARIANTS (60 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const J_Variants: GlyphComponent[] = [
  // 1. Gothic Blackletter Spiked J
  ({ className }) => (
    <svg viewBox="0 0 65 100" className={className} fill="currentColor">
      <path d="M14 8 L58 8 L52 22 L46 22 L46 66 C46 82 36 94 18 94 C6 94 2 84 4 74 L16 78 C16 84 22 86 28 82 C34 76 34 66 34 56 L34 22 L24 22 L14 8 Z M6 82 L0 76 L8 70 L14 76 Z" />
    </svg>
  ),
  // 2. Liquid Molten Droplet J
  ({ className }) => (
    <svg viewBox="0 0 65 100" className={className} fill="currentColor">
      <path d="M24 8 C40 6 52 14 52 26 C52 38 46 48 46 62 C46 78 36 94 20 94 C8 94 4 84 6 74 C8 62 20 66 22 74 C24 80 28 82 32 76 C36 68 34 56 34 46 C34 32 32 20 20 16 Z" />
      <circle cx="10" cy="84" r="6" />
    </svg>
  ),
  // 3. High-Contrast Editorial Serif J with Ball Terminal
  ({ className }) => (
    <svg viewBox="0 0 65 100" className={className} fill="currentColor">
      <path d="M20 10 L54 10 L54 16 L44 16 L44 65 C44 82 34 94 18 94 C6 94 2 85 2 77 C2 67 10 61 18 61 C25 61 30 66 30 73 C30 81 23 87 17 87 C15 87 13 85 13 83 C18 80 24 80 29 73 C32 68 32 58 32 46 L32 16 L20 16 Z" />
      <circle cx="17" cy="74" r="7" />
    </svg>
  ),
  // 4. Starburst Cyber Cutout J
  ({ className }) => (
    <svg viewBox="0 0 65 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M16 8 L54 8 L54 70 C54 86 42 96 24 96 L4 96 L4 72 L24 72 C28 72 32 68 32 64 L32 30 L16 30 Z M28 84 C31 84 33 81 33 78 C33 81 35 84 38 84 C35 84 33 87 33 90 C33 87 31 84 28 84 Z" />
    </svg>
  ),
  // 5. Brutalist 45° Stencil J
  ({ className }) => (
    <svg viewBox="0 0 65 100" className={className} fill="currentColor">
      <path d="M18 8 L54 8 L54 46 L34 46 L34 52 L54 52 L54 70 L34 94 L8 94 L2 80 L18 80 L26 72 L26 30 L18 30 Z" />
    </svg>
  ),
  // 6. Beaded Bubble Chain J
  ({ className }) => (
    <svg viewBox="0 0 65 100" className={className} fill="currentColor">
      <circle cx="44" cy="16" r="10" />
      <circle cx="44" cy="34" r="10" />
      <circle cx="44" cy="52" r="10" />
      <circle cx="40" cy="70" r="11" />
      <circle cx="28" cy="84" r="11" />
      <circle cx="12" cy="78" r="9" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER A VARIANTS (85 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const A_Variants: GlyphComponent[] = [
  // 1. Gothic Cathedral Pointed Arch A
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor">
      <path d="M42 4 L56 34 L82 94 L62 94 L54 74 L30 74 L22 94 L2 94 L28 34 Z M42 26 L35 56 L49 56 Z M42 0 L45 8 L39 8 Z" />
      <path d="M30 64 L54 64 L42 54 Z" />
    </svg>
  ),
  // 2. Liquid Molten Wave A
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor">
      <path d="M42 6 C50 6 56 16 60 28 L82 90 C84 94 76 96 68 94 C60 92 56 82 54 74 L30 74 C28 82 24 94 14 94 C6 94 2 88 4 82 L26 28 C30 14 36 6 42 6 Z M42 30 C38 42 36 54 34 62 L50 62 C48 52 46 40 42 30 Z" />
      <circle cx="42" cy="74" r="5" />
    </svg>
  ),
  // 3. Didone High-Contrast Editorial A
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor">
      <path d="M38 10 L50 10 L84 92 L62 92 L54 72 L30 72 L22 92 L8 92 L36 10 Z M42 32 L33 58 L51 58 Z" />
      <path d="M28 72 C36 68 48 68 56 72 L54 68 C46 64 38 64 30 68 Z" />
    </svg>
  ),
  // 4. Starburst Portal A (like video 00:17)
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 L84 94 L58 94 L50 76 L34 76 L26 94 L0 94 Z M42 36 C45 46 48 50 56 52 C48 54 45 58 42 68 C39 58 36 54 28 52 C36 50 39 46 42 36 Z" />
    </svg>
  ),
  // 5. Brutalist 45° Stencil A
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor">
      <path d="M42 6 L64 42 L50 42 L42 26 L34 42 L20 42 Z M68 50 L84 94 L62 94 L56 76 L28 76 L22 94 L0 94 L16 50 L32 50 L40 68 L44 68 L52 50 Z" />
    </svg>
  ),
  // 6. Eye Portal Minimalist A
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 L82 94 L58 94 L52 74 L32 74 L26 94 L2 94 Z M42 38 C52 38 56 52 42 58 C28 52 32 38 42 38 Z" />
      <circle cx="42" cy="48" r="3" fill="#000" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER K VARIANTS (80 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const K_Variants: GlyphComponent[] = [
  // 1. Gothic Dragon Claw K
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L30 8 L30 44 L58 10 L80 10 L48 48 L80 92 L56 92 L30 58 L30 92 L8 92 Z M8 8 L4 18 L12 18 Z M80 10 L72 20 L78 24 Z" />
    </svg>
  ),
  // 2. Liquid Molten Organic K
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M12 8 C22 8 28 14 28 26 L28 44 C34 36 44 24 54 16 C64 8 74 10 76 18 C78 26 66 38 54 48 C66 60 76 74 76 84 C76 92 68 94 60 92 C48 88 38 72 28 58 L28 84 C28 92 20 94 12 92 Z" />
      <circle cx="76" cy="18" r="4" />
    </svg>
  ),
  // 3. Editorial Swash Ball Terminal K
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M10 10 L30 10 L30 46 L58 10 L76 10 L44 50 L78 92 L56 92 L30 60 L30 92 L10 92 Z" />
      <circle cx="68" cy="14" r="6" />
      <circle cx="74" cy="88" r="6" />
    </svg>
  ),
  // 4. Brutalist Chevron Slab K
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L30 8 L30 94 L8 94 Z M36 46 L62 10 L80 10 L50 50 L80 94 L60 94 L36 56 Z" />
      <rect x="36" y="48" width="8" height="4" fill="#000" />
    </svg>
  ),
  // 5. Winged Tribal Blade K (like video 00:05 / 00:21)
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M10 8 L28 8 L28 42 C38 32 54 18 78 8 C68 22 56 36 44 48 C60 58 72 74 80 92 C62 84 46 72 28 58 L28 92 L10 92 Z" />
    </svg>
  ),
  // 6. Beaded Bubble Nodes K
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <circle cx="20" cy="16" r="10" />
      <circle cx="20" cy="38" r="10" />
      <circle cx="20" cy="60" r="10" />
      <circle cx="20" cy="82" r="10" />
      <circle cx="42" cy="42" r="9" />
      <circle cx="58" cy="26" r="10" />
      <circle cx="72" cy="14" r="8" />
      <circle cx="56" cy="62" r="10" />
      <circle cx="70" cy="82" r="10" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER E VARIANTS (75 x 100) — Inspired directly by video 00:01, 00:02, 00:09!
   ══════════════════════════════════════════════════════════════════════ */
const E_Variants: GlyphComponent[] = [
  // 1. Botanical Leaf / Floral E (as seen in video 00:01!)
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L28 8 L28 94 L10 94 Z M28 10 C38 4 56 2 68 12 C60 20 46 22 28 22 Z M28 44 C40 38 52 40 60 48 C50 56 38 54 28 54 Z M28 78 C44 76 58 80 70 94 L28 94 Z" />
      <path d="M52 14 C56 6 64 2 72 4 C70 12 64 16 52 14 Z" />
    </svg>
  ),
  // 2. Liquid Molten Waves E (as seen in video 00:02!)
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L26 8 L26 94 L10 94 Z M26 10 C40 4 54 20 72 16 C66 28 46 26 26 24 Z M26 44 C42 38 50 56 68 50 C62 60 44 58 26 56 Z M26 78 C40 74 54 88 74 86 C64 96 42 94 26 94 Z" />
    </svg>
  ),
  // 3. Gothic Blackletter Horns E (as seen in video 00:09!)
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L72 8 L72 24 L60 18 L28 18 L28 42 L58 42 L58 56 L28 56 L28 84 L64 84 L72 76 L72 94 L10 94 Z M10 8 L2 18 L12 24 Z M10 94 L2 84 L12 78 Z" />
    </svg>
  ),
  // 4. Brutalist Chamfered Wedge E (as seen in video 00:03 / 00:11)
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L72 8 L54 24 L30 24 L30 42 L60 42 L48 56 L30 56 L30 78 L68 78 L74 94 L10 94 Z" />
    </svg>
  ),
  // 5. Didone High-Contrast Ball Terminal E
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M12 10 L60 10 L60 16 L32 16 L32 46 L54 46 L54 52 L32 52 L32 86 L68 86 L68 94 L12 94 Z" />
      <circle cx="62" cy="14" r="7" />
    </svg>
  ),
  // 6. Modular Capsule Equalizer E
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <rect x="8" y="8" width="18" height="86" rx="6" />
      <rect x="30" y="10" width="40" height="16" rx="8" />
      <rect x="30" y="44" width="32" height="14" rx="7" />
      <rect x="30" y="76" width="42" height="16" rx="8" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER M VARIANTS (95 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const M_Variants: GlyphComponent[] = [
  // 1. Gothic Spired Crown M
  ({ className }) => (
    <svg viewBox="0 0 95 100" className={className} fill="currentColor">
      <path d="M8 8 L24 8 L48 56 L72 8 L88 8 L88 94 L70 94 L70 38 L52 74 L44 74 L26 38 L26 94 L8 94 Z M48 4 L52 14 L44 14 Z M8 8 L2 18 L12 18 Z M88 8 L82 18 L92 18 Z" />
    </svg>
  ),
  // 2. Liquid Molten Arches M
  ({ className }) => (
    <svg viewBox="0 0 95 100" className={className} fill="currentColor">
      <path d="M10 8 C22 6 26 18 26 30 L40 62 C44 70 52 70 56 62 L70 30 C70 18 74 6 86 8 C92 10 94 20 92 34 L86 92 C84 96 74 94 70 90 L70 46 L54 78 L42 78 L26 46 L26 90 C22 94 12 96 10 92 L4 34 C2 20 4 10 10 8 Z" />
    </svg>
  ),
  // 3. Editorial Flared Roman M
  ({ className }) => (
    <svg viewBox="0 0 95 100" className={className} fill="currentColor">
      <path d="M6 10 L26 10 L26 16 L20 16 L20 86 L26 86 L26 92 L6 92 L6 86 L12 86 L12 16 L6 16 Z M82 10 L94 10 L94 92 L76 92 L76 86 L82 86 L82 16 L76 16 Z M20 16 L48 76 L76 16 L68 16 L48 60 L28 16 Z" />
    </svg>
  ),
  // 4. 3D Origami Folded Ribbon M (like video 00:18)
  ({ className }) => (
    <svg viewBox="0 0 95 100" className={className} fill="currentColor">
      <path d="M8 8 L28 8 L48 58 L68 8 L88 8 L88 94 L68 94 L68 40 L52 76 L44 76 L28 40 L28 94 L8 94 Z" />
      <polygon points="48,58 68,8 60,8 44,50" fill="#000" opacity="0.3" />
    </svg>
  ),
  // 5. Starburst Diamond Center M
  ({ className }) => (
    <svg viewBox="0 0 95 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M8 8 L32 8 L48 46 L64 8 L88 8 L88 94 L68 94 L68 38 L54 70 L42 70 L28 38 L28 94 L8 94 Z M48 18 C52 24 56 26 62 28 C56 30 52 32 48 38 C44 32 40 30 34 28 C40 26 44 24 48 18 Z" />
    </svg>
  ),
  // 6. Continuous Wave / Snake M
  ({ className }) => (
    <svg viewBox="0 0 95 100" className={className} fill="currentColor">
      <path d="M12 92 C8 84 8 28 18 16 C28 4 38 20 48 46 C58 20 68 4 78 16 C88 28 88 84 84 92 L68 92 C72 64 70 30 64 28 C58 26 52 46 48 58 L48 58 C44 46 38 26 32 28 C26 30 24 64 28 92 Z" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER P VARIANTS (75 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const P_Variants: GlyphComponent[] = [
  // 1. Gothic Spiked Crest P
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L54 8 C68 8 74 18 74 34 C74 50 66 60 52 60 L28 60 L28 94 L10 94 Z M28 22 L28 46 L50 46 C56 46 58 40 58 34 C58 28 54 22 48 22 Z M10 8 L2 18 L12 18 Z" />
    </svg>
  ),
  // 2. Liquid Droplet P
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M12 8 C22 6 28 16 28 28 L28 54 C34 58 42 60 52 60 C66 60 74 50 74 34 C74 16 64 8 48 8 Z M28 22 C34 22 46 20 52 24 C56 28 56 38 52 42 C46 46 36 46 28 44 Z" />
      <circle cx="16" cy="88" r="5" />
    </svg>
  ),
  // 3. Editorial Open Swash P
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 10 L30 10 L30 92 L10 92 Z M30 14 C44 14 68 16 68 36 C68 54 48 58 34 58 L30 52 C42 52 56 48 56 36 C56 24 42 22 30 22 Z" />
      <circle cx="34" cy="56" r="4" />
    </svg>
  ),
  // 4. Starburst Cyber Cutout P (like video 00:17)
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M10 8 L54 8 C68 8 74 20 74 36 C74 52 66 62 52 62 L30 62 L30 94 L10 94 Z M44 26 C47 31 50 33 55 35 C50 37 47 39 44 44 C41 39 38 37 33 35 C38 33 41 31 44 26 Z" />
    </svg>
  ),
  // 5. Brutalist Stencil Capsule P
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <rect x="8" y="8" width="18" height="86" rx="4" />
      <path d="M30 10 L54 10 C68 10 74 20 74 35 C74 50 68 58 54 58 L30 58 Z M48 24 L34 24 L34 44 L48 44 C54 44 56 40 56 34 C56 28 54 24 48 24 Z" />
    </svg>
  ),
  // 6. Nautilus Spiral P
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L54 8 C68 8 74 20 74 36 C74 52 64 62 50 62 C38 62 30 54 30 42 C30 32 38 26 46 26 C52 26 56 30 56 36 C56 40 52 44 48 44 C44 44 42 42 42 38 L38 38 C38 46 44 50 50 50 C58 50 64 42 64 34 C64 22 56 16 46 16 L28 16 L28 94 L10 94 Z" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER O VARIANTS (85 x 100) — Inspired directly by video 00:15 & 00:17!
   ══════════════════════════════════════════════════════════════════════ */
const O_Variants: GlyphComponent[] = [
  // 1. Starburst Cutout O (as seen in video 00:17!)
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 C66 6 84 24 84 50 C84 76 66 94 42 94 C18 94 0 76 0 50 C0 24 18 6 42 6 Z M42 22 C46 36 50 40 64 44 C50 48 46 52 42 66 C38 52 34 48 20 44 C34 40 38 36 42 22 Z" />
    </svg>
  ),
  // 2. Globe / Meridian Wireframe O (as seen in video 00:15!)
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 C66 6 84 24 84 50 C84 76 66 94 42 94 C18 94 0 76 0 50 C0 24 18 6 42 6 Z M42 16 C48 26 52 38 52 50 C52 62 48 74 42 84 C36 74 32 62 32 50 C32 38 36 26 42 16 Z M20 30 C26 26 34 22 42 22 C50 22 58 26 64 30 L62 34 C56 30 50 28 42 28 C34 28 28 30 22 34 Z M20 70 C26 74 34 78 42 78 C50 78 58 74 64 70 L62 66 C56 70 50 72 42 72 C34 72 28 70 22 66 Z" />
      <polygon points="42,38 46,50 42,62 38,50" fill="#000" />
    </svg>
  ),
  // 3. Liquid Melting Amoeba O
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 C68 4 86 20 84 48 C82 76 72 96 46 94 C20 92 2 82 4 52 C6 22 22 8 42 6 Z M44 28 C56 26 62 38 60 52 C58 66 50 74 38 72 C26 70 24 56 26 44 C28 32 34 30 44 28 Z" />
    </svg>
  ),
  // 4. Gothic Diamond Hexagon O
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 L84 34 L84 66 L42 94 L0 66 L0 34 Z M42 28 L62 50 L42 72 L22 50 Z" />
    </svg>
  ),
  // 5. Didone Razor-Vertical O
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 8 C68 8 84 26 84 50 C84 74 68 92 42 92 C16 92 0 74 0 50 C0 26 16 8 42 8 Z M42 16 C48 16 54 28 54 50 C54 72 48 84 42 84 C36 84 30 72 30 50 C30 28 36 16 42 16 Z" />
    </svg>
  ),
  // 6. Eye of Providence / Portal O
  ({ className }) => (
    <svg viewBox="0 0 85 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M42 6 C66 6 84 24 84 50 C84 76 66 94 42 94 C18 94 0 76 0 50 C0 24 18 6 42 6 Z M42 32 C58 32 70 50 70 50 C70 50 58 68 42 68 C26 68 14 50 14 50 C14 50 26 32 42 32 Z" />
      <circle cx="42" cy="50" r="8" fill="currentColor" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER N VARIANTS (80 x 100) — Inspired directly by video 00:18!
   ══════════════════════════════════════════════════════════════════════ */
const N_Variants: GlyphComponent[] = [
  // 1. Isometric Folded Ribbon N (as seen in video 00:18!)
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L28 8 L28 52 L52 8 L72 8 L72 94 L52 94 L52 50 L28 94 L8 94 Z" />
      <polygon points="52,8 52,50 44,38" fill="#000" opacity="0.4" />
    </svg>
  ),
  // 2. Gothic Spiked Spires N
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L28 8 L54 62 L54 8 L74 8 L74 94 L54 94 L28 40 L28 94 L8 94 Z M8 8 L2 18 L12 18 Z M74 94 L80 84 L70 84 Z" />
    </svg>
  ),
  // 3. Liquid Serpent N
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M10 8 C22 6 26 18 26 32 L26 56 C34 46 44 32 54 20 L54 8 C66 6 72 16 72 30 L72 92 C62 94 56 84 56 70 L56 46 C48 56 38 72 26 84 L26 92 C14 94 10 84 10 70 Z" />
    </svg>
  ),
  // 4. Editorial High-Contrast N
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 10 L22 10 L22 84 L58 10 L74 10 L74 92 L60 92 L60 18 L24 92 L8 92 Z" />
      <circle cx="15" cy="14" r="5" />
      <circle cx="67" cy="88" r="5" />
    </svg>
  ),
  // 5. Brutalist Stencil Slit N
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L26 8 L26 40 L46 8 L72 8 L72 94 L54 94 L54 60 L34 94 L8 94 Z" />
      <line x1="26" y1="44" x2="54" y2="56" stroke="#000" strokeWidth="4" />
    </svg>
  ),
  // 6. Dynamic Arrow Chevron N
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L26 8 L54 54 L54 8 L72 8 L72 94 L54 94 L26 48 L26 94 L8 94 Z M36 34 L46 50 L38 50 Z" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER S VARIANTS (75 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const S_Variants: GlyphComponent[] = [
  // 1. Liquid Molten Serpent S
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M58 18 C52 10 42 6 32 8 C18 10 12 24 16 36 C20 48 38 52 48 58 C62 66 66 80 58 90 C48 100 24 98 12 86 L18 72 C26 80 38 84 46 80 C52 76 52 68 46 64 C36 58 20 54 12 42 C4 30 8 14 22 6 C36 -2 58 2 68 12 Z" />
      <circle cx="64" cy="14" r="5" />
      <circle cx="14" cy="84" r="5" />
    </svg>
  ),
  // 2. Gothic Tribal Spiked S
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M64 12 L72 26 L52 24 C40 24 28 28 28 36 C28 44 38 48 52 54 C68 60 74 70 72 84 L64 94 L10 94 L4 78 L24 80 C36 80 48 78 48 68 C48 60 38 56 24 50 C8 44 4 34 6 20 Z M38 50 L46 54 L38 58 Z" />
    </svg>
  ),
  // 3. Editorial Swash Ball Terminal S
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M58 20 C50 12 38 8 28 10 C16 12 8 22 10 34 C12 46 26 50 40 56 C56 62 66 70 64 82 C62 94 48 96 34 94 C22 92 12 84 6 74 L16 68 C22 76 30 82 40 82 C48 82 52 76 52 70 C52 62 42 58 30 52 C16 46 4 40 6 26 C8 12 22 4 36 4 C48 4 60 10 68 18 Z" />
      <circle cx="62" cy="18" r="7" />
      <circle cx="10" cy="74" r="7" />
    </svg>
  ),
  // 4. Ribbon Möbius Twist S
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M60 8 L72 24 L52 24 C38 24 28 30 28 40 C28 46 32 50 40 54 L52 58 C64 64 72 72 72 82 L60 94 L12 94 L2 78 L22 78 C36 78 46 72 46 62 C46 56 42 52 34 48 L22 44 C10 38 4 30 4 18 Z" />
      <polygon points="40,54 52,58 34,48" fill="#000" opacity="0.3" />
    </svg>
  ),
  // 5. Brutalist Stepped Block S
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor">
      <path d="M10 8 L72 8 L72 38 L48 38 L48 46 L72 46 L72 94 L10 94 L10 64 L34 64 L34 54 L10 54 Z" />
    </svg>
  ),
  // 6. Cyber Starburst Lightning S
  ({ className }) => (
    <svg viewBox="0 0 75 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M64 8 L72 32 L46 32 C38 32 30 36 30 42 C30 48 38 52 48 56 C64 62 72 70 72 82 L62 94 L10 94 L4 70 L30 70 C38 70 46 66 46 60 C46 54 38 50 28 46 C12 40 6 32 6 20 Z M38 42 C41 47 43 49 47 50 C43 51 41 53 38 58 C35 53 33 51 29 50 C33 49 35 47 38 42 Z" />
    </svg>
  ),
];

/* ══════════════════════════════════════════════════════════════════════
   LETTER H VARIANTS (80 x 100)
   ══════════════════════════════════════════════════════════════════════ */
const H_Variants: GlyphComponent[] = [
  // 1. Gothic Twin Towers Cathedral H
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L28 8 L28 42 L52 42 L52 8 L72 8 L72 94 L52 94 L52 58 L28 58 L28 94 L8 94 Z M8 8 L2 18 L12 18 Z M72 8 L66 18 L76 18 Z M28 42 C36 36 44 36 52 42 L52 58 C44 52 36 52 28 58 Z" />
    </svg>
  ),
  // 2. Liquid Melting Bridge H
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M10 8 C22 6 26 18 26 30 L26 44 C34 46 44 48 54 44 L54 30 C54 18 58 6 70 8 C80 10 82 22 80 34 L74 92 C72 96 62 94 58 90 L58 58 C48 64 36 64 26 58 L26 90 C22 94 12 96 10 92 L4 34 C2 22 4 10 10 8 Z" />
      <circle cx="40" cy="56" r="4" />
    </svg>
  ),
  // 3. Editorial High-Waist Roman H
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 10 L28 10 L28 16 L22 16 L22 86 L28 86 L28 92 L8 92 L8 86 L14 86 L14 16 L8 16 Z M58 10 L78 10 L78 16 L72 16 L72 86 L78 86 L78 92 L58 92 L58 86 L64 86 L64 16 L58 16 Z M22 40 L58 40 L58 44 L22 44 Z" />
    </svg>
  ),
  // 4. Starburst Diamond Cutout H (like video 00:17)
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor" fillRule="evenodd">
      <path d="M8 8 L28 8 L28 38 L52 38 L52 8 L72 8 L72 94 L52 94 L52 62 L28 62 L28 94 L8 94 Z M40 42 C43 47 45 48 50 50 C45 52 43 53 40 58 C37 53 35 52 30 50 C35 48 37 47 40 42 Z" />
    </svg>
  ),
  // 5. Brutalist 45° Chevron Slash H
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <path d="M8 8 L28 8 L28 94 L8 94 Z M52 8 L72 8 L72 94 L52 94 Z M28 42 L52 56 L52 64 L28 50 Z" />
    </svg>
  ),
  // 6. Modular Capsule Linked H
  ({ className }) => (
    <svg viewBox="0 0 80 100" className={className} fill="currentColor">
      <rect x="8" y="8" width="18" height="86" rx="8" />
      <rect x="54" y="8" width="18" height="86" rx="8" />
      <rect x="22" y="44" width="36" height="12" rx="6" />
    </svg>
  ),
];

// Mapping of letters to variants
const GLYPH_VARIANTS: Record<string, GlyphComponent[]> = {
  J: J_Variants,
  A: A_Variants,
  K: K_Variants,
  E: E_Variants,
  M: M_Variants,
  P: P_Variants,
  O: O_Variants,
  N: N_Variants,
  S: S_Variants,
  H: H_Variants,
};

/* ══════════════════════════════════════════════════════════════════════
   INTERACTIVE CHARACTER COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
interface InteractiveCharProps {
  char: string;
  className?: string;
}

export function InteractiveChar({ char, className = '' }: InteractiveCharProps) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const variants = GLYPH_VARIANTS[char.toUpperCase()] || [];

  // When mouse cursor enters: immediately swap to the next alternate character (desktop hover only)
  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    if (variants.length > 0) {
      setVariantIndex((prev) => (prev + 1) % variants.length);
      setIsHovered(true);
    }
  };

  // When mouse cursor leaves: immediately return to default character
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const CurrentVariant = isHovered && variants.length > 0 ? variants[variantIndex] : null;

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`hero-char relative inline-block align-baseline cursor-pointer select-none p-0 m-0 ${className}`}
      aria-hidden="true"
    >
      {/* 
        Fixed In-Flow Base Character:
        When not hovered, it is rendered in normal visible flow.
        When hovered, it turns 'invisible' (visibility: hidden).
        Because 'visibility: hidden' preserves the exact computed layout width, height, and kerning,
        the slot width is 100% fixed and neighboring characters never shift.
      */}
      <span
        className={`select-none pointer-events-none inline-block p-0 m-0 ${
          isHovered && CurrentVariant ? 'invisible' : 'visible'
        }`}
      >
        {char}
      </span>

      {/* 
        Hovered Variant Overlay:
        Positioned absolutely inside the exact bounds of the base character.
        The SVG uses 'w-full h-full object-contain' so it stays strictly within the character slot
        with zero bleed, zero shift, and zero overlap.
      */}
      {isHovered && CurrentVariant && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none p-0 m-0 overflow-hidden">
          <CurrentVariant className="w-full h-full object-contain fill-current select-none pointer-events-none" />
        </span>
      )}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HERO TITLE COMPONENT (ONLY JAKE AMPONSAH)
   ══════════════════════════════════════════════════════════════════════ */
export default function InteractiveHeroTitle() {
  const word1 = 'JAKE';
  const word2 = 'AMPONSAH';

  return (
    <h1
      className="hero-title font-jake text-[clamp(3rem,15vw,12rem)] leading-[0.85] flex flex-col items-center overflow-x-visible select-none tracking-normal"
      aria-label="Jake Amponsah"
    >
      {/* Line 1: JAKE */}
      <span className="hero-line block select-none">
        {/* Mobile & Tablet (<1024px): Original static text with no animation */}
        <span className="lg:hidden block">JAKE</span>
        {/* Desktop & Larger Screens (1024px+): Interactive character hover effect */}
        <span className="hidden lg:inline-flex tracking-normal">
          {word1.split('').map((c, i) => (
            <InteractiveChar key={`jake-${i}`} char={c} />
          ))}
        </span>
      </span>

      {/* Line 2: AMPONSAH */}
      <span className="hero-line block select-none tracking-normal">
        {/* Mobile & Tablet (<1024px): Original static text with no animation */}
        <span className="lg:hidden block">AMPONSAH</span>
        {/* Desktop & Larger Screens (1024px+): Interactive character hover effect */}
        <span className="hidden lg:inline-flex tracking-normal">
          {word2.split('').map((c, i) => (
            <InteractiveChar key={`amponsah-${i}`} char={c} />
          ))}
        </span>
      </span>
    </h1>
  );
}
