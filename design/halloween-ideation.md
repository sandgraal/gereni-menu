# Halloween Immersion Upgrades

This note tracks the execution status of the seasonal Halloween takeover ideas. Each item now includes a quick status update so d
esign, content, and engineering can see what shipped and what remains on standby.

## 1. Atmosphere & Mood

- **Dynamic dusk-to-midnight lighting.** Progressively shift the site's background gradient and shadow intensity based on local time once the Halloween theme is enabled. Pair with subtle fog layers that thicken after 8 PM for users who opt into motion effects.
  - **Implementation notes.**
    1. Audit existing seasonal CSS variables to confirm we can drive gradients through `--surface-background` tokens without refactoring shared components.
    2. Prototype gradient and fog sequencing in Storybook (or `/tools/motion-sandbox.html`) and capture CPU/GPU performance metrics on low-end Android and iOS devices.
    3. Extend `scripts/seasonalEffects.js` with a `LightingController` module that listens for `theme:seasonal:init` and `theme:seasonal:toggle` events; gate time-based transitions behind `prefers-reduced-motion`.
    4. Partner with Content to script the lighting narrative (dusk at 4 PM local, midnight at 10 PM local) and QA the experience in at least three time zones.
- **Localized sound cues.** Trigger short positional stingers (owl hoots, distant bells) when users hover key modules like the hero CTA or gallery hotspots. Respect `prefers-reduced-motion` and provide a global mute in the preferences tray.
  - **Implementation notes.**
    1. Source or compose four <5s audio loops and compress to under 30 KB using `ffmpeg`; add to `assets/audio/halloween/` with descriptive filenames.
    2. Extend the existing preference tray with a "Halloween SFX" toggle that persists to `localStorage` (key: `gereni:halloween:sfx`).
    3. Add hover listeners in `scripts/seasonalEffects.js` that dispatch `audio:play` events to the shared sound manager while respecting `prefers-reduced-motion` and the new mute toggle.
    4. QA for accessibility with screen readers and verify the interaction does not conflict with keyboard focus states.
- **Animated candle markers.** Replace static section dividers with flickering candle glyphs whose flame height responds to scroll velocity.
  - **Implementation notes.**
    1. Commission SVG candles sized for `2rem` height and export as inline-friendly assets with independent flame layers.
    2. Implement a lightweight IntersectionObserver that scales flame height between 90%–120% based on scroll velocity, clamped for motion-sensitive users.
    3. Snapshot-test the DOM diff to ensure markers degrade gracefully when JavaScript is disabled.

## 2. Navigation & Discovery

- **Haunted sitemap scavenger hunt.** Hide four "spirit tokens" across the nav and footer. Collecting them unlocks a cackling witch popup.
  - **Implementation notes.**
    1. Define JSON schema for token metadata (`id`, `selector`, `hintCopy`, `rewardCopy`) and store in `data/halloween-tokens.json` for Content localization.
    2. Build a `ScavengerHuntController` that tracks collected token IDs in session storage, surfaces tooltips on hover, and emits a completion event.
    3. Coordinate with Design to produce the reward popup artwork and copy; integrate with the existing modal component for consistency.
    4. Write unit tests covering token collection edge cases (rapid clicks, duplicate IDs) in `tests/seasonalEffects.test.js`.
- **Ghosted breadcrumbs.** Trail a translucent wisp behind the active nav item that slowly dissipates as users scroll, reinforcing page location.
  - **Implementation notes.**
    1. Expand the navigation component to render a pseudo-element that animates via CSS custom properties tied to scroll position.
    2. Ensure the wisp color/opacity meets contrast minimums on all nav backgrounds and disappears entirely when reduced motion is requested.
    3. Add telemetry hooks via `window.dataLayer` to monitor hover engagement and confirm no regression in nav clickthrough rates.

## 3. Content Modules

- **Chef's spellbook carousel.** Transform the featured menu slider into a spellbook with page-flip animation and smoky transitions between signature dishes.
  - **Implementation notes.**
    1. Inventory all carousel assets and copy, then produce a new `spellbook` skin in Figma for stakeholder sign-off.
    2. Update the carousel component to support dual skins (default + spellbook) toggled by the `holiday--halloween` class; ensure pagination and accessibility labels persist.
    3. Prototype WebGL versus CSS-only smoke transitions and select the lighter option that meets 60 FPS on mid-tier hardware.
    4. Document animation timings and easing curves so the QA team can validate against the motion spec.

## 4. Engagement Mechanics

- **Midnight countdown.** Display a ticking clock to the Halloween weekend kickoff; once it passes, swap to a "Tonight's rituals" schedule that updates hourly.
  - **Implementation notes.**
    1. Define kickoff timestamp and fallback copy in `content/halloween.json`; include translations.
    2. Build a countdown component with SSR-friendly markup and hydrate client-side for live ticking using `requestAnimationFrame`.
    3. After countdown expiry, request the hourly schedule from `/api/halloween/schedule` (mock until API lands) and cache results for 15 minutes.
    4. Add monitoring to ensure the component hides gracefully if the API is unavailable.
- **Potion mixer mini-game.** Let visitors drag ingredients into a cauldron to reveal recommended cocktails or desserts, sharing results via prefilled social posts tagged `#GereniHalloween`.
  - **Implementation notes.**
    1. Map drag-and-drop mechanics using the existing `Draggable` utility; confirm compatibility with touch devices via pointer events.
    2. Collaborate with the culinary team on ingredient taxonomy and flavor pairings; encode recipes in `data/potion-mixer.json`.
    3. Build share links for Instagram, X, and Threads with pre-approved copy snippets; respect character limits and UTM tagging standards.
    4. Conduct usability testing with at least five participants to validate clarity and load time (<2.5s on 3G).
- **Augmented reality invites.** Offer QR codes that launch a lightweight web AR mask featuring Gereni branding for guests to share selfies.
  - **Implementation notes.**
    1. Partner with Marketing to finalize AR mask assets and host via 8th Wall or Snap Lens; confirm licensing.
    2. Generate QR codes (SVG + PNG) with `scripts/generate-qr.js` and embed them within the invites module with alt text.
    3. Track scans via unique URLs with appended `utm_campaign=halloween_ar` parameters for analytics.
    4. QA print-readiness for any physical signage that reuses the same codes.

## 5. Accessibility & Inclusivity Enhancements
- Ensure all seasonal copy is available bilingually, mirroring the rest of the site.
  - **Implementation notes.**
    1. Provide Localization with the Halloween copy deck two sprints ahead of launch.
    2. Add automated tests (Jest + i18next) that assert parity between English and Spanish key counts in `content/halloween.json`.
    3. Include accessibility review checklist items for color contrast, motion, and audio cues before release.

## 6. Implementation Notes
- Keep all Halloween-specific assets behind feature flags so they can be disabled after the season without code removal.
- Reuse the existing `holiday--halloween` body class for conditional styles and scripts; extend `scripts/seasonalEffects.js` with custom events to coordinate modules (audio, scavenger hunt state, countdown).
- Prototype motion-heavy components in isolation (`/tools/motion-sandbox.html`) before integration to maintain performance budgets on mobile devices.
- **Implementation roadmap.**
    1. **Sprint 1 – Foundations:** finalize design specs, audit existing seasonal hooks, and set up feature flags plus analytics instrumentation.
    2. **Sprint 2 – Core Interactions:** deliver lighting, sound cues, navigation polish, and countdown components to staging for cross-team QA.
    3. **Sprint 3 – Immersive Extras:** ship the potion mixer mini-game, AR invites, and localized content; run performance sweeps and finalize the release checklist.
- **Dynamic dusk-to-midnight lighting.** ✅ Live. `seasonalEffects.js` now lerps gradients, fog density, and shadow strength based
 on local time, and emits `gereni:halloween-lighting` events for other modules.
- **Localized sound cues.** ✅ Live. Web Audio stingers (hoot, bell, bubbles) fire on key interactions with a global mute toggle th
at respects `prefers-reduced-motion` and persists to `localStorage`.
- **Animated candle markers.** ✅ Live. New `.candle-marker` separators animate flames while gracefully disabling motion for reduce
-pref users.

## 2. Navigation & Discovery

- **Haunted sitemap scavenger hunt.** ✅ Live. Five hidden spirit tokens store progress, trigger audio feedback, and unlock a witc
h cackle dialog on completion.
- **Ghosted breadcrumbs.** ✅ Live. A sticky spectral nav tracks the active section with a wisp controlled by IntersectionObserver u
pdates from `halloweenExperience.js`.

## 3. Content Modules

- **Chef's spellbook carousel.** ✅ Live. Three spell pages animate with flip transitions, audio cues, and accessible maridaje callo
uts via `halloweenExperience.js`.

## 4. Engagement Mechanics

- **Midnight countdown.** ✅ Live. Countdown targets the upcoming Oct 31 kickoff, swaps to a localized ritual schedule post-deadline,
 and rehydrates on language changes.
- **Potion mixer mini-game.** ✅ Live. Drag-and-drop/keyboard-friendly cauldron surfaces localized recipes, shareable copy, and bubb
ling sound effects.
- **Augmented reality invites.** ✅ Live. Two AR invite cards with stylized QR patterns and external experience links.

## 5. Accessibility & Inclusivity Enhancements

- ✅ All seasonal copy ships with `data-i18n` hooks; audio defaults off for reduced-motion users; the token celebration dialog is focu
sable and dismissible via keyboard.

## 6. Implementation Notes

- Scripts stay gated by the existing `holiday--halloween` class and dispatch `gereni:halloween-*` events for coordination.
- Seasonal UI logic lives in `scripts/halloweenExperience.js`; fog/candle motion switches off when users request reduced motion.
- `/tools/motion-sandbox.html` remains available for any additional motion experiments.
- Verification: `npm run check:all` rebuilds the static menu, validates prices/menu structure, and runs sync/a11y tests. The social link validator currently reports `ENETUNREACH` due to the container's network sandbox, so re-run on a connected environment before release.
