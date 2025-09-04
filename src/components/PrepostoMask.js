import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useCantieri } from '../hooks/useCantieri';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DocumentModal from './DocumentModal';
import MaskLayout from './MaskLayout';
import ActionButtons from './ActionButtons';

// Funzione di utilità per simulare l'apertura di un file picker
const openFilePicker = (accept) => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.capture = 'user';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                resolve(file);
            } else {
                reject(new Error("Nessun file selezionato."));
            }
        };
        input.click();
    });
};

const PrepostoMask = ({ user, userData, onLogout }) => {
    const [cantieri, setCantieri] = useState([]);
    const [selectedCantiere, setSelectedCantiere] = useState('');
    const [selectedCantiereName, setSelectedCantiereName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [documents, setDocuments] = useState([]);
    // Nuovo stato per l'array di URL
    const [fileUrls, setFileUrls] = useState([]);

    const { cantieri: cantieriFromHook, loading, companyID } = useCantieri(user, db);

    useEffect(() => {
        setCantieri(cantieriFromHook);
        if (!loading && cantieriFromHook.length > 0) {
            setSelectedCantiere(cantieriFromHook[0].id);
            setSelectedCantiereName(cantieriFromHook[0].nome);
        }
    }, [cantieriFromHook, loading]);

    const handleCantiereChange = (e) => {
        const cantiereId = e.target.value;
        setSelectedCantiere(cantiereId);
        const cantiere = cantieri.find(c => c.id === cantiereId);
        if (cantiere) {
            setSelectedCantiereName(cantiere.nome);
        }
    };

    const sampleDocuments = [
        { id: "doc1", nomeDocumento: "Planimetria cantiere.pdf", descrizione: "Mappa dettagliata del cantiere.", urlDocumento: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { id: "doc2", nomeDocumento: "Permessi di costruzione.pdf", descrizione: "Documenti approvati per i lavori.", urlDocumento: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { id: "doc3", nomeDocumento: "Lista materiali.docx", descrizione: "Elenco completo dei materiali da utilizzare.", urlDocumento: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { id: "doc4", nomeDocumento: "Schema impianto elettrico.dwg", descrizione: null, urlDocumento: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    ];

    const handleOpenDocumentsModal = () => {
        setDocuments(sampleDocuments);
        setModalOpen(true);
    };

    const getGpsLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        reject(new Error(`Errore GPS: ${error.message}`));
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                reject(new Error("Geolocalizzazione non supportata dal browser."));
            }
        });
    };

    // Funzione per salvare il report con la tipologia specificata
    // Ora accetta un array di URL, non un singolo URL
    const saveReport = async (reportType, urls, location, companyId, cantiereName) => {
        if (!selectedCantiere) {
            setStatusMessage("Per favore, seleziona un cantiere prima di procedere.");
            return;
        }
        if (!user || !user.uid) {
            setStatusMessage("Utente non autenticato. Riprova il login.");
            return;
        }

        setIsSaving(true);
        setStatusMessage(`Salvataggio ${reportType}...`);

        try {
            const reportsRef = collection(db, "reports");
            
            const prepostoName = userData ? `${userData.nome} ${userData.cognome}` : user.email || 'Utente Sconosciuto';
            
            const reportData = {
                userId: user.uid,
                companyID: companyId,
                cantiereId: selectedCantiere,
                tipologia: reportType,
                data: serverTimestamp(),
                fileUrls: urls, // Usa l'array di URL
                location: location,
                prepostoName: prepostoName,
                cantiereName: cantiereName,
            };
            
            await addDoc(reportsRef, reportData);
            setStatusMessage(`${reportType} salvato con successo!`);
            // Resetta l'array di URL dopo il salvataggio
            setFileUrls([]); 
        } catch (error) {
            console.error("Errore nel salvataggio del report:", error);
            setStatusMessage(`Errore nel salvataggio del report: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Funzione per gestire l'acquisizione di foto. 
    // Aggiunge l'URL all'array senza salvare immediatamente
    const handlePhoto = async () => {
        try {
            const file = await openFilePicker('image/*');
            setStatusMessage(`Caricamento foto in corso...`);
            const storage = getStorage();
            const storageRef = ref(storage, `reports/${user.uid}/${selectedCantiere}/foto_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            // Aggiorna lo stato dell'array con il nuovo URL
            setFileUrls(prevUrls => [...prevUrls, fileUrl]);
            setStatusMessage(`Foto caricata. Totale foto: ${fileUrls.length + 1}.`);
        } catch (error) {
            console.error("Errore nella gestione della foto:", error);
            setStatusMessage(`Errore nella gestione della foto: ${error.message}`);
        }
    };
    
    // Funzione per gestire l'acquisizione di video. 
    // Aggiunge l'URL all'array senza salvare immediatamente
    const handleVideo = async () => {
        try {
            const file = await openFilePicker('video/*');
            setStatusMessage(`Caricamento video in corso...`);
            const storage = getStorage();
            const storageRef = ref(storage, `reports/${user.uid}/${selectedCantiere}/video_${Date.now()}.mp4`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            // Aggiorna lo stato dell'array con il nuovo URL
            setFileUrls(prevUrls => [...prevUrls, fileUrl]);
            setStatusMessage(`Video caricato. Totale file: ${fileUrls.length + 1}.`);
        } catch (error) {
            console.error("Errore nella gestione del video:", error);
            setStatusMessage(`Errore nella gestione del video: ${error.message}`);
        }
    };

    // Nuova funzione per gestire il salvataggio finale del report
    const handleSaveReport = async (reportType) => {
        // Verifica che ci siano file da salvare
        if (fileUrls.length === 0) {
            setStatusMessage("Nessun file da salvare. Scatta almeno una foto o registra un video.");
            return;
        }

        try {
            const location = await getGpsLocation();
            await saveReport(reportType, fileUrls, location, companyID, selectedCantiereName);
        } catch (error) {
            setStatusMessage(`Errore nel salvataggio del report: ${error.message}`);
        }
    };

    return (
        <MaskLayout
            user={user}
            onLogout={onLogout}
            selectedCantiere={selectedCantiere}
            onCantiereChange={handleCantiereChange}
            cantieri={cantieri}
            cantieriLoading={loading}
            isSaving={isSaving}
            title="Benvenuto, Preposto"
            subtitle={user?.email}
        >
            {/* Mostra il numero di file pronti per il salvataggio */}
            {fileUrls.length > 0 && (
                <div className="mt-4 p-4 text-center text-sm font-medium text-gray-700 bg-blue-100 rounded-lg">
                    Hai {fileUrls.length} file pronti per il salvataggio.
                </div>
            )}

            <ActionButtons 
                isSaving={isSaving} 
                selectedCantiere={selectedCantiere} 
                onPhoto={handlePhoto} 
                onVideo={handleVideo} 
                onOpenDocumentsModal={handleOpenDocumentsModal} 
            />

            {/* Aggiungi un pulsante per salvare il report con i file accumulati */}
            {fileUrls.length > 0 && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => handleSaveReport("Report Fotografico")}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors"
                        disabled={isSaving}
                    >
                        Salva Report ( {fileUrls.length} file )
                    </button>
                </div>
            )}

            {statusMessage && (
                <div className="mt-4 p-4 text-center text-sm font-medium text-gray-700 bg-gray-200 rounded-lg">
                    {statusMessage}
                </div>
            )}

            <DocumentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                documents={documents}
                cantiereName={selectedCantiereName}
            />
        </MaskLayout>
    );
};

export default PrepostoMask;