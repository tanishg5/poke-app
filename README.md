# Pokédex Lite

A responsive React app that lists Pokémon from the public [PokéAPI](https://pokeapi.co/) (v2). You can search by name, filter by one or more types (OR logic), paginate results, mark favorites persisted in `localStorage`, and open a detail modal with stats and abilities.

## Prerequisites

- **Node.js** 20+ (or current LTS) and **npm** (bundled with Node).

## Run locally

From this folder (`PokeApp`):

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

Other scripts:

```bash
npm run build    # production build → dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

## Implementation notes

- **Listing / pagination**: Default browse uses `GET /pokemon?limit=&offset=` (one page of summary URLs at a time, then parallel detail fetches for the visible page).
- **Search**: When you type with no type filter, the app loads a shallow name index (`/pokemon` with the API `count`) once, then filters and paginates client-side.
- **Types**: Selecting types loads `/type/{name}` (cached) and paginates the merged set; search text further filters that set.
- **Styles**: Component styles use CSS Modules (`*.module.css`).

Data is provided by PokéAPI contributors; this demo is not affiliated with Nintendo or The Pokémon Company.
