# Halloween Immersion Upgrades

This note compiles high-impact, on-brand ideas to push the seasonal Halloween takeover beyond the existing overlay. Concepts are grouped by experience layer so design, content, and engineering teams can parallelize implementation.

## 1. Atmosphere & Mood

- **Dynamic dusk-to-midnight lighting.** Progressively shift the site's background gradient and shadow intensity based on local time once the Halloween theme is enabled. Pair with subtle fog layers that thicken after 8 PM for users who opt into motion effects.
- **Localized sound cues.** Trigger short positional stingers (owl hoots, distant bells) when users hover key modules like the hero CTA or gallery hotspots. Respect `prefers-reduced-motion` and provide a global mute in the preferences tray.
- **Animated candle markers.** Replace static section dividers with flickering candle glyphs whose flame height responds to scroll velocity.

## 2. Navigation & Discovery

- **Haunted sitemap scavenger hunt.** Hide four "spirit tokens" across the nav and footer. Collecting them unlocks an cackling witch popup.
- **Ghosted breadcrumbs.** Trail a translucent wisp behind the active nav item that slowly dissipates as users scroll, reinforcing page location.

## 3. Content Modules

- **Chef's spellbook carousel.** Transform the featured menu slider into a spellbook with page-flip animation and smoky transitions between signature dishes.

## 4. Engagement Mechanics

- **Midnight countdown.** Display a ticking clock to the Halloween weekend kickoff; once it passes, swap to a "Tonight's rituals" schedule that updates hourly.
- **Potion mixer mini-game.** Let visitors drag ingredients into a cauldron to reveal recommended cocktails or desserts, sharing results via prefilled social posts tagged `#GereniHalloween`.
- **Augmented reality invites.** Offer QR codes that launch a lightweight web AR mask featuring Gereni branding for guests to share selfies.

## 5. Accessibility & Inclusivity Enhancements
- Ensure all seasonal copy is available bilingually, mirroring the rest of the site.

## 6. Implementation Notes
- Keep all Halloween-specific assets behind feature flags so they can be disabled after the season without code removal.
- Reuse the existing `holiday--halloween` body class for conditional styles and scripts; extend `scripts/seasonalEffects.js` with custom events to coordinate modules (audio, scavenger hunt state, countdown).
- Prototype motion-heavy components in isolation (`/tools/motion-sandbox.html`) before integration to maintain performance budgets on mobile devices.
