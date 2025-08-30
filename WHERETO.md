WHERE TO component — Implementation Spec (Pixel-Perfect Clone)
Source: https://53w53.com/neighborhood/
Section: WHERE TO
Tabs: DINE + SIP, SEE + HEAR, SHOP + BROWSE, MOVE + PLAY
Scope: Desktop, Tablet, Mobile + Accessibility + Reduced Motion


1) Objective and Fidelity
- Goal: Reproduce the WHERE TO component exactly as on the live site including layout, typography, color, spacing, interactions, and motion.
- Devices: Desktop, Tablet, Mobile.
- Accessibility: Full keyboard operability and screen reader semantics (tabs/tabpanel pattern).
- Reduced motion: Respect prefers-reduced-motion with non-animated/low-motion fallbacks.

Important note on exact values
This document specifies structure, behavior, and measurement methodology. For pixel-perfect fidelity, extract exact values (font family, font sizes, color hex, spacing, breakpoints) directly from the live site’s computed styles using your browser DevTools on the WHERE TO section. The structure and logic below match the observed behavior.


2) Component Summary and User Experience
- A large two-line heading begins with “WHERE TO” followed by one active category label (e.g., DINE + SIP). Remaining categories continue inline to the right in reduced contrast (partially visible within the horizontal viewport if the full string overflows).
- Clicking a category updates the active words in the large heading and swaps the content list below to the selected category’s list, with subtle motion/opacity transition.
- Below the heading, a thin horizontal divider line spans the content area.
- The content list is a vertical set of rows. Each row shows:
  - Left: a square thumbnail image
  - Middle: a short title (place/business)
  - Right: a paragraph-sized description
- Rows are separated by subtle hairlines; ample white space maintains a refined editorial feel.

Observed categories and example rows per tab:
- DINE + SIP — includes venues like “53”, “Pebble Bar”, “Le Bernardin”, “Monkey Bar”, etc.
- SEE + HEAR — includes “MoMA”, etc.
- SHOP + BROWSE — includes “Bergdorf Goodman”, etc.
- MOVE + PLAY — includes “Wellness Center”, etc.

Interaction model:
- Tab click swaps the content with a fade/translate transition and updates the heading to show the tapped category at full emphasis.
- Hover effects are minimal/subtle; emphasis is primarily state-driven (active vs inactive).


3) Anatomy (DOM structure)
Suggested semantic structure (tablist/tabpanel pattern):

<section class="where-to" aria-labelledby="where-to-heading">
  <div class="where-to__container">
    <h2 id="where-to-heading" class="where-to__heading">
      <span class="where-to__heading-prefix">WHERE TO</span>
      <nav class="where-to__tablist" role="tablist" aria-label="Where To">
        <!-- Each tab is a button to ensure keyboard/focus semantics -->
        <button role="tab"
                id="tab-dine"
                aria-selected="true"
                aria-controls="panel-dine"
                tabindex="0"
                class="where-to__tab is-active">DINE + SIP</button>
        <button role="tab"
                id="tab-see"
                aria-selected="false"
                aria-controls="panel-see"
                tabindex="-1"
                class="where-to__tab">SEE + HEAR</button>
        <button role="tab"
                id="tab-shop"
                aria-selected="false"
                aria-controls="panel-shop"
                tabindex="-1"
                class="where-to__tab">SHOP + BROWSE</button>
        <button role="tab"
                id="tab-move"
                aria-selected="false"
                aria-controls="panel-move"
                tabindex="-1"
                class="where-to__tab">MOVE + PLAY</button>
      </nav>
    </h2>

    <hr class="where-to__divider" />

    <div class="where-to__panels">
      <section id="panel-dine" role="tabpanel" aria-labelledby="tab-dine">
        <ol class="where-to__list">
          <li class="where-to__row">
            <div class="where-to__thumb"><img ... alt="..." /></div>
            <h3 class="where-to__item-title">53</h3>
            <p class="where-to__item-desc">...</p>
          </li>
          <!-- Additional rows per the live content -->
        </ol>
      </section>

      <section id="panel-see" role="tabpanel" aria-labelledby="tab-see" hidden>
        <!-- rows -->
      </section>

      <section id="panel-shop" role="tabpanel" aria-labelledby="tab-shop" hidden>
        <!-- rows -->
      </section>

      <section id="panel-move" role="tabpanel" aria-labelledby="tab-move" hidden>
        <!-- rows -->
      </section>
    </div>
  </div>
</section>


4) Layout and spacing (Desktop)
- Page container: Use the same max-width and margins as the live site’s content container on this page (inspect the bounding box around WHERE TO rows). The live design uses a generous content width with large side gutters; mirror those values exactly.
- Heading block:
  - “WHERE TO” sits on the first line, left-aligned.
  - Categories continue on the next line (wrapping allowed) in very large text. The active category is full-opacity; the remaining categories appear immediately after, at lower contrast and continue off to the right as needed.
- Divider:
  - A very thin hairline (1 CSS pixel) below the heading group; subtle neutral color.
- Rows:
  - 3-column grid:
    - Column 1: Square thumbnail (left). On desktop the square is visually roughly 160–220 px; use the live site exact size.
    - Column 2: Short title (middle). Align baseline with the description on the right.
    - Column 3: Rich description (right). Multi-line paragraph with comfortable line-height.
  - Vertical rhythm: Generous spacing above/below rows; hairline separator after each row (or between groups) as on the site.
- Alignment: Content appears vertically centered per row relative to the image’s midline. Maintain the exact gutter spacing between columns as observed.


5) Typography
- Font family: Use the exact font from the live site (inspect computed styles on each key element). The site employs refined editorial typography with a brand color; do not substitute.
- Text transform: The heading and categories are uppercase with a plus sign between words (e.g., “DINE + SIP”).
- Letter spacing: Slight tracking on headings; match the computed letter-spacing from the live site.
- Font sizes/weights:
  - Heading “WHERE TO” + categories line: very large display size with a relatively light or regular weight.
  - Row Title: smaller than the display heading; same family; consistent brand color.
  - Description: body size with comfortable line-height; same family or complementary body font; neutral color.
- Extract exact px/rem and weight values from computed styles on:
  - where-to__heading
  - where-to__tab (active/inactive)
  - where-to__item-title
  - where-to__item-desc


6) Color and borders
- Heading/category color: Brand brown/bronze tone (active state full chroma). Inactive categories use the same hue at reduced opacity or lighter tone.
- Body copy: Neutral dark gray/brown (consistent with site typography).
- Dividers/hairlines: Very light neutral (1px).
- Extract exact color values (hex or rgba) from computed styles for all the above.


7) States and Interactions
Tabs (Desktop + Touch)
- Hover (pointer): Inactive categories subtly increase opacity or shift color slightly towards the active tone (no underline).
- Active: The clicked category becomes the emphasized item next to “WHERE TO” in the heading line. The heading text itself updates to read, e.g., “WHERE TO SEE + HEAR”, with the selected label at full opacity.
- Inactive: Remaining categories immediately follow (to the right) with lower contrast and remain clickable. The overflow may be partially visible if the entire line exceeds the container; match the original behavior for clipping/wrapping.

Keyboard/Screen Reader
- Role pattern: role="tablist" on the nav wrapper; each tab has role="tab"; each content panel has role="tabpanel".
- Associate each tab with its panel using aria-controls on the tab and aria-labelledby on the panel.
- Exactly one tab has aria-selected="true" and tabindex="0"; others have aria-selected="false" and tabindex="-1" (roving tabindex).
- Keyboard:
  - Left/Right arrows move focus across tabs without activating them.
  - Enter/Space activates the focused tab (sets it selected, updates heading, swaps panels).
  - Tab/Shift+Tab moves in/out of the tablist and through links inside the panel list items.
- Focus visible: Provide a clear but tasteful focus ring (do not rely on color alone; avoid removing outlines unless replaced with an equally visible custom outline).

Pointer/Touch Targets
- Min 44x44 CSS pixels for any clickable tab area.
- Maintain spacing so accidental mis-taps are minimized on Mobile.


8) Motion and transitions
Observed behavior:
- When a new tab is activated, the heading line updates and the content list below transitions in. The motion is subtle, premium, and not flashy.
- Content panel transition:
  - Fade-in of new panel content.
  - Slight upward or downward translate (on the order of 4–12 px).
  - Duration approx 200–350ms.
  - Easing smooth (cubic-bezier similar to ease-in-out; pick the site’s exact easing if you can inspect it. If unknown, use cubic-bezier(0.4, 0.0, 0.2, 1) then refine to match.)
- Heading category swap:
  - The active category text becomes fully emphasized; others remain at lower contrast. Any reflow/opacity change is instant or utilizes a very short fade (≤150ms).

Implementation guidance:
- Animate transform and opacity only to keep transitions jank-free (no layout-affecting properties).
- Use will-change: transform, opacity cautiously on transitioning elements.
- Reduced motion:
  - Honor prefers-reduced-motion: reduce or remove translate and use a quick crossfade or no animation.

Example CSS snippet (adjust values to exact site):
.where-to__panels[aria-busy="true"] { pointer-events: none; }
.where-to__panel-enter {
  opacity: 0;
  transform: translateY(8px);
}
.where-to__panel-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 280ms ease, transform 280ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .where-to__panel-enter,
  .where-to__panel-enter-active {
    transform: none;
    transition: opacity 140ms linear;
  }
}


9) Responsive behavior
Desktop (≥ the site’s desktop breakpoint)
- Two-line heading with very large type.
- 3-column row layout (square image / title / description).
- Large gutters and line lengths similar to the site.

Tablet (approx 768–1199, match the site’s exact breakpoint)
- Heading remains large but scales down proportionally.
- Row layout may reflow to two columns:
  - Column 1: Square thumbnail
  - Column 2: Title + description stacked (title above description). Maintain spacing that mirrors the desktop rhythm.
- Hairlines and paddings scale to maintain the premium feel.

Mobile (≤ the site’s mobile breakpoint)
- Heading wraps; categories appear on the next line after “WHERE TO”.
- Rows stack vertically:
  - Full-width image (or fixed square scaled to container width), then title, then description.
- Increase vertical spacing and hit areas to preserve readability and touch comfort.
- Ensure the same divider/hairline conventions appear between items.

Exact breakpoints: Extract them by inspecting the site’s CSS. Mirror the values exactly.


10) Assets
- Thumbnails: square crops. Inspect the rendered size (CSS pixels) at each breakpoint and use the same.
- Use high-DPR images or srcset/sizes to preserve sharpness on Retina displays (match the site’s approach).
- Object-fit: cover to maintain square aspect without distortion.
- Lazy-load strategy: If the live site delays offscreen images, mirror that behavior (loading="lazy" or intersection observer).


11) CSS organization (example using CSS Modules/BEM-like naming)
- Variables (extract from site):
  - --where-color-active: [exact rgb/hex from computed style]
  - --where-color-inactive: [exact value or same color with opacity]
  - --where-color-body: [exact value]
  - --where-divider: [exact value]
  - --where-heading-size-desktop/tablet/mobile: [exact values]
  - --where-title-size, --where-body-size: [exact values]
  - --where-gutters-desktop/tablet/mobile: [exact]
- Component classes:
  - where-to, where-to__container, where-to__heading, where-to__heading-prefix
  - where-to__tablist, where-to__tab, is-active
  - where-to__divider
  - where-to__panels, where-to__list, where-to__row
  - where-to__thumb, where-to__item-title, where-to__item-desc

Keep the cascade shallow and avoid global overrides. Use CSS variables for theming tokens, set at the component root, and keep exact values in sync with the live site.


12) JavaScript behavior
State shape:
interface WhereToState {
  active: 'dine' | 'see' | 'shop' | 'move';
}

Initialization:
- Default active tab matches the live site’s default (DINE + SIP observed initially).
- Bind click handlers to each tab button.
- Implement roving tabindex across tabs for keyboard navigation.

Tab activation algorithm:
function activateTab(id) {
  // 1) Update aria-selected and tabindex for tabs
  // 2) Update heading emphasis (active label first/full opacity)
  // 3) Hide non-active panels via hidden attribute
  // 4) Show active panel and run enter transition (set aria-busy during swap)
  // 5) Manage focus behavior (keep focus on the activated tab)
}

Keyboard:
- ArrowLeft/ArrowRight move focus among tabs (without activation).
- Enter/Space activate the focused tab.

Reduced motion:
- If prefers-reduced-motion, disable translate animation and shorten fade.

Performance:
- Do not reflow on every frame; use class toggles and CSS transitions.
- Image loading should not jump content (reserve space or use aspect-ratio).


13) Accessibility details
- Tablist and tab roles with proper ARIA selected states.
- Each panel labeled by its tab via aria-labelledby.
- Ensure color contrast for all text (active and inactive states) meets WCAG AA against the background (match the original hues; if the original misses contrast, keep visual parity but consider adding a non-visual cue for screen readers).
- Focus outline must be visible and not solely rely on color.
- Screen reader names:
  - Tabs are read as “Tab, DINE + SIP, selected” etc.
  - Panel announces on activation: “tabpanel, DINE + SIP” (via aria-labelledby).

Optional enhancement:
- Announce tab changes with a polite live region if content swap timing could cause ambiguity; keep parity with the live experience if they don’t announce.


14) Measurement checklist (to copy exact values from the live site)
Using DevTools on the WHERE TO section:
- Container:
  - Max-width, left/right padding/margins at desktop/tablet/mobile breakpoints.
- Heading:
  - font-family, font-size, line-height, letter-spacing, font-weight
  - color (active and inactive)
  - exact margins above/below
- Tabs:
  - spacing between category labels, opacity or color delta for inactive
  - hover/active transitions (duration, easing)
- Divider:
  - height (1px), color
  - top/bottom margin
- Rows:
  - thumbnail width/height, column gaps
  - title font size/weight/color
  - description font size/line-height/color
  - row vertical padding, separator placement
- Motion:
  - transition-duration(s) on panel/content
  - easing cubic-bezier values
- Breakpoints:
  - CSS media query min/max widths used for this section

Record these directly and set them as CSS variables in your implementation.


15) Example CSS scaffold (fill with exact values from step 14)
/* Variables (replace with exact values) */
.where-to {
  --where-color-active: #000;   /* replace */
  --where-color-inactive: rgba(0,0,0,0.35); /* replace */
  --where-color-body: #000;     /* replace */
  --where-divider: rgba(0,0,0,0.12); /* replace */

  --where-heading-size-d: 7rem;   /* replace */
  --where-heading-size-t: 5.5rem; /* replace */
  --where-heading-size-m: 3rem;   /* replace */

  --where-title-size: 1rem;   /* replace */
  --where-body-size: 1rem;    /* replace */

  --where-gutter-d: 48px;     /* replace */
  --where-gutter-t: 32px;     /* replace */
  --where-gutter-m: 24px;     /* replace */
}

.where-to__heading {
  /* exact font stack/weight/spacing from site */
  color: var(--where-color-active);
  margin: 0 0 24px; /* replace */
  line-height: 0.9; /* replace with exact */
}

@media (min-width: 1200px) { /* replace with exact breakpoint */
  .where-to__heading { font-size: var(--where-heading-size-d); }
}
@media (min-width: 768px) and (max-width: 1199px) { /* replace */
  .where-to__heading { font-size: var(--where-heading-size-t); }
}
@media (max-width: 767px) { /* replace */
  .where-to__heading { font-size: var(--where-heading-size-m); }
}

.where-to__tablist {
  display: inline;
  white-space: normal; /* match live wrapping behavior */
}
.where-to__tab {
  background: none;
  border: 0;
  color: var(--where-color-inactive);
  cursor: pointer;
  padding: 0 0.25em; /* replace */
}
.where-to__tab.is-active[aria-selected="true"] {
  color: var(--where-color-active);
}

.where-to__divider {
  border: 0;
  border-top: 1px solid var(--where-divider);
  margin: 24px 0; /* replace */
}

/* 3-column row on desktop */
.where-to__list { list-style: none; margin: 0; padding: 0; }
.where-to__row {
  display: grid;
  grid-template-columns: auto 1fr 2fr; /* replace with exact column sizes */
  column-gap: var(--where-gutter-d);
  align-items: center;
  padding: 24px 0; /* replace */
  border-top: 1px solid var(--where-divider);
}
.where-to__row:first-child { border-top: none; }

.where-to__thumb { width: 200px; aspect-ratio: 1 / 1; /* replace */ }
.where-to__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.where-to__item-title {
  /* exact font, size, color from site */
}

.where-to__item-desc {
  /* exact font, size, line-height, color from site */
}

/* Panel transitions */
.where-to__panels[aria-busy="true"] { pointer-events: none; }
.where-to__panels .enter { opacity: 0; transform: translateY(8px); }
.where-to__panels .enter-active {
  opacity: 1; transform: translateY(0);
  transition: opacity 280ms ease, transform 280ms ease; /* replace with exact */
}

@media (prefers-reduced-motion: reduce) {
  .where-to__panels .enter,
  .where-to__panels .enter-active { transform: none; transition: opacity 120ms linear; }
}

/* Tablet: shift to 2 columns if matching the live behavior */
@media (max-width: 1199px) { /* replace */
  .where-to__row {
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "thumb title"
      "thumb desc";
    row-gap: 8px; /* replace */
  }
  .where-to__thumb { grid-area: thumb; width: 160px; } /* replace */
  .where-to__item-title { grid-area: title; }
  .where-to__item-desc { grid-area: desc; }
}

/* Mobile: stacked */
@media (max-width: 767px) { /* replace with exact */
  .where-to__row {
    grid-template-columns: 1fr;
    grid-template-areas:
      "thumb"
      "title"
      "desc";
  }
  .where-to__thumb { width: 100%; }
}


16) JavaScript skeleton
const tabs = Array.from(document.querySelectorAll('.where-to__tab'));
const panels = {
  dine: document.getElementById('panel-dine'),
  see: document.getElementById('panel-see'),
  shop: document.getElementById('panel-shop'),
  move: document.getElementById('panel-move'),
};
let active = 'dine';

function setActive(next) {
  if (next === active) return;
  // Update tabs (roving tabindex)
  tabs.forEach(tab => {
    const isActive = tab.id === `tab-${next}`;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  // Update heading emphasis text content if you render dynamic prefix/labels
  // Example: swap DOM nodes so active label is directly after WHERE TO

  // Panels transition
  const currentPanel = panels[active];
  const nextPanel = panels[next];

  currentPanel.hidden = true;
  nextPanel.hidden = false;

  const container = nextPanel.parentElement;
  container.setAttribute('aria-busy', 'true');
  nextPanel.classList.add('enter');
  requestAnimationFrame(() => {
    nextPanel.classList.add('enter-active');
    nextPanel.addEventListener('transitionend', () => {
      nextPanel.classList.remove('enter', 'enter-active');
      container.removeAttribute('aria-busy');
    }, { once: true });
  });

  active = next;
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => setActive(tab.id.replace('tab-', '')));
  tab.addEventListener('keydown', (e) => {
    const idx = tabs.indexOf(document.activeElement);
    if (e.key === 'ArrowRight') {
      const next = tabs[(idx + 1) % tabs.length];
      next.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const next = tabs[(idx - 1 + tabs.length) % tabs.length];
      next.focus();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      setActive(tab.id.replace('tab-', ''));
      e.preventDefault();
    }
  });
});


17) QA checklist (pixel-perfect)
- Heading
  - Font family/weight/size/letter-spacing matches computed values
  - “WHERE TO” on first line, active category immediately following on next line in the same large style
  - Inactive categories appear following the active one with reduced contrast and wrap/clamp exactly as on site
- Colors
  - Active heading/category color exact match
  - Inactive category color/opacity exact match
  - Divider hairline color exact match
  - Title and body copy colors exact match
- Layout
  - Container width and gutters match
  - Row grid column widths and gaps match
  - Thumbnail is a perfect square at all breakpoints
  - Hairlines align and thickness is 1 CSS pixel
- Motion
  - Panel swap duration and easing match
  - No layout jank; transform+opacity only
  - Reduced motion honored
- Accessibility
  - Tab/tabpanel roles correct, ARIA attributes correct
  - Roving tabindex implemented
  - Arrow keys move focus; Space/Enter activates tab
  - Focus outline clearly visible
- Responsive
  - Breakpoints align with the live site
  - Tablet reflow matches (columns/stacking as observed)
  - Mobile stack matches with correct spacing and readable line lengths
- Content
  - All text matches, including punctuation and casing (e.g., “DINE + SIP”, not “Dine + Sip”)
  - Images crop/aspect and alignment match

This specification describes the exact structure and behavior of the WHERE TO component. For true pixel perfection, you must copy the precise visual tokens (font families, sizes, letter spacing, colors, gutter sizes, breakpoints) from the live site’s computed styles at implementation time.
