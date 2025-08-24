## Dexcelerate Token Scanner — MVP

### What is this?

Token Scanner renders two side‑by‑side tables (Trending Tokens and New Tokens) with infinite scrolling, real‑time updates via WebSocket, and performant virtualization.

### Key Features

- Two tables: Trending and New, full‑height layout
- Infinite scroll (server pagination), virtualization for >1000 rows
- Real‑time updates (tick and pair‑stats) with price flash feedback
- Local debounced updates and reordering to maintain sort intent
- Per‑table filters (chain, volume, age, exclude honeypots) and realtime toggle
- Essential columns: Token, Exchange, Price, Market Cap, Volume, Price Changes (5m/1h/6h/24h), Age, Buys/Sells, Liquidity, Audit badges
- Visual style inspired by DefiLlama protocol rankings

### Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- @tanstack/react-query for pagination/fetching
- @tanstack/react-table for table logic
- react-virtuoso for virtualization
- Zustand (per‑table store) for rows/filters/realtime + WS handling

### Getting Started

1. Install + start dev server

```bash
yarn install
yarn dev
```

3. Build and preview the build

```bash
yarn build
yarn preview
```

### Tests

- Unit tests cover the core state and runtime logic:
  - Store: merging scanner pages, price/mcap tick updates, pair‑stats audit updates
  - Hook: per‑row subscribe/unsubscribe on mount/unmount
- Run tests:

```bash
yarn test
# or
yarn test:watch
```

### API notes:

You will have to use a no-cors extension from the chrome web store during development
`https://chromewebstore.google.com/detail/allow-cors-access-control/` - or any other extension with similar functionality.

### Architecture Overview

- Per‑table Zustand stores: `createScannerStore(ws)`
  - State: `filters`, `realtimeEnabled`, `rowsById` (Map), `rows` (array), `sort` metadata
  - Actions: `setFilters`, `setRealtime`, `onScannerPairs`, `onTick`, `onPairStats`, `flush`
  - Debounced `flush` batches updates and reorders locally before committing `rows`
- Data fetching: `useScannerQuery` (
  - Paginates `GET /scanner` and forwards pages to the store via `onScannerPairs`
    )
- Real‑time updates: `useScannerUpdates`
  - Connects a per‑table WebSocket, subscribes to scanner filter and per‑row `pair`/`pair-stats`
  - `tick` re‑computes price and market cap; `pair-stats` updates audit fields
  - Debounced store flush reorders locally to maintain the current ranking intent
- Table rendering: `ScannerTable` + `react-virtuoso` + `@tanstack/react-table`
  - Stable row keys, memoized header/components, semantic table HTML
  - Price flashing via transient cell state
- UI components
  - `Filters` per table; token cell with chain/protocol icons, `AuditBadge` set
  - Number formatting with `numeral`

### Files of Interest

- `src/stores/scannerStore.ts`: Zustand store per table
- `src/hooks/useScannerQuery.ts`: React Query -> store forwarding
- `src/hooks/useScannerUpdates.ts`: WebSocket wiring + subscriptions
- `src/components/ScannerTable.tsx`: Virtualized table
- `src/components/Filters.tsx`: Per‑table filters + realtime toggle
- `src/lib/api.ts`, `src/lib/ws.ts`: REST/WS clients (see CORS proxy tip above)
- `src/lib/types.ts`: Shared types and filter presets

### Performance Notes

- Virtualization keeps DOM size small; `rowsById` Map allows in‑place merges
- Debounced `flush` batches UI updates to minimize re‑renders
- Local reordering preserves the active ranking (volume/age/etc.) between server pages and WS ticks

### Limitations / Trade‑offs

- **Local reordering vs server ordering**: The UI reorders locally on debounced flush. Under very high churn, server‑driven ordering may be more consistent.
- **Token/media assets**: Token icons and some metadata are not fetched from external services; rows render gracefully without them.
- **Token icons omitted**: Skipped due to time constraints. Potential follow‑up: integrate CoinGecko or a token metadata service.
- **Sorting breadth**: Broad, arbitrary sorting modes are not implemented to keep focus on “Trending” (volume) and “New” (age), avoiding UX confusion.
- **Schema validation**: Runtime validation of API responses (e.g., with zod) is not included; types assume well‑formed responses.
