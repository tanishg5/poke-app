# Pokédex Lite

A responsive Pokédex web app built with **React** and **Vite**. It loads Pokémon data from the public **[PokéAPI](https://pokeapi.co/)**. After **Google sign-in** (Firebase Authentication), you can browse and paginate results, search by name, filter by one or more types with OR semantics, persist favorites in the browser (`localStorage`), and open a detail modal with stats and abilities.

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended) — `npm` is included with Node.

---

## Installing dependencies & running the app

From this project directory (`PokeApp`):

```bash
npm install
```

### Development server

```bash
npm run dev
```

Then open the URL shown in the terminal (Vite defaults to `http://localhost:5173`).

### Other scripts

| Script            | Purpose |
|-------------------|---------|
| `npm run build`   | Production build → output in `dist/` |
| `npm run preview` | Serve the production build locally (after `build`) |
| `npm run lint`    | Run ESLint against `**/*.{js,jsx}` |

---

## Technologies & libraries — why they’re used

| Technology | Role |
|------------|------|
| **React 19** | UI composition, concurrent-friendly patterns, hooks for state/effects (`useSyncExternalStore` for favorites, async effects guarded against stale updates). |
| **Vite** | Fast dev server with HMR, optimized production bundles, native ESM, simple config (`@vitejs/plugin-react` for JSX/Refresh). |
| **Firebase (JS SDK)** | **Authentication** via Google (`signInWithPopup`, `GoogleAuthProvider`) — gate access to the app; **Analytics** optionally initialized behind `try/catch` when the runtime supports it. |
| **CSS Modules** (`*.module.css`) | Scoped styling per component (e.g. `App.module.css`, `LoginPage.module.css`) — avoids global class collisions without a CSS-in-JS runtime. |

**Data source**: PokéAPI is a free REST API maintained by contributors; this project is **not** affiliated with Nintendo or The Pokémon Company.

---

## About my app

- **Routing**: Single-page shell — `LoginPage` when logged out; main grid + toolbar + pagination + modal when signed in (`App.jsx`).
- **Auth**: Firebase `onAuthStateChanged` resolves before rendering main UI; a minimal boot spinner shows until auth state is known.
- **Favorites**: `useFavorites` keeps a canonical `Set` in memory, persists to `localStorage`, and subscribes with `useSyncExternalStore` so updates stay predictable during concurrent rendering.
- **Pokémon list logic** (`pokeapi.js`, `pokeTransform.js`, `App.jsx`):
  - Default browse uses `GET /pokemon` with pagination, then resolves each visible item’s detail URL.
  - **Search (no type filter)** loads a **name/url index** once (bounded by API count), then filters and paginates client-side.
  - **Type filter** fetches `/type/{name}` (cached in a ref), merges species with **OR** semantics, then filters by search text if present.

---

## Challenges faced & how they were addressed

These map to patterns visible in the codebase (not aspirational claims):

1. **Stale async results** — Multiple `useEffect` flows load types, the name index, the grid, and the modal in parallel. Each uses a **`cancelled` flag** and early returns after `await` so out-of-order responses do not overwrite newer UI state when dependencies change quickly.

2. **Search vs. server pagination** — PokéAPI does not offer a fuzzy “search by substring” endpoint. The project **downloads a shallow list** of `{ name, url }` entries (within API count limits and a safety cap in `fetchPokemonNameIndex`) so substring search works without hammering speculative `GET /pokemon/{name}` guesses.

3. **Multi-type filtering** — Types are loaded per selected type URL; payloads are normalized to unique Pokémon refs (`pokemonRefsFromTypePayload`). Multiple selections are merged in **OR** fashion via `mergeTypeRefs`, with an in-session **cache** keyed by type name.

---

## Forking & Firebase

The Firebase web client configuration lives in **`src/firebase/firebase.js`**. Client API keys are not secret server credentials, but if you fork the project you will typically replace this block with configuration from **your own** Firebase project in the Firebase console so Google sign-in and domains match your deployment.

---

## Bonus features

- **Google OAuth (Firebase Authentication)** — As a bonus, the app integrates **Firebase Authentication** with Google sign-in. Users can securely sign in with their Google account, see profile details (avatar, display name/email) in the header, and sign out successfully.

- **Pokémon card hover micro-interaction** — Cards use a short CSS transition on **`transform`**, **`box-shadow`**, and **`border-color`**: on hover they lift slightly (`translateY`) and read as more elevated, with a subtle accent-tinted border (`PokemonCard.module.css`). Respects **`prefers-reduced-motion`**.

- **Detail modal open / close animation** — The backdrop fades in and applies a light **blur**; the panel **fades in** and **moves up** from below. On wider viewports (`min-width: 640px`), the dialog also **scales up** slightly as it opens. On close, `PokemonModal` keeps the node mounted for the exit duration (`EXIT_MS` in `PokemonModal.jsx`) so the reverse transition is visible before unmounting.

- **Pagination feedback** — When the page changes, the **“Showing …”** and **“Page X of Y”** lines remount with a quick **fade / bump-up** animation (`paginationReveal` in `Pagination.module.css`). **Previous / Next** buttons use **`transform: scale(0.98)`** on active press; chevron icons **nudge** on hover (left/right per button). Reduced-motion users get a static experience.
