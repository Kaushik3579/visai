import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMOYvaEg8vTKPFrtHUp66a6jE8gwDHqqg",
  authDomain: "acron-27092.firebaseapp.com",
  projectId: "acron-27092",
  storageBucket: "acron-27092.firebasestorage.app",
  messagingSenderId: "1077317799823",
  appId: "1:1077317799823:web:82bef7b0b8c132c71645fa",
  measurementId: "G-C42TCCH5J0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
