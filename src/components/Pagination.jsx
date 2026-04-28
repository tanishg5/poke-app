import styles from './Pagination.module.css'

/**
 * @param {{
 *   page: number
 *   pageCount: number
 *   totalCount: number
 *   pageSize: number
 *   onPrev: () => void
 *   onNext: () => void
 *   disabled?: boolean
 * }} props
 */
export function Pagination({ page, pageCount, totalCount, pageSize, onPrev, onNext, disabled }) {
  const humanPage = pageCount === 0 ? 0 : page + 1
  const atFirst = page <= 0 || pageCount === 0
  const atLast = pageCount === 0 || page >= pageCount - 1

  let rangeStart = 0
  let rangeEnd = 0
  if (totalCount > 0 && pageCount > 0) {
    rangeStart = page * pageSize + 1
    rangeEnd = Math.min((page + 1) * pageSize, totalCount)
  }

  const pageKey = `${page}-${pageCount}`
  const rangeKey = `${rangeStart}-${rangeEnd}-${totalCount}`

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <p className={styles.range}>
        <span key={rangeKey} className={styles.rangeTick}>
          Showing {rangeStart} – {rangeEnd} of {totalCount} Pokémon
        </span>
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrev}`}
          onClick={onPrev}
          disabled={disabled || atFirst}
        >
          <ChevronLeft className={styles.chevron} />
          Previous
        </button>
        <span className={styles.pageMeta}>
          <span key={pageKey} className={styles.pageMetaTick}>
            Page {humanPage} of {pageCount}
          </span>
        </span>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnNext}`}
          onClick={onNext}
          disabled={disabled || atLast}
        >
          Next
          <ChevronRight className={styles.chevron} />
        </button>
      </div>
    </nav>
  )
}

/** @param {{ className?: string }} props */
function ChevronLeft({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      <path
        d="M10 3L5.5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** @param {{ className?: string }} props */
function ChevronRight({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      <path
        d="M6 3L10.5 8L6 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
