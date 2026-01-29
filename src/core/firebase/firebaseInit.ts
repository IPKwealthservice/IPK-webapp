import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Developer Warning for placeholder API Key
if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE" || !firebaseConfig.apiKey) {
  console.error(
    "🔥 [Firebase Init]: VITE_FIREBASE_API_KEY is missing or set to a placeholder in your .env file."
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
