import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import styles from './App.module.css'
import { LoginPage } from './components/LoginPage.jsx'
import { Pagination } from './components/Pagination.jsx'
import { PokemonCard } from './components/PokemonCard.jsx'
import { PokemonModal } from './components/PokemonModal.jsx'
import { Toolbar } from './components/Toolbar.jsx'
import { useFavorites } from './hooks/useFavorites.js'
import {
  fetchJson,
  fetchPokemonNameIndex,
  getPokemon,
  getType,
  listPokemonPage,
  listTypeSummaries,
  pokemonRefsFromTypePayload,
} from './lib/pokeapi.js'
import { detailFromPokemonResource, summaryFromPokemonResource } from './lib/pokeTransform.js'
import { auth } from './firebase/firebase.js'

const PAGE_SIZE = 20

const HIDDEN_TYPES = new Set(['unknown', 'shadow'])

/** @param {string[]} selectedTypes @param {Map<string, { name: string; url: string }[]>} cache */
function mergeTypeRefs(selectedTypes, cache) {
  const map = new Map()
  for (const t of selectedTypes) {
    const refs = cache.get(t)
    if (!refs) continue
    for (const r of refs) {
      if (!map.has(r.name)) map.set(r.name, r)
    }
  }
  return Array.from(map.values())
}

/**
 * @param {{
 *   user: import('firebase/auth').User
 *   onSignOut: () => void
 * }} props
 */
function PokedexApp({ user, onSignOut }) {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState(/** @type {string[]} */ ([]))
  const [typesList, setTypesList] = useState(/** @type {{ name: string; url: string }[]} */ ([]))
  const [typesLoading, setTypesLoading] = useState(true)

  const [nameIndex, setNameIndex] = useState(/** @type {{ name: string; url: string }[] | null} */ (null))
  const [indexLoading, setIndexLoading] = useState(false)

  const [items, setItems] = useState(/** @type {ReturnType<typeof summaryFromPokemonResource>[]} */ ([]))
  const [totalCount, setTotalCount] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(/** @type {string | null} */ (null))

  const typeCacheRef = useRef(new Map())

  const [modalName, setModalName] = useState(/** @type {string | null} */ (null))
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(/** @type {string | null} */ (null))
  const [modalDetail, setModalDetail] = useState(
    /** @type {ReturnType<typeof detailFromPokemonResource> | null} */ (null),
  )

  const { toggle, has } = useFavorites()

  const trimmedSearch = search.trim().toLowerCase()
  const needsNameIndex = trimmedSearch.length > 0 && selectedTypes.length === 0

  const pageCount = useMemo(() => {
    if (totalCount === 0) return 0
    return Math.ceil(totalCount / PAGE_SIZE)
  }, [totalCount])

  const safePage = useMemo(() => {
    if (pageCount === 0) return 0
    return Math.min(page, pageCount - 1)
  }, [page, pageCount])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setTypesLoading(true)
      try {
        const raw = await listTypeSummaries()
        if (cancelled) return
        const filtered = raw.filter((t) => !HIDDEN_TYPES.has(t.name))
        setTypesList(filtered)
      } catch (e) {
        if (!cancelled) {
          setTypesList([])
          setListError(e instanceof Error ? e.message : 'Failed to load types.')
        }
      } finally {
        if (!cancelled) setTypesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!needsNameIndex || nameIndex) return
    let cancelled = false
    ;(async () => {
      setIndexLoading(true)
      try {
        const idx = await fetchPokemonNameIndex()
        if (!cancelled) setNameIndex(idx)
      } catch {
        if (!cancelled) {
          setNameIndex(null)
          setListError('Could not load Pokémon list for search. Check your connection and try again.')
        }
      } finally {
        if (!cancelled) setIndexLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [needsNameIndex, nameIndex])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setListLoading(true)

      try {
        if (selectedTypes.length > 0) {
          for (const t of selectedTypes) {
            if (!typeCacheRef.current.has(t)) {
              const data = await getType(t)
              if (cancelled) return
              typeCacheRef.current.set(t, pokemonRefsFromTypePayload(data))
            }
          }
          if (cancelled) return

          const merged = mergeTypeRefs(selectedTypes, typeCacheRef.current)
          const filtered = trimmedSearch.length
            ? merged.filter((r) => r.name.toLowerCase().includes(trimmedSearch))
            : merged

          setTotalCount(filtered.length)
          const slice = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
          const rawList = await Promise.all(slice.map((r) => fetchJson(r.url)))
          if (cancelled) return
          setListError(null)
          setItems(rawList.map(summaryFromPokemonResource))
          return
        }

        if (trimmedSearch.length > 0) {
          if (!nameIndex) {
            setItems([])
            setTotalCount(0)
            setListLoading(false)
            return
          }

          const filtered = nameIndex.filter((r) => r.name.toLowerCase().includes(trimmedSearch))
          setTotalCount(filtered.length)
          const slice = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
          const rawList = await Promise.all(slice.map((r) => fetchJson(r.url)))
          if (cancelled) return
          setListError(null)
          setItems(rawList.map(summaryFromPokemonResource))
          return
        }

        const data = await listPokemonPage({
          limit: PAGE_SIZE,
          offset: safePage * PAGE_SIZE,
        })
        if (cancelled) return
        const rawList = await Promise.all(data.results.map((r) => fetchJson(r.url)))
        if (cancelled) return
        setListError(null)
        setItems(rawList.map(summaryFromPokemonResource))
        setTotalCount(typeof data.count === 'number' ? data.count : 0)
      } catch (e) {
        if (!cancelled) {
          setItems([])
          setTotalCount(0)
          setListError(e instanceof Error ? e.message : 'Something went wrong loading Pokémon.')
        }
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [safePage, trimmedSearch, selectedTypes, nameIndex])

  useEffect(() => {
    if (!modalName) {
      return
    }

    let cancelled = false
    ;(async () => {
      setModalLoading(true)
      setModalError(null)
      setModalDetail(null)
      try {
        const raw = await getPokemon(modalName)
        if (cancelled) return
        const detail = detailFromPokemonResource(raw)
        if (!detail) {
          setModalError('Could not parse Pokémon data.')
        } else {
          setModalDetail(detail)
        }
      } catch (e) {
        if (!cancelled) {
          setModalError(e instanceof Error ? e.message : 'Failed to load Pokémon.')
        }
      } finally {
        if (!cancelled) setModalLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [modalName])

  const onSearchChange = useCallback((value) => {
    setSearch(value)
    setPage(0)
  }, [])

  const onToggleType = useCallback((name) => {
    setPage(0)
    setSelectedTypes((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }, [])

  const clearTypes = useCallback(() => {
    setPage(0)
    setSelectedTypes([])
  }, [])

  const closeModal = useCallback(() => {
    setModalName(null)
    setModalDetail(null)
    setModalError(null)
    setModalLoading(false)
  }, [])

  const showGridSpinner =
    listLoading || (needsNameIndex && !nameIndex && indexLoading && !listError)

  return (
    <div className={styles.page}>
      <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div>
            <h1 className={styles.title}>Pokedex Lite App</h1>
            <p className={styles.tagline}>
              Web Application Made By Tanish Gupta Used {' '}
              <a
                href="https://pokeapi.co/"
                className={styles.link}
                target="_blank"
                rel="noreferrer"
              >
                PokeAPI {' '}
              </a>
              — with these functionalities search, filter by type, paginate, and save favorites.
            </p>
          </div>
        </div>
        <div className={styles.headerUser}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className={styles.userAvatar} width={36} height={36} />
          ) : null}
          <span className={styles.userName} title={user.email ?? undefined}>
            {user.displayName ?? user.email ?? 'Signed in'}
          </span>
          <button type="button" className={styles.signOutBtn} onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <Toolbar
        search={search}
        onSearchChange={onSearchChange}
        types={typesList}
        selectedTypes={selectedTypes}
        onToggleType={onToggleType}
        onClearTypes={clearTypes}
        typesLoading={typesLoading}
      />

      {listError && (
        <div className={styles.errorBanner} role="alert">
          <span>{listError}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => setListError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <main className={styles.main}>
        {showGridSpinner ? (
          <div className={styles.gridLoading} aria-live="polite">
            <div className={styles.spinner} aria-hidden />
            <p className={styles.loadingText}>
              {needsNameIndex && !nameIndex ? 'Preparing search index…' : 'Loading Pokémon…'}
            </p>
          </div>
        ) : !listError && items.length === 0 ? (
          <p className={styles.empty}>
            No Pokémon match your filters. Try clearing search or type filters.
          </p>
        ) : items.length === 0 ? null : (
          <ul className={styles.grid}>
            {items.map((p) => (
              <li key={p.name} className={styles.gridItem}>
                <PokemonCard
                  name={p.name}
                  imageUrl={p.imageUrl}
                  types={p.types}
                  favorite={has(p.name)}
                  onToggleFavorite={() => toggle(p.name)}
                  onOpen={() => setModalName(p.name)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        disabled={showGridSpinner}
        onPrev={() => setPage(Math.max(0, safePage - 1))}
        onNext={() =>
          setPage(pageCount > 0 ? Math.min(pageCount - 1, safePage + 1) : safePage)
        }
      />

      <PokemonModal
        open={modalName != null}
        loading={modalLoading}
        error={modalError}
        detail={modalDetail}
        onClose={closeModal}
      />

      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(/** @type {import('firebase/auth').User | null} */ (null))
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
    return unsub
  }, [])

  const onSignOut = useCallback(() => {
    signOut(auth)
  }, [])

  if (!authReady) {
    return (
      <div className={styles.page}>
        <div className={styles.app}>
          <div className={styles.authBoot} aria-live="polite">
            <div className={styles.spinner} aria-hidden />
            <p className={styles.loadingText}>Checking sign-in…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <PokedexApp user={user} onSignOut={onSignOut} />
}
