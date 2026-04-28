import styles from './Toolbar.module.css'

/**
 * @param {{
 *   search: string
 *   onSearchChange: (v: string) => void
 *   types: { name: string; url: string }[]
 *   selectedTypes: string[]
 *   onToggleType: (name: string) => void
 *   onClearTypes: () => void
 *   typesLoading: boolean
 * }} props
 */
export function Toolbar({
  search,
  onSearchChange,
  types,
  selectedTypes,
  onToggleType,
  onClearTypes,
  typesLoading,
}) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.field}>
        <span className={styles.label}>Search by name</span>
        <input
          className={styles.input}
          type="search"
          name="pokemon-search"
          placeholder="Filter as you type (e.g. char…)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
      </label>

      <div className={styles.typesSection}>
        {/* <div className={styles.typesHeader}>
          <span className={styles.label}>Types</span>
          {selectedTypes.length > 0 && (
            <button type="button" className={styles.linkButton} onClick={onClearTypes}>
              Clear types
            </button>
          )}
        </div> */}
        {typesLoading ? (
          <p className={styles.hint}>Loading types…</p>
        ) : (
          <div className={styles.typeChips} role="group" aria-label="Filter by Pokémon type">
            {types.map((t) => {
              const active = selectedTypes.includes(t.name)
              const label = formatTypeLabel(t.name)
              return (
                <button
                  key={t.name}
                  type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                  aria-pressed={active}
                  aria-label={
                    active ? `Remove ${label} from type filter` : `Filter by ${label}`
                  }
                  onClick={() => onToggleType(t.name)}
                >
                  {active && (
                    <span className={styles.chipIcon} aria-hidden>
                      <svg
                        className={styles.chipIconSvg}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 12 12"
                        width="12"
                        height="12"
                        fill="none"
                      >
                        <path
                          d="M3 3l6 6M9 3l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
                  <span className={styles.chipText}>{label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/** @param {string} slug */
function formatTypeLabel(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
