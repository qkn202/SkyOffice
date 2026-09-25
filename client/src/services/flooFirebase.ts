import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  type Firestore,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth'
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions'

export const FLOO_FIREBASE_CONFIG = {
  projectId: 'hpvnn-archive',
  appId: '1:593615248970:web:d8b84465061422965810b3',
  storageBucket: 'hpvnn-archive.firebasestorage.app',
  apiKey: 'AIzaSyDoGJgeikTsfdviVrePe_2H7UcBcpFnrec',
  authDomain: 'hpvnn-archive.firebaseapp.com',
  messagingSenderId: '593615248970',
}

let flooApp: FirebaseApp
let flooAuth: Auth
let flooDb: Firestore
let flooFunctions: Functions

/**
 * Use default Firebase App instance so authentication state is stored under [DEFAULT]
 * and seamlessly shared with the embedded Mạng Floo Shoutbox on the same origin.
 */
export function getFlooFirebase() {
  if (!flooApp) {
    const existing = getApps()[0]
    flooApp = existing || initializeApp(FLOO_FIREBASE_CONFIG)
    flooAuth = getAuth(flooApp)
    flooDb = getFirestore(flooApp)
    flooFunctions = getFunctions(flooApp, 'asia-southeast1')
  }
  return { app: flooApp, auth: flooAuth, db: flooDb, functions: flooFunctions }
}

export interface FlooUserProfile {
  uid: string
  username: string
  house: string
  userTag?: string
  email?: string | null
}

/**
 * Sign in to HPVN Floo Network using HPVN username or email and password.
 */
export async function signInHPVN(account: string, password: string): Promise<User> {
  const { auth, functions } = getFlooFirebase()
  const trimmed = account.trim()

  if (trimmed.includes('@')) {
    // Email login
    const cred = await signInWithEmailAndPassword(auth, trimmed.toLowerCase(), password)
    return cred.user
  } else {
    // Account name login via Cloud Function
    const apiKey = FLOO_FIREBASE_CONFIG.apiKey
    const callable = httpsCallable<{ account: string; password: string; apiKey: string }, { token?: string }>(
      functions,
      'signInWithShoutId'
    )
    const res = await callable({ account: trimmed, password, apiKey })
    if (!res.data?.token) {
      throw new Error('Không nhận được token xác thực từ Mạng Floo HPVN.')
    }
    const cred = await signInWithCustomToken(auth, res.data.token)
    return cred.user
  }
}

/**
 * Sign out of HPVN Floo Network.
 */
export async function signOutHPVN(): Promise<void> {
  const { auth } = getFlooFirebase()
  await signOut(auth)
}

/**
 * Fetch detailed HPVN user profile (house, custom tag, username)
 */
export async function fetchFlooUserProfile(uid: string): Promise<FlooUserProfile | null> {
  const { db } = getFlooFirebase()
  try {
    const userDoc = await getDoc(doc(db, 'shout_users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        uid,
        username: typeof data.username === 'string' ? data.username : 'Phù thủy HPVN',
        house: typeof data.house === 'string' ? data.house.toUpperCase() : 'NONE',
        userTag: typeof data.userTag === 'string' ? data.userTag : undefined,
      }
    }
  } catch (err) {
    console.warn('fetchFlooUserProfile warning:', err)
  }
  return null
}

export { onAuthStateChanged }
