/**
 * Funzione Firebase Cloud Function per salvare una rilevazione in cantiere.
 * Questa funzione agisce come un'API REST per ricevere dati da un'app esterna.
 *
 * I dati attesi nel corpo della richiesta (request.body) sono:
 * {
 * "cantiereId": "stringa",
 * "descrizione": "stringa",
 * "urlFoto": "stringa (opzionale)",
 * "urlVideo": "stringa (opzionale)",
 * "posizione": { "lat": numero, "lng": numero },
 * "userId": "stringa",
 * "companyID": "stringa"
 * }
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.salvaRilevazioneCantiere = functions.https.onRequest(async (request, response) => {
    // 1. Permetti le richieste CORS.
    response.set('Access-Control-Allow-Origin', '*');
    if (request.method === 'OPTIONS') {
        response.set('Access-Control-Allow-Methods', 'POST');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
        return;
    }

    // 2. Assicurati che il metodo della richiesta sia POST.
    if (request.method !== 'POST') {
        console.error('Metodo non consentito:', request.method);
        response.status(405).send({ status: 'error', message: 'Metodo non consentito. Usa POST.' });
        return;
    }

    // 3. Esegui la validazione dei dati.
    const data = request.body;
    if (!data.cantiereId || !data.userId || !data.companyID) {
        console.error('Dati mancanti:', data);
        response.status(400).send({ status: 'error', message: 'Dati obbligatori (cantiereId, userId, companyID) mancanti.' });
        return;
    }
    
    // Costruisci il documento da salvare su Firestore.
    const nuovaRilevazione = {
        cantiereId: data.cantiereId,
        descrizione: data.descrizione || '',
        urlFoto: data.urlFoto || null,
        urlVideo: data.urlVideo || null,
        posizione: data.posizione || null,
        userId: data.userId,
        companyID: data.companyID,
        timestamp: admin.firestore.FieldValue.serverTimestamp() // Data e ora del server
    };

    // 4. Salva i dati nella collezione di Firestore.
    try {
        const docRef = await db.collection('rilevazioni_cantiere').add(nuovaRilevazione);
        console.log('Rilevazione salvata con successo. ID documento:', docRef.id);
        response.status(200).send({ status: 'success', message: 'Rilevazione salvata con successo', docId: docRef.id });
    } catch (error) {
        console.error('Errore nel salvare la rilevazione:', error);
        response.status(500).send({ status: 'error', message: 'Errore interno del server', details: error.message });
    }
});
