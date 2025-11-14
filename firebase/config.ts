import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

let firebaseInitializationError: string | null = null;

// Use process.env, which is populated by Vite/Vercel at build time.
// This standardizes the approach with the Gemini SDK guidelines.
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key.replace('VITE_FIREBASE_', '').toLowerCase());

if (missingKeys.length === 0 && firebaseConfig.projectId) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully!");
    } catch (error: any) {
        console.error("Error initializing Firebase:", error);
        firebaseInitializationError = error.message;
        if (error.code === 'failed-precondition' || (error.message && error.message.toLowerCase().includes('firestore is not available'))) {
            console.error(
                `\n\n[ACTION REQUIRED] Firestore API might be disabled. Visit: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=${firebaseConfig.projectId} and enable it.`
            );
        }
    }
} else {
    firebaseInitializationError = `Firebase initialization failed. The following environment variables are missing: ${missingKeys.join(', ')}. Please add them to your Vercel project settings.`;
    console.error(firebaseInitializationError);
}


export { db, firebaseInitializationError };