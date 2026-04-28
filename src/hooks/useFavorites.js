import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'pokedex-lite-favorites'

/** @returns {Set<string>} */
function readFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

/** @param {Set<string>} next */
function writeFavoritesToStorage(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
}

let favoritesCache = readFavoritesFromStorage()
const listeners = new Set()

function emit() {
  for (const cb of listeners) cb()
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return favoritesCache
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const toggle = useCallback((name) => {
    const next = new Set(favoritesCache)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    favoritesCache = next
    writeFavoritesToStorage(next)
    emit()
  }, [])

  const has = useCallback((name) => favorites.has(name), [favorites])

  return { favorites, toggle, has }
}
