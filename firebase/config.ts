import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

let firebaseInitializationError: string | null = null;

// Vite exposes env variables on import.meta.env. We must check if it exists.
// FIX: Cast import.meta to any to access env property without TypeScript errors
const env = (import.meta as any).env;
if (typeof env !== 'undefined') {
    const firebaseConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
    };

    const missingKeys = Object.entries(firebaseConfig)
        .filter(([, value]) => !value)
        .map(([key]) => key);

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
} else {
    firebaseInitializationError = "Vite environment variables (import.meta.env) not found. Running in a preview environment.";
    console.log(firebaseInitializationError);
}

export { db, firebaseInitializationError };
