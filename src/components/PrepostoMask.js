import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useCantieri } from '../hooks/useCantieri';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DocumentModal from './DocumentModal';
import MaskLayout from './MaskLayout';
import ActionButtons from './ActionButtons'; // Importiamo il nuovo componente

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

const PrepostoMask = ({ user, onLogout }) => {
    const [cantieri, setCantieri] = useState([]);
    const [selectedCantiere, setSelectedCantiere] = useState('');
    const [selectedCantiereName, setSelectedCantiereName] = useState('');
    const [cantieriLoading, setCantieriLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [documents, setDocuments] = useState([]);

    const { cantieri: cantieriFromHook, loading } = useCantieri(user, db);

    useEffect(() => {
        setCantieri(cantieriFromHook);
        setCantieriLoading(loading);
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

    // Dati di esempio per i documenti
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

    // Funzione per ottenere la posizione GPS
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

    // Funzione per salvare un report su Firestore
    const saveReport = async (reportType, fileUrls, location) => {
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
            const reportsRef = collection(db, `artifacts/${user.uid}/reports`);
            await addDoc(reportsRef, {
                userId: user.uid,
                cantiereId: selectedCantiere,
                tipologia: reportType,
                data: serverTimestamp(),
                fileUrls: fileUrls,
                location: location,
            });
            setStatusMessage(`${reportType} salvato con successo!`);
        } catch (error) {
            console.error("Errore nel salvataggio del report:", error);
            setStatusMessage(`Errore nel salvataggio del report: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Gestione della foto
    const handlePhoto = async (type) => {
        try {
            const file = await openFilePicker('image/*');
            setStatusMessage("Caricamento della foto...");
            const storage = getStorage();
            const storageRef = ref(storage, `reports/${user.uid}/${selectedCantiere}/foto_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            const location = await getGpsLocation();
            await saveReport(type, [fileUrl], location);
        } catch (error) {
            console.error("Errore nel processo foto:", error);
            setStatusMessage(`Errore nel processo foto: ${error.message}`);
        }
    };

    // Gestione del video
    const handleVideo = async () => {
        try {
            const file = await openFilePicker('video/*');
            setStatusMessage("Caricamento del video...");
            const storage = getStorage();
            const storageRef = ref(storage, `reports/${user.uid}/${selectedCantiere}/video_${Date.now()}.mp4`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);
            const location = await getGpsLocation();
            await saveReport("video", [fileUrl], location);
        } catch (error) {
            console.error("Errore nel processo video:", error);
            setStatusMessage(`Errore nel processo video: ${error.message}`);
        }
    };

    return (
        <MaskLayout
            user={user}
            onLogout={onLogout}
            selectedCantiere={selectedCantiere}
            onCantiereChange={handleCantiereChange}
            cantieri={cantieri}
            cantieriLoading={cantieriLoading}
            isSaving={isSaving}
            title="Benvenuto, Preposto"
            subtitle={user?.email}
        >
            {/* Contenuto specifico per la maschera del Preposto */}
            <div className="mt-8">
                {/* Utilizziamo il nuovo componente ActionButtons */}
                <ActionButtons
                    isSaving={isSaving}
                    selectedCantiere={selectedCantiere}
                    onPhoto={handlePhoto}
                    onVideo={handleVideo}
                    onOpenDocumentsModal={handleOpenDocumentsModal}
                />
            </div>

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
