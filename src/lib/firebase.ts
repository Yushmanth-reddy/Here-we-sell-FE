import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Uploads a single image file to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const uniqueName = `listings/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, uniqueName);

  const snapshot = await uploadBytesResumable(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Uploads multiple image files in parallel.
 * Returns an array of public download URLs.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadImage));
}
