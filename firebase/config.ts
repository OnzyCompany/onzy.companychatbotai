// Fix: Add vite/client type reference to resolve issues with import.meta.env
/// <reference types="vite/client" />

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Safely access the env object
const env = import.meta.env;

const firebaseConfig = {
    apiKey: env ? env.VITE_FIREBASE_API_KEY : undefined,
    authDomain: env ? env.VITE_FIREBASE_AUTH_DOMAIN : undefined,
    projectId: env ? env.VITE_FIREBASE_PROJECT_ID : undefined,
    storageBucket: env ? env.VITE_FIREBASE_STORAGE_BUCKET : undefined,
    messagingSenderId: env ? env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined,
    appId: env ? env.VITE_FIREBASE_APP_ID : undefined,
};

// Validate that all required configuration values are present.
const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingKeys.length === 0 && firebaseConfig.projectId) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully!"); // Confirmation message
    } catch (error: any) {
        console.error("Error initializing Firebase:", error);
        // Check for the specific error indicating Firestore is not enabled.
        if (error.code === 'failed-precondition' || (error.message && error.message.toLowerCase().includes('firestore is not available'))) {
            console.error(
                "\n\n====================[ AÇÃO NECESSÁRIA ]====================\n" +
                "O serviço Firestore não está ativado no seu projeto Firebase, ou a API não está habilitada no Google Cloud.\n\n" +
                "PASSO 1: VERIFIQUE O BANCO DE DADOS\n" +
                "Vá para o seu Console do Firebase -> 'Construir' -> 'Firestore Database'. Se não houver um banco de dados, clique em 'Criar banco de dados'.\n\n" +
                "PASSO 2: VERIFIQUE A API\n" +
                "Se o banco de dados já existe, a API pode estar desativada. Vá para o Google Cloud Console API Library:\n" +
                `https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=${firebaseConfig.projectId}\n` +
                "Selecione o projeto correto ('onzy-chatbot') e clique em 'ATIVAR' se o botão estiver disponível.\n" +
                "Após ativar, atualize esta página.\n" +
                "==============================================================\n\n"
            );
        }
    }
} else {
    console.error(
        `Firebase initialization failed. The following environment variables are missing: ${missingKeys.join(', ')}. Please add them to your Vercel project settings.`
    );
}

export { db };