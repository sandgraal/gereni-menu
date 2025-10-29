# Halloween Immersion Upgrades

This note tracks the execution status of the seasonal Halloween takeover ideas. Each item now includes a quick status update so d
esign, content, and engineering can see what shipped and what remains on standby.

## 1. Atmosphere & Mood

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
