import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBC9IdYmvHe3WLXH1QNGr9sSxlfQCHE8rg',
  authDomain: 'blackhumorproductions-1774c.firebaseapp.com',
  projectId: 'blackhumorproductions-1774c',
  storageBucket: 'blackhumorproductions-1774c.firebasestorage.app',
  messagingSenderId: '913312004232',
  appId: '1:913312004232:web:085018555694ea471b073d',
  measurementId: 'G-97TN1YLT2H',
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export async function getDatabase() {
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(firebaseApp);
}
