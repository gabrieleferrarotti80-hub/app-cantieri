import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

/**
 * @file useCantieri.js
 * @description Hook personalizzato per recuperare in tempo reale i cantieri assegnati a un utente e il companyID.
 * Aggiunti log di debug per diagnosticare problemi di query.
 */

/**
 * Hook personalizzato per recuperare i cantieri assegnati a un utente e il companyID.
 * @param {Object} user L'oggetto utente Firebase (Auth).
 * @param {Object} db L'istanza del database Firestore.
 * @returns {Object} Un oggetto contenente la lista dei cantieri, lo stato di caricamento e il companyID.
 */
export const useCantieri = (user, db) => {
    const [cantieri, setCantieri] = useState([]);
    const [loading, setLoading] = useState(true);
    // Aggiungo uno stato per memorizzare il companyID
    const [companyID, setCompanyID] = useState(null); 

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            setCantieri([]);
            setCompanyID(null);
            return;
        }

        setLoading(true);
        
        // DEBUG: Log dell'ID dell'utente autenticato per verificare che sia corretto.
        console.log(`DEBUG: UID dell'utente autenticato: ${user.uid}`);
        
        // Ascolta in tempo reale le assegnazioni del cantiere per l'utente corrente
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (userDocSnap) => {
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();

                // DEBUG: Log dei dati dell'utente, in particolare companyID.
                console.log('DEBUG: Dati dell\'utente recuperati:', userData);
                // Salvo il companyID nello stato
                setCompanyID(userData.companyID); 
                
                const assegnazioniQuery = query(
                    collection(db, 'assegnazioneCantieri'),
                    where('userID', '==', user.uid),
                    where('companyID', '==', userData.companyID)
                );
                
                // DEBUG: Log della query esatta che stiamo eseguendo.
                console.log(`DEBUG: Eseguo la query con: userID=${user.uid} e companyID=${userData.companyID}`);

                // Ascolta in tempo reale la lista di assegnazioni
                const unsubscribe = onSnapshot(assegnazioniQuery, async (snapshot) => {
                    // DEBUG: Logga il numero di documenti trovati. Se è 0, la query non ha trovato corrispondenze.
                    console.log(`DEBUG: Trovate ${snapshot.size} assegnazioni che corrispondono alla query.`);

                    if (snapshot.empty) {
                        setCantieri([]);
                        setLoading(false);
                        return;
                    }

                    const cantieriIds = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.cantiereId) {
                            cantieriIds.push(data.cantiereId);
                        }
                    });
    
                    if (cantieriIds.length > 0) {
                        const cantieriList = await Promise.all(
                            cantieriIds.map(async (cantiereId) => {
                                const cantiereDocRef = doc(db, 'cantieri', cantiereId);
                                const cantiereDocSnap = await getDoc(cantiereDocRef);
                                return cantiereDocSnap.exists() ? { id: cantiereDocSnap.id, ...cantiereDocSnap.data() } : null;
                            })
                        );
                        setCantieri(cantieriList.filter(cantiere => cantiere !== null));
                    } else {
                        setCantieri([]);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Errore nel listener dei cantieri:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            } else {
                setCantieri([]);
                setCompanyID(null);
                setLoading(false);
            }
        }, (error) => {
            console.error("Errore nel listener dell'utente:", error);
            setLoading(false);
        });
        
        return () => unsubscribeUser();
    }, [user, db]);

    // Ritorna il companyID assieme agli altri valori
    return { cantieri, loading, companyID };
};
