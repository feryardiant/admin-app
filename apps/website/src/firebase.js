import { initializeApp } from 'firebase/app'

const initialized = {}
const isDev = import.meta.env.DEV
const $app = initializeApp(FIREBASE_CONFIG) // eslint-disable-line no-undef

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.analytics.Analytics?>}
 */
export const useAnalytics = async (app = $app) => {
  if (isDev)
    return null

  if (initialized.analytics)
    return initialized.analytics

  const { getAnalytics } = await import('firebase/analytics')
  initialized.analytics = getAnalytics(app)

  return initialized.analytics
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.auth.Auth>}
 */
export const useAuth = async (app = $app) => {
  if (initialized.auth)
    return initialized.auth

  const { getAuth } = await import('firebase/auth')
  const auth = getAuth(app)

  if (isDev)
    auth.useEmulator('http://localhost:9099')

  return (initialized.auth = auth)
}

/**
 * @returns {Promise<firebase.User>}
 */
export const getCurrentUser = async () => {
  const auth = await useAuth()

  if (auth.currentUser)
    return auth.currentUser

  return new Promise((resolve, reject) => {
    const sub = auth.onAuthStateChanged((user) => {
      sub()
      resolve(user)
    }, reject)
  })
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.database.Database>}
 */
export const useDatabase = async (app = $app) => {
  if (initialized.database)
    return initialized.database

  const { getDatabase } = await import('firebase/database')
  const database = getDatabase(app)

  if (isDev)
    database.useEmulator('localhost', 9000)

  return (initialized.database = database)
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.firestore.Firestore>}
 */
export const useFirestore = async (app = $app) => {
  if (initialized.firestore)
    return initialized.firestore

  const { getFirestore } = await import('firebase/firestore')
  const firestore = getFirestore(app)

  if (isDev)
    firestore.useEmulator('localhost', 8080)

  return (initialized.firestore = firestore)
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.functions.Functions>}
 */
export const useFunctions = async (app = $app) => {
  if (initialized.functions)
    return initialized.functions

  const { getFunctions } = await import('firebase/functions')
  const functions = getFunctions(app)

  if (isDev)
    functions.useEmulator('localhost', 5001)

  return (initialized.functions = functions)
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.messaging.Messaging>}
 */
export const useMessaging = async (app = $app) => {
  if (initialized.messaging)
    return initialized.messaging

  const { getMessaging } = await import('firebase/messaging')
  initialized.messaging = getMessaging(app)

  return initialized.messaging
}

/**
 * @param {firebase.app.App} app
 * @returns {Promise<firebase.storage.Storage>}
 */
export const useStorage = async (app = $app) => {
  if (initialized.storage)
    return initialized.storage

  const { getStorage } = await import('firebase/storage')
  initialized.storage = getStorage(app)

  return initialized.storage
}
