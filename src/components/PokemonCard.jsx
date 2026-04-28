import styles from './PokemonCard.module.css'

/**
 * @param {{
 *   name: string
 *   imageUrl: string | null
 *   types: { name: string }[]
 *   favorite: boolean
 *   onToggleFavorite: () => void
 *   onOpen: () => void
 * }} props
 */
export function PokemonCard({
  name,
  imageUrl,
  types,
  favorite,
  onToggleFavorite,
  onOpen,
}) {
  const displayName = formatDisplayName(name)

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.mainHit}
        onClick={onOpen}
        aria-label={`View details for ${displayName}`}
      >
        <div className={styles.imageWrap}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.imageFallback} aria-hidden />
          )}
        </div>
        <h2 className={styles.title}>{displayName}</h2>
        <ul className={styles.types}>
          {types.map((t) => (
            <li key={t.name} className={styles.type}>
              {formatTypeLabel(t.name)}
            </li>
          ))}
        </ul>
      </button>
      <button
        type="button"
        className={`${styles.fav} ${favorite ? styles.favOn : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        aria-label={favorite ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
        aria-pressed={favorite}
      >
        {favorite ? <FavIconFilled /> : <FavIconOutline />}
      </button>
    </article>
  )
}

/** @param {string} slug */
function formatDisplayName(slug) {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

/** @param {string} slug */
function formatTypeLabel(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function FavIconOutline() {
  return (
    <svg
      className={styles.favIcon}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      <path
        d="M9.58008 4.10156C9.71243 3.69526 10.2876 3.69526 10.4199 4.10156L11.4268 7.20117C11.6197 7.7951 12.1734 8.19725 12.7979 8.19727H16.0566C16.4843 8.19727 16.6623 8.74466 16.3164 8.99609L13.6797 10.9111C13.1745 11.2782 12.9633 11.9295 13.1562 12.5234L14.1631 15.6221C14.2953 16.0288 13.8294 16.3676 13.4834 16.1162L10.8477 14.2002C10.3424 13.8331 9.65758 13.8331 9.15234 14.2002L6.5166 16.1162C6.17058 16.3676 5.70474 16.0288 5.83691 15.6221L6.84375 12.5234C7.03673 11.9295 6.82555 11.2782 6.32031 10.9111L3.68359 8.99609C3.33771 8.74466 3.51569 8.19727 3.94336 8.19727H7.20215C7.82663 8.19725 8.38026 7.7951 8.57324 7.20117L9.58008 4.10156Z"
        fill="none"
        stroke="#F7A93D"
      />
    </svg>
  )
}

function FavIconFilled() {
  return (
    <svg
      className={styles.favIcon}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      <path
        d="M9.58008 4.10156C9.71243 3.69526 10.2876 3.69526 10.4199 4.10156L11.4268 7.20117C11.6197 7.7951 12.1734 8.19725 12.7979 8.19727H16.0566C16.4843 8.19727 16.6623 8.74466 16.3164 8.99609L13.6797 10.9111C13.1745 11.2782 12.9633 11.9295 13.1562 12.5234L14.1631 15.6221C14.2953 16.0288 13.8294 16.3676 13.4834 16.1162L10.8477 14.2002C10.3424 13.8331 9.65758 13.8331 9.15234 14.2002L6.5166 16.1162C6.17058 16.3676 5.70474 16.0288 5.83691 15.6221L6.84375 12.5234C7.03673 11.9295 6.82555 11.2782 6.32031 10.9111L3.68359 8.99609C3.33771 8.74466 3.51569 8.19727 3.94336 8.19727H7.20215C7.82663 8.19725 8.38026 7.7951 8.57324 7.20117L9.58008 4.10156Z"
        fill="#F7A93D"
        stroke="#F7A93D"
      />
    </svg>
  )
}
