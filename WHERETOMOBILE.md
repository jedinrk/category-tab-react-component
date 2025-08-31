# WHERE TO Mobile Component — Implementation Spec (Pixel-Perfect Clone)

**Source:** https://53w53.com/neighborhood/  
**Section:** WHERE TO (Mobile View)  
**Tabs:** DINE + SIP, SEE + HEAR, SHOP + BROWSE, MOVE + PLAY  
**Scope:** Mobile Responsive Design + Touch Interactions + Horizontal Scrolling  

---

## 1) Mobile-Specific Overview

The mobile version of the WHERE TO component differs significantly from the desktop layout in several key areas:

- **Horizontal Tab Layout:** Unlike desktop where tabs wrap naturally, mobile displays tabs in a horizontally scrollable container
- **Increased Heading Margin:** More generous spacing between "WHERE TO" heading and the tab navigation
- **Reduced Divider Spacing:** Tighter margin between the horizontal divider and tab container
- **Stacked Content Layout:** Content items stack vertically instead of the desktop's 3-column grid
- **Touch-Optimized Interactions:** Larger touch targets and swipe gestures for tab navigation

---

## 2) Mobile Layout Structure

### Heading Section
```
WHERE TO
[generous margin - 32-40px]
[Horizontally scrollable tab container]
DINE + SIP    SEE + HEAR    SHOP + BROWSE    MOVE + PLAY
[reduced margin - 16-20px]
[Thin horizontal divider]
[Content area with stacked layout]
```

### Key Mobile Differences:
- **Heading Isolation:** "WHERE TO" stands alone on the first line with increased bottom margin
- **Tab Scrolling:** Tabs are contained in a horizontal scroll container, showing 1.5-2.5 tabs at once
- **Active Tab Positioning:** Active tab scrolls to the left-most visible position
- **Reduced Divider Gap:** Less vertical space between tabs and divider compared to desktop

---

## 3) Mobile Breakpoints & Responsive Behavior

### Primary Mobile Breakpoint: ≤ 767px
```css
@media (max-width: 767px) {
  /* Mobile-specific styles */
}
```

### Tablet Transition: 768px - 1023px
```css
@media (min-width: 768px) and (max-width: 1023px) {
  /* Hybrid behavior - may use mobile tab scrolling with larger fonts */
}
```

---

## 4) Mobile Typography Specifications

### Heading "WHERE TO"
- **Font Size:** 2.5rem - 3.5rem (scaled down from desktop 7rem)
- **Line Height:** 1.1
- **Letter Spacing:** 1.5px - 2px
- **Margin Bottom:** 32px - 40px (increased from desktop 24px)
- **Color:** Brand brown/bronze (#8B6F47 or extract exact from site)

### Tab Labels
- **Font Size:** 1.4rem - 1.8rem (scaled down from desktop 2.5rem)
- **Line Height:** 1.2
- **Letter Spacing:** 0.8px - 1px
- **Active Opacity:** 1.0
- **Inactive Opacity:** 0.5 - 0.6
- **Touch Target:** Minimum 44px height, 60px+ width

### Content Typography
- **Title Font Size:** 1.2rem - 1.4rem
- **Description Font Size:** 0.9rem - 1rem
- **Line Height:** 1.5 - 1.6

---

## 5) Mobile Spacing & Layout Specifications

### Container Spacing
```css
.where-to-mobile {
  padding: 0 20px; /* Side gutters */
  max-width: 100%;
}
```

### Heading Margins
```css
.where-to__heading {
  margin-bottom: 36px; /* Increased from desktop 24px */
  font-size: 3rem;
  line-height: 1.1;
}
```

### Tab Container
```css
.where-to__tab-container {
  margin-bottom: 18px; /* Reduced from desktop 24px */
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Hide scrollbar */
  -ms-overflow-style: none;
}

.where-to__tab-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar for webkit */
}
```

### Tab Spacing
```css
.where-to__tab-slider {
  display: flex;
  gap: 32px; /* Space between tabs */
  padding: 0 20px; /* Match container padding */
}

.where-to__tab {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 12px 8px; /* Touch-friendly padding */
  min-width: 44px; /* Minimum touch target */
}
```

### Divider Specifications
```css
.where-to__divider {
  margin: 18px 0 24px; /* Reduced top margin, standard bottom */
  border-top: 1px solid rgba(139, 111, 71, 0.2);
  width: 100%;
}
```

---

## 6) Mobile Content Layout

### Stacked Content Structure
```css
.where-to__content-item {
  display: block; /* Override desktop grid */
  margin-bottom: 32px;
}

.where-to__content-image {
  width: 100%;
  margin-bottom: 16px;
}

.where-to__content-image img {
  width: 100%;
  height: 200px; /* Fixed height for consistency */
  object-fit: cover;
  border-radius: 4px; /* Optional subtle rounding */
}

.where-to__content-title {
  margin-bottom: 12px;
  font-size: 1.3rem;
  font-weight: 400;
}

.where-to__content-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
}
```

---

## 7) Horizontal Scrolling Implementation

### CSS Setup
```css
.where-to__tab-viewport {
  position: relative;
  overflow: hidden;
  margin: 0 -20px; /* Extend to screen edges */
}

.where-to__tab-slider {
  display: flex;
  transition: transform 0.3s ease-out;
  will-change: transform;
  padding: 0 20px;
}

/* Smooth scrolling behavior */
.where-to__tab-container {
  scroll-behavior: smooth;
}
```

### JavaScript Mobile Scroll Logic
```javascript
class WhereToMobile {
  constructor() {
    this.tabContainer = document.querySelector('.where-to__tab-container');
    this.tabs = document.querySelectorAll('.where-to__tab');
    this.activeIndex = 0;
    this.init();
  }
  
  init() {
    this.bindTouchEvents();
    this.bindTabClicks();
    this.scrollToActiveTab();
  }
  
  scrollToActiveTab(index = this.activeIndex) {
    const activeTab = this.tabs[index];
    const containerWidth = this.tabContainer.offsetWidth;
    const tabLeft = activeTab.offsetLeft;
    const tabWidth = activeTab.offsetWidth;
    
    // Scroll to position active tab on the left with some padding
    const scrollPosition = Math.max(0, tabLeft - 20);
    
    this.tabContainer.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }
  
  bindTabClicks() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.setActiveTab(index);
        this.scrollToActiveTab(index);
      });
    });
  }
  
  bindTouchEvents() {
    let startX = 0;
    let scrollLeft = 0;
    
    this.tabContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - this.tabContainer.offsetLeft;
      scrollLeft = this.tabContainer.scrollLeft;
    });
    
    this.tabContainer.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const x = e.touches[0].pageX - this.tabContainer.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      this.tabContainer.scrollLeft = scrollLeft - walk;
    });
  }
}
```

---

## 8) Touch Interaction Specifications

### Touch Targets
- **Minimum Size:** 44px × 44px (iOS/Android guidelines)
- **Recommended Size:** 48px × 48px for better usability
- **Spacing:** 8px minimum between touch targets

### Touch Feedback
```css
.where-to__tab {
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.where-to__tab:active {
  transform: scale(0.95);
  opacity: 0.7;
}

/* Hover states for devices that support it */
@media (hover: hover) {
  .where-to__tab:hover {
    opacity: 0.8;
  }
}
```

### Swipe Gestures
- **Horizontal Swipe:** Navigate between tabs
- **Swipe Threshold:** 50px minimum movement
- **Swipe Velocity:** Consider velocity for faster navigation
- **Momentum Scrolling:** Enable `-webkit-overflow-scrolling: touch`

---

## 9) Mobile Animation & Transitions

### Tab Switching Animation
```css
.where-to__content-panel {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.where-to__content-panel.entering {
  opacity: 0;
  transform: translateY(20px);
}

.where-to__content-panel.active {
  opacity: 1;
  transform: translateY(0);
}

.where-to__content-panel.exiting {
  opacity: 0;
  transform: translateY(-10px);
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .where-to__tab-slider,
  .where-to__content-panel {
    transition: opacity 0.1s linear;
    transform: none !important;
  }
  
  .where-to__tab-container {
    scroll-behavior: auto;
  }
}
```

---

## 10) Mobile Performance Optimizations

### Image Loading
```css
.where-to__content-image img {
  loading: lazy; /* Native lazy loading */
  decoding: async;
}
```

### Hardware Acceleration
```css
.where-to__tab-slider {
  transform: translateZ(0); /* Force hardware acceleration */
  will-change: transform;
}
```

### Scroll Performance
```css
.where-to__tab-container {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}
```

---

## 11) Accessibility for Mobile

### Screen Reader Support
```html
<div class="where-to__tab-container" 
     role="tablist" 
     aria-label="Where To Categories"
     aria-orientation="horizontal">
  
  <button class="where-to__tab" 
          role="tab"
          aria-selected="true"
          aria-controls="panel-dine"
          id="tab-dine">
    DINE + SIP
  </button>
</div>
```

### Focus Management
```css
.where-to__tab:focus {
  outline: 2px solid #8B6F47;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Ensure focus is visible during keyboard navigation */
.where-to__tab:focus:not(:focus-visible) {
  outline: none;
}

.where-to__tab:focus-visible {
  outline: 2px solid #8B6F47;
  outline-offset: 2px;
}
```

### Keyboard Navigation on Mobile
- **Tab Key:** Move between tab buttons
- **Arrow Keys:** Navigate horizontally between tabs
- **Enter/Space:** Activate selected tab
- **Swipe Gestures:** Alternative to keyboard for touch users

---

## 12) Mobile-Specific CSS Variables

```css
:root {
  /* Mobile Typography */
  --where-heading-size-mobile: 3rem;
  --where-tab-size-mobile: 1.6rem;
  --where-content-title-mobile: 1.3rem;
  --where-content-body-mobile: 1rem;
  
  /* Mobile Spacing */
  --where-heading-margin-mobile: 36px;
  --where-tab-margin-mobile: 18px;
  --where-divider-margin-mobile: 18px 0 24px;
  --where-content-gap-mobile: 32px;
  --where-side-padding-mobile: 20px;
  
  /* Mobile Touch Targets */
  --where-touch-target-min: 44px;
  --where-touch-target-recommended: 48px;
  --where-touch-spacing: 8px;
  
  /* Mobile Colors */
  --where-color-active-mobile: #8B6F47;
  --where-color-inactive-mobile: rgba(139, 111, 71, 0.5);
  --where-divider-mobile: rgba(139, 111, 71, 0.2);
}
```

---

## 13) Implementation Checklist for Mobile

### Layout Verification
- [ ] "WHERE TO" heading displays on separate line with 36px bottom margin
- [ ] Tabs are horizontally scrollable with smooth momentum scrolling
- [ ] Active tab scrolls to left-most position when selected
- [ ] Divider has reduced 18px top margin (vs desktop 24px)
- [ ] Content stacks vertically with proper spacing

### Typography Verification
- [ ] Heading scales to 3rem on mobile (down from desktop 7rem)
- [ ] Tab labels scale to 1.6rem (down from desktop 2.5rem)
- [ ] Content titles and descriptions use mobile-optimized sizes
- [ ] Letter spacing and line heights are mobile-appropriate

### Touch Interaction Verification
- [ ] All tabs have minimum 44px touch targets
- [ ] Touch feedback (scale/opacity) works on tap
- [ ] Horizontal swipe gestures navigate between tabs
- [ ] Momentum scrolling enabled for tab container
- [ ] No accidental vertical scrolling during horizontal swipes

### Accessibility Verification
- [ ] Screen readers announce tab changes correctly
- [ ] Keyboard navigation works with arrow keys
- [ ] Focus indicators are visible and properly styled
- [ ] ARIA attributes are correctly implemented
- [ ] Color contrast meets WCAG AA standards

### Performance Verification
- [ ] Images lazy load on mobile
- [ ] Hardware acceleration enabled for animations
- [ ] Smooth 60fps scrolling performance
- [ ] No layout thrashing during interactions
- [ ] Reduced motion preferences respected

---

## 14) Mobile Testing Guidelines

### Device Testing Matrix
- **iPhone SE (375px):** Minimum mobile width
- **iPhone 12/13 (390px):** Standard mobile width
- **iPhone 12/13 Pro Max (428px):** Large mobile width
- **Android Small (360px):** Common Android width
- **Android Large (414px):** Large Android width

### Interaction Testing
1. **Tab Navigation:** Verify smooth horizontal scrolling
2. **Touch Targets:** Ensure all tabs are easily tappable
3. **Swipe Gestures:** Test left/right swipe functionality
4. **Content Switching:** Verify smooth content transitions
5. **Orientation Changes:** Test portrait/landscape behavior

### Performance Testing
- **Scroll Performance:** 60fps during tab scrolling
- **Animation Performance:** Smooth content transitions
- **Memory Usage:** No memory leaks during extended use
- **Battery Impact:** Minimal battery drain from animations

---

## 15) Common Mobile Implementation Pitfalls

### Spacing Issues
- **Incorrect Margins:** Using desktop margins instead of mobile-specific values
- **Touch Target Size:** Making tabs too small for comfortable tapping
- **Content Overflow:** Not accounting for longer text on smaller screens

### Scrolling Problems
- **Momentum Scrolling:** Forgetting `-webkit-overflow-scrolling: touch`
- **Scroll Indicators:** Not hiding scrollbars properly
- **Bounce Effect:** Unwanted vertical bouncing during horizontal scrolls

### Performance Issues
- **Heavy Animations:** Using layout-affecting properties in transitions
- **Memory Leaks:** Not cleaning up event listeners properly
- **Reflow/Repaint:** Causing unnecessary layout calculations

### Accessibility Oversights
- **Focus Management:** Not handling focus properly during tab changes
- **Screen Reader Support:** Missing or incorrect ARIA labels
- **Keyboard Navigation:** Not supporting arrow key navigation

---

## 16) Mobile-Specific Code Example

### Complete Mobile Implementation
```html
<section class="where-to where-to--mobile" aria-labelledby="where-to-heading">
  <div class="where-to__container">
    <!-- Mobile Heading with Increased Margin -->
    <h2 id="where-to-heading" class="where-to__heading where-to__heading--mobile">
      WHERE TO
    </h2>

    <!-- Mobile Tab Container with Horizontal Scroll -->
    <div class="where-to__tab-viewport">
      <div class="where-to__tab-container" role="tablist" aria-label="Where To Categories">
        <button role="tab" class="where-to__tab where-to__tab--active" 
                aria-selected="true" aria-controls="panel-dine">
          DINE + SIP
        </button>
        <button role="tab" class="where-to__tab" 
                aria-selected="false" aria-controls="panel-see">
          SEE + HEAR
        </button>
        <button role="tab" class="where-to__tab" 
                aria-selected="false" aria-controls="panel-shop">
          SHOP + BROWSE
        </button>
        <button role="tab" class="where-to__tab" 
                aria-selected="false" aria-controls="panel-move">
          MOVE + PLAY
        </button>
      </div>
    </div>

    <!-- Mobile Divider with Reduced Margin -->
    <hr class="where-to__divider where-to__divider--mobile" />

    <!-- Mobile Content with Stacked Layout -->
    <div class="where-to__content">
      <div id="panel-dine" role="tabpanel" class="where-to__panel where-to__panel--active">
        <div class="where-to__content-item where-to__content-item--mobile">
          <div class="where-to__content-image">
            <img src="restaurant-53.jpg" alt="Restaurant 53 interior" loading="lazy">
          </div>
          <h3 class="where-to__content-title">53</h3>
          <p class="where-to__content-description">
            Our on-site restaurant, 53, is the perfect place to spend a night out 
            (that's technically a night in). Enjoy innovative Asian-inspired cuisine 
            from acclaimed Singapore-born chef Akmal Anuar in a stylish contemporary 
            interior designed by ICRAVE.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Mobile-Specific CSS
```css
/* Mobile-specific overrides */
@media (max-width: 767px) {
  .where-to--mobile .where-to__heading {
    font-size: var(--where-heading-size-mobile);
    margin-bottom: var(--where-heading-margin-mobile);
  }
  
  .where-to--mobile .where-to__tab-container {
    margin-bottom: var(--where-tab-margin-mobile);
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .where-to--mobile .where-to__divider {
    margin: var(--where-divider-margin-mobile);
  }
  
  .where-to--mobile .where-to__content-item {
    display: block;
    margin-bottom: var(--where-content-gap-mobile);
  }
}
```

---

## 17) Final Notes for Developers

### Key Mobile Differences Summary
1. **Increased heading margin:** 36px vs desktop 24px
2. **Reduced divider margin:** 18px vs desktop 24px  
3. **Horizontal tab scrolling:** Instead of wrapping
4. **Stacked content layout:** Instead of 3-column grid
5. **Touch-optimized interactions:** 44px+ touch targets

### Implementation Priority
1. **Layout Structure:** Get the basic mobile layout working first
2. **Spacing Adjustments:** Apply the specific margin differences
3. **Horizontal Scrolling:** Implement smooth tab scrolling
4. **Touch Interactions:** Add touch feedback and gestures
5. **Performance Optimization:** Ensure smooth 60fps performance

### Testing Recommendations
- Test on actual devices, not just browser dev tools
- Verify touch interactions work smoothly
- Check performance on lower-end devices
- Validate accessibility with screen readers
- Test in both portrait and landscape orientations

This specification provides pixel-perfect implementation guidelines for the mobile version of the WHERE TO component, addressing all the key differences mentioned in the requirements: horizontal tab listing, increased heading margins, and reduced divider spacing.
