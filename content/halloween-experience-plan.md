# Halloween Experience Game Plan

**Date:** Tomorrow (see `PROJECT_PLAN.md` for baseline milestones)
**Location:** Home hero panel + venue interior screens

## Creative Direction
- Over-the-top haunted lounge vibe that still matches the brand's deep purple and amber palette.
- Focus on motion-driven surprises: glowing lantern haze, swooping bats, and now a *random spider drop scare*.
- Keep intensity adjustable so we can respect accessibility preferences (`prefers-reduced-motion`).

## Interactive Effects Checklist
| Area | Effect | Notes |
|------|--------|-------|
| Landing hero (`inicio` body) | Seasonal overlay with glow, bats, lanterns | Already live. Review color balance after spider addition. |
| Landing hero (`inicio` body) | **New** random spider drop | Ensure `scripts/seasonalEffects.js` stays performant; cap simultaneous spiders ≤ 4. |
| Menu panel carousel | Flag featured Halloween cocktail card with `data-seasonal-effect="halloween"` so overlay activates immediately. |
| Secondary CTA buttons | Add subtle shake on hover (CSS micro-interaction) if time allows. |
| Social bar | Queue up #GereniHalloween hashtag with neon glow when overlay is active. |

## Asset Readiness
- [x] Seasonal overlay markup enhanced with spider layer (`scripts/seasonalEffects.js`).
- [x] Spider visual styling and animation added to `styles/main.css`.
- [ ] Confirm audio sting (15s ambient whisper or violin scrape) — optional scare toggle via mute icon.
- [ ] Export updated hero background from Canva with extra shadow depth.
- [ ] Gather high-res PNG of specialty cocktail garnish for supporting card art.

## QA & Testing Plan
1. **Desktop Chrome** — Verify spiders spawn in < 10s, do not accumulate indefinitely, and respond to reduced-motion setting.
2. **iPad Safari** — Confirm overlays do not overflow, and pointer events remain disabled on the seasonal layer.
3. **Low-end Android** — Measure animation smoothness; adjust `MAX_ACTIVE_SPIDERS` if < 45fps sustained.
4. **Accessibility** — Toggle system reduced-motion to ensure overlay gracefully falls back with no spiders/bats.
5. **Performance** — Use DevTools performance panel to ensure heap allocations for spiders are released on animation end.

## Rollout Timeline
| Time | Task |
|------|------|
| 08:30 | Final review of overlay visuals and run regression (`npm run check:all`). |
| 09:00 | Sync menu content to highlight Halloween specials. |
| 10:00 | QA sweep (desktop + mobile) with screenshots for social promo. |
| 11:00 | Optional: Add ambient sound toggle if performance budget allows. |
| 12:00 | Lunch & retro meeting — confirm scare factor with on-site staff. |
| 14:00 | Publish PR + deploy to staging, share preview link with marketing. |
| 16:00 | Buffer for emergency tweaks or animation pacing adjustments. |

## Next Steps After Launch
- Capture visitor reactions for social reels; mark best clips for evening push.
- [x] Add analytics event (`halloween_spider_drop_seen`) so we can measure engagement vs. bounce.
- Prep quick disable flag (`?no-spiders`) in case guests report discomfort mid-event.
- Document learnings in `PROJECT_PLAN.md` retrospective section after the event.
