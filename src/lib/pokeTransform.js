/** @param {string} slug */
export function slugToDisplayName(slug) {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

/** @param {string} statSlug e.g. "special-attack" */
export function statSlugToLabel(statSlug) {
  return statSlug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

/**
 * @param {unknown} raw PokéAPI pokemon resource
 * @returns {{ name: string; imageUrl: string | null; types: { name: string }[] }}
 */
export function summaryFromPokemonResource(raw) {
  const name = typeof raw?.name === 'string' ? raw.name : ''
  const sprites = raw?.sprites
  const other = sprites?.other
  const official = other?.['official-artwork']?.front_default
  const fallback = sprites?.front_default
  const imageUrl = typeof official === 'string' ? official : typeof fallback === 'string' ? fallback : null

  const typesRaw = raw?.types
  const types = []
  if (Array.isArray(typesRaw)) {
    const sorted = [...typesRaw].sort((a, b) => (a?.slot ?? 0) - (b?.slot ?? 0))
    for (const t of sorted) {
      const n = t?.type?.name
      if (typeof n === 'string') types.push({ name: n })
    }
  }

  return { name, imageUrl, types }
}

/**
 * @typedef {{
 *   id: number
 *   displayName: string
 *   name: string
 *   heightDm: string
 *   weightKg: string
 *   imageUrl: string | null
 *   types: string[]
 *   stats: { name: string; label: string; value: number }[]
 *   abilities: { name: string; displayName: string; hidden: boolean }[]
 * }} PokemonDetail
 */

/**
 * @param {unknown} raw
 * @returns {PokemonDetail | null}
 */
export function detailFromPokemonResource(raw) {
  const id = raw?.id
  if (typeof id !== 'number') return null
  const name = typeof raw?.name === 'string' ? raw.name : ''
  const displayName = slugToDisplayName(name)
  const height = raw?.height
  const weight = raw?.weight
  const heightDm = typeof height === 'number' ? (height / 10).toFixed(1) : '—'
  const weightKg = typeof weight === 'number' ? (weight / 10).toFixed(1) : '—'

  const sprites = raw?.sprites
  const other = sprites?.other
  const official = other?.['official-artwork']?.front_default
  const fallback = sprites?.front_default
  const imageUrl = typeof official === 'string' ? official : typeof fallback === 'string' ? fallback : null

  const typesRaw = raw?.types
  /** @type {string[]} */
  const types = []
  if (Array.isArray(typesRaw)) {
    const sorted = [...typesRaw].sort((a, b) => (a?.slot ?? 0) - (b?.slot ?? 0))
    for (const t of sorted) {
      const n = t?.type?.name
      if (typeof n === 'string') types.push(slugToDisplayName(n))
    }
  }

  const statsRaw = raw?.stats
  /** @type {PokemonDetail['stats']} */
  const stats = []
  if (Array.isArray(statsRaw)) {
    for (const s of statsRaw) {
      const slug = s?.stat?.name
      const base = s?.base_stat
      if (typeof slug === 'string' && typeof base === 'number') {
        stats.push({
          name: slug,
          label: statSlugToLabel(slug),
          value: base,
        })
      }
    }
  }

  const abRaw = raw?.abilities
  /** @type {PokemonDetail['abilities']} */
  const abilities = []
  if (Array.isArray(abRaw)) {
    for (const a of abRaw) {
      const n = a?.ability?.name
      const hidden = Boolean(a?.is_hidden)
      if (typeof n === 'string') {
        abilities.push({
          name: n,
          displayName: slugToDisplayName(n),
          hidden,
        })
      }
    }
  }

  return {
    id,
    name,
    displayName,
    heightDm,
    weightKg,
    imageUrl,
    types,
    stats,
    abilities,
  }
}
