import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

/**
 * Custom hook per gestire lo stato di autenticazione e i dati utente.
 * Si occupa solo dell'autenticazione e del recupero dei dati utente.
 *
 * @returns {{currentUser: object, userRole: string, loadingAuth: boolean, userAziendaId: (string|null), handleLogout: function}}
 */
export const useAuthentication = () => {
    // Variabili per lo stato di autenticazione e dati utente
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('guest');
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [userAziendaId, setUserAziendaId] = useState(null);

    useEffect(() => {
        // onAuthStateChanged gestisce l'autenticazione in modo reattivo
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;
                
                // PERCORSO CORRETTO PER VS CODE E AMBIENTI LOCALI
                // Il percorso è più semplice e non richiede il prefisso 'artifacts/{appId}'
                const userDocRef = doc(db, 'users', userId);

                // onSnapshot crea un listener in tempo reale per il documento utente
                const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        
                        // AGGIORNA IL CODICE QUI:
                        // Aggiunge i campi 'nome' e 'cognome' al documento utente
                        const userWithData = { 
                            ...user, 
                            ...userData,
                            nome: userData.nome || '', // Aggiunto il campo nome
                            cognome: userData.cognome || '' // Aggiunto il campo cognome
                        };
                        
                        setCurrentUser(userWithData);
                        setUserRole(userData.ruolo);
                        setUserAziendaId(userData.companyID || null);
                    } else {
                        // Se il documento del profilo non esiste, imposta il ruolo 'guest'
                        setCurrentUser(user);
                        setUserRole('guest');
                        setUserAziendaId(null);
                    }
                    setLoadingAuth(false);
                }, (error) => {
                    console.error("Errore nel listener del documento utente:", error);
                    setLoadingAuth(false);
                });

                // Il return di questo useEffect pulisce il listener del documento
                return () => unsubscribeUserDoc();
            } else {
                // Nessun utente autenticato
                setCurrentUser(null);
                setUserRole('guest');
                setUserAziendaId(null);
                setLoadingAuth(false);
            }
        });
        
        // Il return di questo useEffect pulisce il listener di autenticazione
        return () => unsubscribeAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Errore durante il logout:", error);
        }
    };

    return {
        currentUser,
        userRole,
        loadingAuth,
        userAziendaId,
        handleLogout,
    };
};
