import { useEffect, useId, useRef, useState } from 'react'
import styles from './PokemonModal.module.css'

const EXIT_MS = 340

function raf2(cb) {
  let id1 = 0
  const id0 = requestAnimationFrame(() => {
    id1 = requestAnimationFrame(cb)
  })
  return () => {
    cancelAnimationFrame(id0)
    cancelAnimationFrame(id1)
  }
}

/**
 * @param {{
 *   open: boolean
 *   loading: boolean
 *   error: string | null
 *   detail: import('../lib/pokeTransform.js').PokemonDetail | null
 *   onClose: () => void
 * }} props
 */
export function PokemonModal({ open, loading, error, detail, onClose }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const cancel = raf2(() => setVisible(true))
      return cancel
    }
    setVisible(false)
    const t = window.setTimeout(() => setMounted(false), EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  useEffect(() => {
    if (!open) return
    const node = dialogRef.current
    const prev = document.activeElement
    node?.focus()

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (prev instanceof HTMLElement) prev.focus()
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div
      className={`${styles.backdrop} ${visible ? styles.backdropOpen : ''}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close details">
          ×
        </button>

        {loading && (
          <div className={styles.center}>
            <div className={styles.spinner} aria-hidden />
            <p className={styles.muted}>Loading details…</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.center}>
            <p className={styles.error}>{error}</p>
            <button type="button" className={styles.retry} onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {!loading && !error && detail && (
          <div className={styles.body}>
            <div className={styles.hero}>
              {detail.imageUrl ? (
                <img src={detail.imageUrl} alt="" className={styles.art} />
              ) : (
                <div className={styles.artFallback} aria-hidden />
              )}
              <div className={styles.heading}>
                <h2 id={titleId} className={styles.name}>
                  {detail.displayName}
                </h2>
                <p className={styles.meta}>
                  #{String(detail.id).padStart(4, '0')} · {detail.heightDm} m tall · {detail.weightKg} kg
                </p>
                <ul className={styles.types}>
                  {detail.types.map((t) => (
                    <li key={t} className={styles.typeChip}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <section className={styles.section} aria-labelledby={`${titleId}-stats`}>
              <h3 id={`${titleId}-stats`} className={styles.sectionTitle}>
                Base stats
              </h3>
              <ul className={styles.stats}>
                {detail.stats.map((s) => (
                  <li key={s.name} className={styles.statRow}>
                    <span className={styles.statName}>{s.label}</span>
                    <span className={styles.statValue}>{s.value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.section} aria-labelledby={`${titleId}-abil`}>
              <h3 id={`${titleId}-abil`} className={styles.sectionTitle}>
                Abilities
              </h3>
              <ul className={styles.abilities}>
                {detail.abilities.map((a) => (
                  <li key={a.name} className={styles.ability}>
                    <span className={styles.abilityName}>{a.displayName}</span>
                    {a.hidden && <span className={styles.hiddenBadge}>Hidden</span>}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
