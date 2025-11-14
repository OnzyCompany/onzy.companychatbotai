
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// --- MOCK MODE ENABLED ---
// The Firebase initialization has been temporarily disabled to allow the app to run
// with mock data from tenantService.ts. This helps in validating the UI and app logic
// without depending on a live database connection.
// To re-enable Firebase, uncomment the code below and ensure the configuration is correct.

/*
const firebaseConfig = {
    apiKey: "AIzaSyBvYQ9RUJHuNo7wwqZq190VD_LzxQN3NHM",
    authDomain: "onzy-chatbot.firebaseapp.com",
    projectId: "onzy-chatbot",
    storageBucket: "onzy-chatbot.firebasestorage.app",
    messagingSenderId: "251829048306",
    appId: "1:251829048306:web:5622322a3f29ac0641116b",
};


// Validate that all required configuration values are present.
const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingKeys.length === 0) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully!"); // Confirmation message
    } catch (error: any) {
        console.error("Error initializing Firebase:", error);
        // Check for the specific error indicating Firestore is not enabled.
        if (error.code === 'failed-precondition' || (error.message && error.message.toLowerCase().includes('firestore is not available'))) {
            console.error(
                "\n\n====================[ AÇÃO NECESSÁRIA (Passo 3) ]====================\n" +
                "Você já ativou a API, mas a conexão ainda falha. O problema mais comum agora é uma DISCREPÂNCIA DE PROJETOS.\n\n" +
                "O aplicativo está configurado para o projeto com o ID: 'onzy-chatbot'\n\n" +
                "Por favor, verifique na sua tela do Google Cloud (onde você ativou a API) se o nome do projeto no topo da página é EXATAMENTE 'onzy-chatbot'.\n" +
                "Se for um nome diferente (como 'OnzyCompanyChatBot'), você ativou a API para o projeto errado.\n\n" +
                "SOLUÇÃO: Use o seletor de projetos no topo do Google Cloud Console para mudar para o projeto 'onzy-chatbot' e verifique se a API está ativa nele.\n" +
                "=======================================================================\n\n"
            );
        }
    }
} else {
    console.error(
        `Firebase initialization failed. The configuration object is missing the following keys: ${missingKeys.join(', ')}`
    );
}
*/

export { db };