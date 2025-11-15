import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let firebaseInitializationError: string | null = null;

// Definitive, correct configuration for the 'onzy-chatbot' project.
const firebaseConfig = {
    apiKey: "AIzaSyBvYQ9RUJHuNo7wwqZq190VD_LzxQN3NHM",
    authDomain: "onzy-chatbot.firebaseapp.com",
    projectId: "onzy-chatbot",
    storageBucket: "onzy-chatbot.appspot.com",
    messagingSenderId: "251829048306",
    appId: "1:251829048306:web:5622322a3f29ac0641116b"
};

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully with hardcoded credentials!");
} catch (error: any) {
    console.error("Error initializing Firebase:", error);
    firebaseInitializationError = error.message;
}


export { db, firebaseInitializationError };