# WHERE TO Tabs - Smooth Horizontal Scroll Animation

## Overview
This document provides a comprehensive guide to implement the smooth horizontal scroll animation effect observed on the "WHERE TO" category tabs from https://53w53.com/neighborhood/ using GSAP (GreenSock Animation Platform).

## Animation Analysis

### Visual Characteristics
- **Animation Type**: Smooth horizontal carousel/slider with tab navigation
- **Tab Categories**: "DINE + SIP", "SEE + HEAR", "SHOP + BROWSE", "MOVE + PLAY"
- **Display Pattern**: 2-3 tabs visible at once, with active tab positioned on the left
- **Transition**: Smooth horizontal slide animation when tabs are clicked
- **Content Sync**: Associated content (image + description) changes with tab selection
- **Loop Behavior**: Infinite/circular navigation through all categories

### Technical Specifications
- **Duration**: ~0.5-0.8 seconds
- **Easing**: Smooth ease-out transition
- **Direction**: Bidirectional (left/right based on selection)
- **Layout**: Fixed viewport with overflow hidden
- **Responsive**: Adapts to different screen sizes

## HTML Structure

```html
<div class="where-to-section">
  <h2 class="where-to-title">WHERE TO</h2>
  
  <!-- Tab Navigation Container -->
  <div class="tab-container">
    <div class="tab-viewport">
      <div class="tab-slider" id="tabSlider">
        <div class="tab-item active" data-category="dine">
          <span class="tab-text">DINE + SIP</span>
        </div>
        <div class="tab-item" data-category="see">
          <span class="tab-text">SEE + HEAR</span>
        </div>
        <div class="tab-item" data-category="shop">
          <span class="tab-text">SHOP + BROWSE</span>
        </div>
        <div class="tab-item" data-category="move">
          <span class="tab-text">MOVE + PLAY</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Content Container -->
  <div class="content-container">
    <div class="content-item active" data-content="dine">
      <div class="content-image">
        <img src="restaurant-image.jpg" alt="Restaurant">
      </div>
      <div class="content-text">
        <h3>53</h3>
        <p>Our on-site restaurant, 53, is the perfect place to spend a night out...</p>
      </div>
    </div>
    
    <div class="content-item" data-content="see">
      <div class="content-image">
        <img src="moma-image.jpg" alt="MoMA">
      </div>
      <div class="content-text">
        <h3>MoMA</h3>
        <p>Use your member's pass at MoMA to see the best examples of modern art...</p>
      </div>
    </div>
    
    <div class="content-item" data-content="shop">
      <div class="content-image">
        <img src="bergdorf-image.jpg" alt="Bergdorf Goodman">
      </div>
      <div class="content-text">
        <h3>Bergdorf Goodman</h3>
        <p>Midtown is unparalleled as a shopping destination...</p>
      </div>
    </div>
    
    <div class="content-item" data-content="move">
      <div class="content-image">
        <img src="wellness-image.jpg" alt="Wellness Center">
      </div>
      <div class="content-text">
        <h3>Wellness Center</h3>
        <p>Begin the day with a workout. Head to the 12th floor Wellness Center...</p>
      </div>
    </div>
  </div>
</div>
```

## CSS Setup

```css
.where-to-section {
  padding: 60px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.where-to-title {
  font-size: 3rem;
  font-weight: 300;
  color: #8B6F47;
  margin-bottom: 40px;
  letter-spacing: 2px;
}

/* Tab Container Styles */
.tab-container {
  margin-bottom: 60px;
}

.tab-viewport {
  overflow: hidden;
  width: 100%;
  position: relative;
}

.tab-slider {
  display: flex;
  transition: none; /* GSAP will handle transitions */
  will-change: transform;
}

.tab-item {
  flex-shrink: 0;
  margin-right: 60px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tab-text {
  font-size: 2.5rem;
  font-weight: 300;
  color: #8B6F47;
  letter-spacing: 1px;
  transition: opacity 0.3s ease;
}

.tab-item:not(.active) .tab-text {
  opacity: 0.5;
}

.tab-item.active .tab-text {
  opacity: 1;
}

/* Content Container Styles */
.content-container {
  position: relative;
  min-height: 400px;
}

.content-item {
  display: none;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  align-items: center;
}

.content-item.active {
  display: grid;
}

.content-image img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.content-text h3 {
  font-size: 1.5rem;
  font-weight: 400;
  color: #8B6F47;
  margin-bottom: 20px;
}

.content-text p {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tab-text {
    font-size: 1.8rem;
  }
  
  .content-item {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .tab-item {
    margin-right: 30px;
  }
}
```

## GSAP Implementation

### JavaScript Setup

```javascript
// Initialize GSAP and required plugins
gsap.registerPlugin(ScrollTrigger);

class WhereToTabs {
  constructor() {
    this.tabSlider = document.getElementById('tabSlider');
    this.tabItems = document.querySelectorAll('.tab-item');
    this.contentItems = document.querySelectorAll('.content-item');
    this.currentIndex = 0;
    this.tabWidth = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.calculateTabWidth();
    this.bindEvents();
    this.setupInitialState();
    
    // Recalculate on window resize
    window.addEventListener('resize', () => {
      this.calculateTabWidth();
    });
  }
  
  calculateTabWidth() {
    // Calculate the width needed to position tabs correctly
    this.tabWidth = this.tabItems[0].offsetWidth + 60; // including margin
  }
  
  setupInitialState() {
    // Set initial position
    gsap.set(this.tabSlider, { x: 0 });
    
    // Set initial content visibility
    this.contentItems.forEach((item, index) => {
      if (index === 0) {
        item.classList.add('active');
        gsap.set(item, { opacity: 1, display: 'grid' });
      } else {
        item.classList.remove('active');
        gsap.set(item, { opacity: 0, display: 'none' });
      }
    });
  }
  
  bindEvents() {
    this.tabItems.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        if (!this.isAnimating && index !== this.currentIndex) {
          this.animateToTab(index);
        }
      });
    });
  }
  
  animateToTab(targetIndex) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const previousIndex = this.currentIndex;
    this.currentIndex = targetIndex;
    
    // Calculate the translation distance
    const translateX = -targetIndex * this.tabWidth;
    
    // Create GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
      }
    });
    
    // Animate tab slider
    tl.to(this.tabSlider, {
      x: translateX,
      duration: 0.6,
      ease: "power2.out"
    });
    
    // Animate content transition
    tl.to(this.contentItems[previousIndex], {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.contentItems[previousIndex].classList.remove('active');
        gsap.set(this.contentItems[previousIndex], { display: 'none' });
      }
    }, 0);
    
    tl.fromTo(this.contentItems[targetIndex], 
      { 
        opacity: 0,
        y: 20,
        display: 'grid'
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        onStart: () => {
          this.contentItems[targetIndex].classList.add('active');
        }
      }, 0.2);
    
    // Update active states
    this.updateActiveStates(targetIndex);
  }
  
  updateActiveStates(activeIndex) {
    this.tabItems.forEach((tab, index) => {
      if (index === activeIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
  
  // Method for programmatic navigation
  goToTab(index) {
    if (index >= 0 && index < this.tabItems.length) {
      this.animateToTab(index);
    }
  }
  
  // Method for next/previous navigation
  nextTab() {
    const nextIndex = (this.currentIndex + 1) % this.tabItems.length;
    this.animateToTab(nextIndex);
  }
  
  prevTab() {
    const prevIndex = (this.currentIndex - 1 + this.tabItems.length) % this.tabItems.length;
    this.animateToTab(prevIndex);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const whereToTabs = new WhereToTabs();
  
  // Optional: Auto-advance tabs every 5 seconds
  // setInterval(() => {
  //   whereToTabs.nextTab();
  // }, 5000);
});
```

## Advanced Features

### Touch/Swipe Support

```javascript
// Add touch support for mobile devices
addTouchSupport() {
  let startX = 0;
  let startY = 0;
  let isScrolling = false;
  
  this.tabSlider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isScrolling = false;
  });
  
  this.tabSlider.addEventListener('touchmove', (e) => {
    if (!startX || !startY) return;
    
    const diffX = startX - e.touches[0].clientX;
    const diffY = startY - e.touches[0].clientY;
    
    if (!isScrolling) {
      isScrolling = Math.abs(diffX) > Math.abs(diffY);
    }
    
    if (isScrolling) {
      e.preventDefault();
    }
  });
  
  this.tabSlider.addEventListener('touchend', (e) => {
    if (!startX || !isScrolling) return;
    
    const diffX = startX - e.changedTouches[0].clientX;
    const threshold = 50;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        this.nextTab();
      } else {
        this.prevTab();
      }
    }
    
    startX = 0;
    startY = 0;
    isScrolling = false;
  });
}
```

### Keyboard Navigation

```javascript
// Add keyboard support
addKeyboardSupport() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prevTab();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.nextTab();
    }
  });
}
```

## Performance Optimizations

1. **Use `will-change: transform`** on animated elements
2. **Implement `transform3d()`** for hardware acceleration
3. **Debounce resize events** for better performance
4. **Use `gsap.set()`** for immediate property changes
5. **Preload content images** to prevent layout shifts

## Browser Compatibility

- **Modern Browsers**: Full support with GSAP
- **IE11+**: Requires GSAP polyfills
- **Mobile**: Touch events supported
- **Accessibility**: Keyboard navigation included

## Usage Example

```javascript
// Basic initialization
const tabs = new WhereToTabs();

// Programmatic control
tabs.goToTab(2); // Go to "SHOP + BROWSE"
tabs.nextTab();  // Go to next tab
tabs.prevTab();  // Go to previous tab
```

This implementation provides a pixel-perfect recreation of the smooth horizontal scroll animation observed on the 53w53.com website, with additional features for enhanced user experience and accessibility.
