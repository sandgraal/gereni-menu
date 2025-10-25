# Home Highlights Data Guide

This guide explains how to maintain the `data/home-highlights.json` file that powers the specials and social updates shown on the homepage.

## File location

- **Path:** `data/home-highlights.json`
- **Purpose:** Provides time-sensitive highlights that complement the permanent items stored in `content/menu.md` / `data/menu.json`.

## JSON structure

```jsonc
{
  "ai-generated": boolean,          // optional flag used by automation
  "specialMenus": [
    {
      "title": { "es": string, "en": string },
      "description": { "es": string, "en": string },
      "price": string,             // optional, free-form text shown after title
      "ctaLabel": {                // optional call-to-action button label
        "es": string,
        "en": string
      },
      "url": string                // required absolute URL for the CTA/button
    }
  ],
  "socialUpdates": [
    {
      "title": { "es": string, "en": string },
      "description": { "es": string, "en": string },
      "ctaLabel": { "es": string, "en": string },  // optional
      "url": string
    }
  ]
}
```

### Field details

- **`title` / `description`**: Provide Spanish (`es`) and English (`en`) translations. Keep both versions updated whenever you add or edit an entry to avoid mismatched copy between languages.
- **`price`**: Optional; leave it out for experiences or updates that do not display pricing.
- **`ctaLabel`**: Optional; include when you need a button with explicit copy. If omitted, the layout will simply link the card using the `url`.
- **`url`**: Required. Use full URLs (including `https://`).
- **Ordering**: Cards render in the same order they appear in each array.

## Editing workflow

1. Duplicate an existing object when adding a new highlight, and update the translated fields and URLs.
2. Reorder cards by moving the entire object (including braces and commas) to the desired position in the array.
3. Remove a card by deleting the object and the trailing comma from the list. Double-check that the remaining JSON uses valid commas between entries.
4. When translations are not yet ready, either provide a temporary placeholder (`"en": "TBD"`) or omit the item until both languages are available—never mix Spanish and English within the same string.

## Validation

- Run `npm run check:all` to ensure the build scripts can parse all JSON files before committing.
- You can also spot-check just this file with `node -e "JSON.parse(require('fs').readFileSync('data/home-highlights.json', 'utf8'))"`.

## Publishing cadence for social links

- Refresh links to Instagram Stories, Facebook events, and similar social posts at least **twice per week** so that visitors are not sent to expired content.
- Replace event-specific URLs as soon as the event has passed and archive the previous highlight if it is no longer relevant.
- Coordinate with the marketing calendar to ensure upcoming campaigns are reflected here 3–5 days before launch.
