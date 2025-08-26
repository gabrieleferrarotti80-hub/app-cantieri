import { useState, useEffect, useRef } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useReportSubmission = ({ db, storage, user, company, selectedCantiere, tipologiaAzione, setMessage }) => {
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const photoInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const API_ENDPOINT = 'https://salvarilevazionecantiere-test.cloudfunctions.net/salvaRilevazioneCantiere';

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleVideoCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setMessage("Posizione acquisita con successo!");
                },
                (error) => {
                    console.error("Errore nel recupero della posizione:", error);
                    setMessage("Impossibile recuperare la posizione.");
                }
            );
        } else {
            setMessage("Geolocalizzazione non supportata dal browser.");
        }
    };

    const handleFormSubmit = async () => {
        if (!selectedCantiere || !tipologiaAzione) {
            setMessage("Seleziona un cantiere e un'azione prima di inviare.");
            return;
        }

        if (!photo && !location) {
            setMessage("Aggiungi almeno una foto o la posizione prima di inviare.");
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            let photoUrl = '';
            if (photo) {
                const storageRef = ref(storage, `uploads/${user.uid}/${selectedCantiere}/${Date.now()}_${photo.name}`);
                const snapshot = await uploadBytes(storageRef, photo);
                photoUrl = await getDownloadURL(snapshot.ref);
            }

            const reportData = {
                cantiereId: selectedCantiere,
                userId: user.uid,
                companyId: company.id,
                azione: tipologiaAzione,
                photoUrl: photoUrl,
                location: location,
                timestamp: new Date().toISOString()
            };

            // Invia al Cloud Function se l'API_ENDPOINT è definito
            if (API_ENDPOINT) {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reportData)
                });

                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }

                const result = await response.json();
                console.log("Report inviato con successo:", result);
                setMessage("Report inviato con successo!");
            } else {
                console.warn("API_ENDPOINT non definito, salvataggio solo su Firestore.");
                // Salvataggio diretto su Firestore se la Cloud Function non è disponibile
                await addDoc(collection(db, 'reports'), reportData);
                setMessage("Report inviato con successo su Firestore (Cloud Function non configurata).");
            }

            setPhoto(null);
            setPhotoPreview(null);
            setLocation(null);
        } catch (error) {
            console.error("Errore nell'invio del report:", error);
            setMessage(`Errore: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        photo,
        photoPreview,
        handlePhotoCapture,
        handleVideoCapture,
        handleLocation,
        handleFormSubmit,
        loading,
        location,
        photoInputRef,
        videoInputRef
    };
};
