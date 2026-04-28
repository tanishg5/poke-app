import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'

import { auth, provider } from '../firebase/firebase.js'
import styles from './LoginPage.module.css'

const loginVideoUrl = new URL('../assets/LoginVideo.mp4', import.meta.url).href

export function LoginPage() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(/** @type {string | null} */ (null))

  async function handleGoogleLogin() {
    setError(null)
    setBusy(true)
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.mediaSide}>
        <video
          className={styles.video}
          src={loginVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className={styles.mediaOverlay} />
        <div className={styles.mediaInner}>
          <div className={styles.brand}>
            <p className={styles.brandName}>Pokedex Lite</p>
          </div>
          <div className={styles.hero}>
            <h2 className={styles.heroHeadline}>Curiosity got you here. Let it take you further.</h2>
            <p className={styles.heroSub}>
              Browse hundreds of Pokémon with search, types, and favorites—your Pokédex journey starts here.
            </p>
          </div>
        </div>
      </aside>

      <section className={styles.formSide} aria-labelledby="login-heading">
        <div className={styles.formInner}>
          <p className={styles.mobileBrand}>Pokedex Lite</p>
          <h1 id="login-heading" className={styles.formTitle}>
            Sign in to Pokedex Lite
          </h1>
          <p className={styles.formDescription}>
            Use your Google account to access the app. Registration is handled through Google sign-in.
          </p>
          <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin} disabled={busy}>
            <svg className={styles.googleIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {busy ? 'Opening Google…' : 'Continue with Google'}
          </button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
