import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Importa la funzione getStorage

// Assicurati che questi valori siano corretti e completi,
// presi dalla console di Firebase del tuo progetto.
const firebaseConfig = {
    apiKey: "AIzaSyB7a9XJGE8P4k4ZRdoqFtfin6ktHUmeKGo",
    authDomain: "gestione-cantieri-cloud.firebaseapp.com",
    projectId: "gestione-cantieri-cloud",
    storageBucket: "gestione-cantieri-cloud.firebasestorage.app",
    messagingSenderId: "718930172906",
    appId: "1:718930172906:web:ba7f28666bfc2cfe493093",
    measurementId: "G-9F9M6M21M9"
};

// Inizializza l'app di Firebase con la configurazione.
const app = initializeApp(firebaseConfig);
console.log('DEBUG FIREBASE: Inizializzazione dell\'app di Firebase completata.');

// Inizializza e ottieni le istanze dei servizi che usi.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Inizializza e esporta il servizio Storage

// Aggiungi log per confermare che le istanze dei servizi sono pronte.
console.log('DEBUG FIREBASE: Istanze di Auth, Firestore e Storage create e pronte per l\'uso.');

// **Esporta l'istanza dell'app per usarla in altri componenti.**
export { app };
