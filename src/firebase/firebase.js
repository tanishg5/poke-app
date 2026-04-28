import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAPvmPM_7IC3qOfyzKzdSYdEbquxSZQ5hA',
  authDomain: 'pokedex-lite-auth-b5cf6.firebaseapp.com',
  projectId: 'pokedex-lite-auth-b5cf6',
  storageBucket: 'pokedex-lite-auth-b5cf6.firebasestorage.app',
  messagingSenderId: '790869823499',
  appId: '1:790869823499:web:dafc1199dd3ef38eb5770e',
  measurementId: 'G-22NM683FWN',
}

const app = initializeApp(firebaseConfig)

/** @type {import('firebase/analytics').Analytics | undefined} */
let analytics
try {
  analytics = getAnalytics(app)
} catch {
  // e.g. unsupported environment
}

export { analytics }
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export { app }