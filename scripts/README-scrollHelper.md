# Scroll Helper

The scroll helper (`scrollHelper.js`) manages scroll limit computation for the menu container and ensures that scroll-dependent UI components remain accurate when content height changes.

## Features

- Automatically recomputes scroll limits on:
  - Window resize
  - Device orientation change
  - Language change (when translations alter content height)
  - Menu render events

- Batches updates using `requestAnimationFrame` for optimal performance
- Provides subscription API for reactive updates
- Dispatches custom events for loose coupling

## Usage

### Get Current Max Scroll

```javascript
const maxScroll = window.GereniScrollHelper.getMaxScroll();
console.log('Maximum scroll distance:', maxScroll);
```

### Subscribe to Updates

```javascript
const unsubscribe = window.GereniScrollHelper.subscribe((maxScroll) => {
  console.log('Scroll limits updated:', maxScroll);
  // Update your slider, scroll indicator, or bottom button position
});

// Later, to unsubscribe:
unsubscribe();
```

### Listen to Events

```javascript
document.addEventListener('gereni:scrollLimitsUpdated', (event) => {
  const { maxScroll } = event.detail;
  console.log('Scroll limits updated via event:', maxScroll);
});
```

### Force Recomputation

```javascript
// Immediately recompute and notify subscribers
window.GereniScrollHelper.recompute();

// Or schedule an update for the next animation frame
window.GereniScrollHelper.scheduleUpdate();
```

## Integration

The scroll helper is automatically integrated into `menu.html` and initializes on page load. It listens to the following events:

- `resize` (window)
- `orientationchange` (window)
- `gereni:languagechange` (document)
- `gereni:menuRendered` (document)

## Example: Scroll Indicator

Here's an example of using the scroll helper to create a scroll progress indicator:

```javascript
// Create a scroll progress bar
const progressBar = document.createElement('div');
progressBar.style.cssText = 'position: fixed; top: 0; left: 0; height: 3px; background: blue;';
document.body.appendChild(progressBar);

// Update progress bar width based on scroll position
function updateProgress() {
  const container = document.getElementById('menu-container');
  if (!container) return;
  
  const maxScroll = window.GereniScrollHelper.getMaxScroll();
  const currentScroll = container.scrollTop;
  const progress = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;
  
  progressBar.style.width = `${progress}%`;
}

// Subscribe to scroll limit updates
window.GereniScrollHelper.subscribe(() => {
  updateProgress();
});

// Listen to scroll events
document.getElementById('menu-container')?.addEventListener('scroll', updateProgress);
```

## Testing

Run the scroll helper tests:

```bash
npm run test:scroll
```

The tests verify:
- API initialization
- Event dispatching
- Language change event handling
- Window resize event handling
- Menu render event handling
- Subscription functionality
