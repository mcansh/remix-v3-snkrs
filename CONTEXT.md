# Context

## Glossary

- **Owned** — A sneaker in the user's collection that has not been sold
- **Sold** — A sneaker the user previously owned but has sold (tracked via `sold` boolean, `sold_date`, `sold_price`)
- **Brand** — Stored as-entered for display; `brand_slug` stores normalized slug for filtering
- **Showcase** — Public grid display of a user's sneaker collection at `/:username/sneakers`
- **Card** — Grid item showing sneaker image, brand, model, colorway, purchase price, and sold status
- **Detail page** — Individual sneaker view at `/:username/sneakers/:sneakerId`

## Routes

- `/:username/sneakers` — All sneakers (owned + sold)
- `/:username/sneakers/owned` — Only owned
- `/:username/sneakers/sold` — Only sold

## Query params

- `?brand=` — Filter by brand (case-insensitive)
- `?sort=` — Sort direction (`asc` or `desc`, default by purchase date)
- `?page=` — Pagination (12 or 24 per page, configurable)
