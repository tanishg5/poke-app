const API_BASE = 'https://pokeapi.co/api/v2'

/**
 * @param {string} url
 * @param {RequestInit} [init]
 * @returns {Promise<unknown>}
 */
export async function fetchJson(url, init) {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

/**
 * @param {string | number} nameOrId
 */
export function pokemonResourceUrl(nameOrId) {
  return `${API_BASE}/pokemon/${encodeURIComponent(String(nameOrId))}`
}

/**
 * @param {{ limit: number; offset: number }} params
 */
export function listPokemonQueryUrl({ limit, offset }) {
  const q = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  return `${API_BASE}/pokemon?${q}`
}

/**
 * @param {{ limit: number; offset: number }} params
 */
export async function listPokemonPage({ limit, offset }) {
  return fetchJson(listPokemonQueryUrl({ limit, offset }))
}

/**
 * @param {string | number} nameOrId
 */
export async function getPokemon(nameOrId) {
  return fetchJson(pokemonResourceUrl(nameOrId))
}

/**
 * Shallow index of all Pokémon (name + url) for client-side search.
 * One request; results field only (no per-species details).
 */
export async function fetchPokemonNameIndex() {
  const first = await fetchJson(`${API_BASE}/pokemon?limit=1&offset=0`)
  const total = typeof first.count === 'number' ? first.count : 1025
  const capped = Math.min(total, 5000)
  const data = await fetchJson(`${API_BASE}/pokemon?limit=${capped}&offset=0`)
  return data.results ?? []
}

/**
 * Type summary list (name + url) for filter UI — fetches the full set using the API count.
 */
export async function listTypeSummaries() {
  const first = await fetchJson(`${API_BASE}/type?limit=1&offset=0`)
  const total = typeof first.count === 'number' ? first.count : 100
  const data = await fetchJson(`${API_BASE}/type?limit=${total}&offset=0`)
  return data.results ?? []
}

/**
 * Full type resource including all Pokémon of that type.
 * @param {string} typeName e.g. "fire"
 */
export async function getType(typeName) {
  return fetchJson(`${API_BASE}/type/${encodeURIComponent(typeName)}`)
}

/**
 * @param {unknown} data
 * @returns {{ name: string; url: string }[]}
 */
export function pokemonRefsFromTypePayload(data) {
  const raw = data?.pokemon
  if (!Array.isArray(raw)) return []
  /** @type {Map<string, { name: string; url: string }>} */
  const byName = new Map()
  for (const entry of raw) {
    const p = entry?.pokemon
    const name = p?.name
    const url = p?.url
    if (typeof name === 'string' && typeof url === 'string' && !byName.has(name)) {
      byName.set(name, { name, url })
    }
  }
  return Array.from(byName.values())
}
