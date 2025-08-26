// Includi il CDN di Tailwind CSS qui. È fondamentale che sia caricato.
// Se hai problemi di stile, assicurati che questa riga sia presente e corretta.
// In alternativa, potresti voler aggiungere questa riga direttamente nel tuo file public/index.html
// all'interno della sezione <head> per assicurare che sia caricato per primo.
// Esempio: <script src="https://cdn.tailwindcss.com"></script>

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs, onSnapshot, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { CameraIcon, MapPinIcon, ArrowPathIcon, UserIcon, BuildingOfficeIcon, BriefcaseIcon, WrenchScrewdriverIcon, ChartBarIcon, PowerIcon, CubeTransparentIcon, VideoCameraIcon, FolderOpenIcon, DocumentTextIcon, PlusIcon, CloudArrowUpIcon, XMarkIcon, ArrowDownTrayIcon, EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx';

// LA TUA CHIAVE API REALE E COMPLETA È STATA INSERITA QUI SOTTO.
// NON MODIFICARE QUESTA RIGA SE NON PER INCOLLARE LA CHIAVE CORRETTA DALLA TUA CONSOLE FIREBASE.
const firebaseConfig = {
    apiKey: "AIzaSyB_EdiydILfZ7S8u7E32dr3YSWaaqvZ4TM",
    authDomain: "gestionale-cantieri-app-12345.firebaseapp.com",
    projectId: "gestionale-cantieri-app-12345",
    storageBucket: "gestionale-cantieri-app-12345.firebasestorage.app",
    messagingSenderId: "812017499241",
    appId: "1:812017499241:web:0f025fbb31eb3c2eacb6f8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'default');
const storage = getStorage(app);

const BACKEND_URL = 'https://backend-cantieri-812017499241-812017499241.europe-west1.run.app';
const MANAGER_EMAIL = 'gabrieleferrarotti80@gmail.com';

const USER_ROLES = ['operaio', 'preposto', 'magazziniere', 'tecnico', 'amministrazione', 'titolare azienda', 'proprietario', 'it'];

// Componente per la schermata di login
const LoginScreen = ({ onLoginSuccess, onGoToRegister, deferredInstallPrompt, onInstallPromptClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        console.log('DEBUG LOGIN: handleLogin chiamato.');
        console.log('DEBUG LOGIN: Email:', email, 'Password:', password ? '*****' : 'VUOTA');
        setError('');
        try {
            console.log('DEBUG LOGIN: Tentativo signInWithEmailAndPassword...');
            await signInWithEmailAndPassword(auth, email, password);
            console.log('DEBUG LOGIN: signInWithEmailAndPassword riuscito.');
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            console.error("Login error:", err.message);
            setError("Credenziali non valide. Riprova.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Accedi all'App Cantieri</h2>
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Inserisci la tua email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200"
                >
                    Login
                </button>
                <div className="mt-4 text-center">
                    <button
                        onClick={onGoToRegister}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                        Registrati
                    </button>
                </div>
                {deferredInstallPrompt && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={onInstallPromptClick}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" /> Installa App
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente per la schermata di registrazione


// Componente Modale per la visualizzazione dei documenti
const DocumentModal = ({ isOpen, onClose, documents, cantiereName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Documenti per {cantiereName}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                {documents.length === 0 ? (
                    <p className="text-gray-600">Nessun documento disponibile per questo cantiere.</p>
                ) : (
                    <ul className="space-y-3">
                        {documents.map((doc, index) => (
                            <li key={doc.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                                <a
                                    href={doc.fileURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 truncate"
                                    title={doc.title || doc.fileName}
                                >
                                    <DocumentTextIcon className="h-5 w-5" />
                                    {doc.title || doc.fileName}
                                </a>
                                <span className="text-sm text-gray-500 ml-2">
                                    ({(doc.fileURL.split('.').pop() || 'file').toUpperCase()})
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

// Componente principale dell'App
function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [cantieriData, setCantieriData] = useState([]);
    const [loadingCantieri, setLoadingCantieri] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedUserNameForCompany, setSelectedUserNameForCompany] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [appMessage, setAppMessage] = useState('');
    const [showRegisterScreen, setShowRegisterScreen] = useState(false);
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

    // Logica per il prompt di installazione PWA
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredInstallPrompt(e);
            console.log('DEBUG PWA: beforeinstallprompt event catturato.');
        };

        const handleAppInstalled = () => {
            setDeferredInstallPrompt(null);
            console.log('DEBUG PWA: App installata con successo.');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallPromptClick = () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('DEBUG PWA: Utente ha accettato l\'installazione.');
                } else {
                    console.log('DEBUG PWA: Utente ha rifiutato l\'installazione.');
                }
                setDeferredInstallPrompt(null);
            });
        }
    };

    // Maschera Preposto
    const PrepostoMask = ({ user, company, cantieriData, onLogout, selectedUserNameForCompany }) => {
        const [selectedCantiere, setSelectedCantiere] = useState('');
        const [tipologiaAzione, setTipologiaAzione] = useState('');
        const [photo, setPhoto] = useState(null);
        const [photoPreview, setPhotoPreview] = useState(null);
        const [location, setLocation] = useState(null);
        const [message, setMessage] = useState('');
        const [loading, setLoading] = useState(false);
        const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
        const [cantiereDocuments, setCantiereDocuments] = useState([]);
        const [showPhotoButton, setShowPhotoButton] = useState(false);

        const photoInputRef = useRef(null);
        const videoInputRef = useRef(null);

        const filteredCantieri = cantieriData.filter(item => {
            const match = item.azienda === company && item['ID Utente'] === user.email;
            return match;
        });
        
        const availableCantieri = [...new Set(filteredCantieri.map(item => item.cantiere))];

        useEffect(() => {
            // console.log('DEBUG PREPOSTO (useEffect): User UID ricevuto da PrepostoMask:', user?.uid);
        }, [user]);

        const triggerPhotoCapture = () => {
            if (!selectedCantiere) {
                setMessage('Selezionare prima un cantiere.');
                return;
            }
            console.log('DEBUG TRIGGER: Attivazione input file per FOTO.');
            photoInputRef.current.click();
        };

        const triggerVideoCapture = () => {
            if (!selectedCantiere) {
                setMessage('Selezionare prima un cantiere per registrare un video.');
                return;
            }
            console.log('DEBUG TRIGGER: Attivazione input file per VIDEO.');
            videoInputRef.current.click();
        };

        const handlePhotoCapture = async (e) => {
            console.log('DEBUG CAMERA: handlePhotoCapture triggered.');
            const file = e.target.files[0];
            if (file) {
                console.log('DEBUG CAMERA: File selezionato:', file.name, file.type);
                setPhoto(file);
                setPhotoPreview(URL.createObjectURL(file));
                setMessage('Foto acquisita. Tentativo di acquisire la posizione e inviare il report...');
                await handleGetLocationAndSubmitReport(file, 'photo');
            } else {
                console.log('DEBUG CAMERA: Nessun file selezionato o acquisizione annullata.');
                setMessage('Acquisizione foto annullata o nessun file selezionato.');
            }
        };

        const handleVideoCapture = async (e) => {
            console.log('DEBUG VIDEO: handleVideoCapture triggered.');
            const file = e.target.files[0];
            if (file) {
                console.log('DEBUG VIDEO: File selezionato:', file.name, file.type);
                setPhoto(file);
                setPhotoPreview(URL.createObjectURL(file));
                setMessage('Video acquisito. Tentativo di acquisire la posizione e inviare il report...');
                await handleGetLocationAndSubmitReport(file, 'video');
            } else {
                console.log('DEBUG VIDEO: Nessun file selezionato o acquisizione annullata.');
                setMessage('Acquisizione video annullata o nessun file selezionato.');
            }
        };

        const handleGetLocationAndSubmitReport = async (mediaFile, mediaType) => {
            setLoading(true);
            setMessage(`Acquisizione posizione e invio ${mediaType} in corso...`);
            console.log(`DEBUG PROCESS: Avvio processo di sottomissione per ${mediaType}.`);
            
            let currentPosition = { latitude: 0, longitude: 0 };
            let geolocationErrorMessage = '';

            try {
                console.log('DEBUG GEOLOCATION: Tentativo di acquisire la geolocalizzazione...');
                if (navigator.geolocation) {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                console.log('DEBUG GEOLOCATION: Posizione acquisita:', pos.coords.latitude, pos.coords.longitude);
                                resolve(pos);
                            },
                            (err) => {
                                console.error('DEBUG GEOLOCATION: Errore geolocalizzazione:', err);
                                reject(err);
                            },
                            { 
                                enableHighAccuracy: true, 
                                timeout: 20000,
                                maximumAge: 0
                            }
                        );
                    });
                    currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setLocation(currentPosition);
                    console.log('DEBUG GEOLOCATION: Geolocalizzazione riuscita.');
                } else {
                    geolocationErrorMessage = 'La geolocalizzazione non è supportata dal tuo browser.';
                    console.warn('DEBUG GEOLOCATION: Geolocalizzazione non supportata.');
                }
            } catch (error) {
                if (error.code === error.PERMISSION_DENIED) {
                    geolocationErrorMessage = "Accesso alla geolocalizzazione negato. Concedi i permessi o riprova.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    geolocationErrorMessage = "Posizione non disponibile. Assicurati che il GPS sia attivo e riprova.";
                } else if (error.code === error.TIMEOUT) {
                    geolocationErrorMessage = "Timeout geolocalizzazione. Impossibile ottenere la posizione. Prova in un'area con segnale migliore.";
                } else {
                    geolocationErrorMessage = `Errore acquisizione posizione: ${error.message}.`;
                }
                console.error("DEBUG GEOLOCATION: Errore generale geolocalizzazione:", error);
            }

            if (geolocationErrorMessage) {
                setMessage(`${geolocationErrorMessage} Procedo con l'invio del report senza posizione.`);
            } else {
                setMessage(`Posizione acquisita. Caricamento ${mediaType} in corso...`);
            }

            console.log('DEBUG UPLOAD: Avvio processo di upload media...');
            try {
                let mediaURL = '';
                if (mediaFile) {
                    if (!user || !user.uid) {
                        throw new Error(`ID utente non disponibile per l'upload. Riprova il login.`);
                    }
                    const storagePath = `reports/${user.uid}/${selectedCantiere}/${Date.now()}_${mediaFile.name}`;
                    const storageRef = ref(storage, storagePath);
                    console.log('DEBUG UPLOAD: Tentativo uploadBytes per path:', storagePath);
                    await uploadBytes(storageRef, mediaFile);
                    console.log('DEBUG UPLOAD: uploadBytes completato. Tentativo getDownloadURL...');
                    mediaURL = await getDownloadURL(storageRef);
                    console.log(`DEBUG UPLOAD: ${mediaType} uploaded:`, mediaURL);
                }

                const reportData = {
                    operatorId: user.uid || 'N/A_UID',
                    operatorEmail: user.email || 'N/A_EMAIL',
                    operatorName: selectedUserNameForCompany || 'N/A_NAME',
                    company: company || 'N/A_COMPANY',
                    cantiere: selectedCantiere || 'N/A_CANTIERE',
                    tipologia: tipologiaAzione || 'N/A_TIPOLOGIA',
                    latitude: currentPosition?.latitude || 0,
                    longitude: currentPosition?.longitude || 0,
                    mediaURL: mediaURL || '',
                    mediaType: mediaType || 'N/A_MEDIATYPE',
                    timestamp: new Date().toISOString(),
                };

                const cleanReportData = Object.fromEntries(
                    Object.entries(reportData).filter(([_, value]) => value !== undefined)
                );

                console.log('DEBUG FIRESTORE: Tentativo di salvare cleanReportData. Dati:', JSON.stringify(cleanReportData, null, 2));

                const docId = `${Date.now()}`; 
                await setDoc(doc(db, "reports", docId), cleanReportData); 
                console.log('DEBUG FIRESTORE: setDoc completato con successo su "reports" con ID:', docId);

                setMessage(`${mediaType === 'photo' ? 'Report fotografico' : 'Report video'} inviato con successo!`);
            } catch (error) {
                setMessage(`Errore invio ${mediaType}: ${error.message}`);
                console.error("DEBUG UPLOAD/FIRESTORE: Errore durante upload o scrittura Firestore:", error);
            } finally {
                setLoading(false);
                setShowPhotoButton(false);
                setTimeout(() => {
                    setSelectedCantiere(''); 
                    setTipologiaAzione(''); 
                    setPhoto(null);
                    setPhotoPreview(null);
                    setLocation(null);
                    setMessage('');
                }, 3000);
                console.log('DEBUG PROCESS: Processo completato (blocco finally).');
            }
        };

        const fetchCantiereDocuments = async () => {
            if (!selectedCantiere || !company) {
                setMessage("Selezionare un cantiere per visualizzare i documenti.");
                return;
            }
            
            setLoading(true);
            setMessage("Caricamento documenti...");
            try {
                const cantiereRecord = cantieriData.find(item => item.azienda === company && item.cantiere === selectedCantiere);
                
                if (!cantiereRecord) {
                    setMessage("Dati cantiere non trovati per la visualizzazione documenti.");
                    setLoading(false);
                    return;
                }

                const q = query(
                    collection(db, "cantiereDocuments"),
                    where("azienda", "==", company),
                    where("cantiere", "==", selectedCantiere)
                );
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCantiereDocuments(docs);
                setIsDocumentModalOpen(true);
                setMessage("");
            } catch (error) {
                console.error("Errore nel recupero documenti:", error);
                setMessage(`Errore nel recupero documenti: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex flex-col items-center">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-8 mt-8 mb-4">
                    <div className="flex justify-end items-center mb-6">
                        <button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
                        >
                            <PowerIcon className="h-5 w-5" /> Logout
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4 text-center text-lg">Benvenuto, <span className="font-semibold text-blue-700">{selectedUserNameForCompany}</span> di <span className="font-semibold text-blue-700">{company}</span>!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cantiere">
                                Seleziona Cantiere
                            </label>
                            <select
                                id="cantiere"
                                className="shadow border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={selectedCantiere}
                                onChange={(e) => {
                                    setSelectedCantiere(e.target.value);
                                    setMessage('');
                                    setPhoto(null);
                                    setPhotoPreview(null);
                                    setLocation(null);
                                    setTipologiaAzione('');
                                    setShowPhotoButton(false);
                                }}
                            >
                                <option value="">Scegli un cantiere</option>
                                {availableCantieri.map(cantiere => (
                                    <option key={cantiere} value={cantiere}>{cantiere}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="azione">
                                Tipologia Azione
                            </label>
                            <select
                                id="azione"
                                className="shadow border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={tipologiaAzione}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    if (!selectedCantiere) {
                                        setMessage('Selezionare prima un cantiere.');
                                        e.target.value = '';
                                        setShowPhotoButton(false);
                                        return;
                                    }
                                    setTipologiaAzione(selectedValue);

                                    if (['Inizio Lavoro', 'Lavoro', 'Fine Lavoro'].includes(selectedValue)) {
                                        setShowPhotoButton(true);
                                        setMessage('Azione selezionata. Clicca "Scatta Foto" per acquisire.');
                                    } else {
                                        setShowPhotoButton(false);
                                        setMessage('');
                                    }
                                }}
                            >
                                <option value="">Scegli un'azione</option>
                                <option value="Inizio Lavoro">Inizio Lavoro (Foto)</option>
                                <option value="Lavoro">Lavoro (Foto)</option>
                                <option value="Fine Lavoro">Fine Lavoro (Foto)</option>
                            </select>
                        </div>

                        <input type="file" ref={photoInputRef} accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                        <input type="file" ref={videoInputRef} accept="video/*" capture="environment" onChange={handleVideoCapture} className="hidden" />

                        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                            {showPhotoButton && (
                                <button
                                    onClick={triggerPhotoCapture}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={loading || !selectedCantiere || !tipologiaAzione}
                                >
                                    <CameraIcon className="h-5 w-5" /> Scatta Foto
                                </button>
                            )}

                            <button
                                onClick={triggerVideoCapture}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={!selectedCantiere || loading}
                            >
                                <VideoCameraIcon className="h-5 w-5" /> Registra Video
                            </button>
                            
                            <button
                                onClick={fetchCantiereDocuments}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={!selectedCantiere || loading}
                            >
                                <FolderOpenIcon className="h-5 w-5" /> Documenti Cantiere
                            </button>

                            {photoPreview && (
                                <div className="mt-4">
                                    <p className="text-gray-700 text-sm font-semibold mb-2">Anteprima Media:</p>
                                    {photoPreview.startsWith('blob:video') ? (
                                        <video src={photoPreview} controls className="w-full h-48 object-cover rounded-xl shadow-md" />
                                    ) : (
                                        <img src={photoPreview} alt="Anteprima" className="w-full h-48 object-cover rounded-xl shadow-md" />
                                    )}
                                </div>
                            )}
                            {location && (
                                <p className="text-gray-700 text-sm mt-2">
                                    Posizione: Latitudine {location.latitude.toFixed(4)}, Longitudine {location.longitude.toFixed(4)}
                                </p>
                            )}
                            {message && <p className="text-blue-600 text-sm mt-2">{message}</p>}
                        </div>
                    </div>
                </div>
                <DocumentModal 
                    isOpen={isDocumentModalOpen} 
                    onClose={() => setIsDocumentModalOpen(false)} 
                    documents={cantiereDocuments}
                    cantiereName={selectedCantiere}
                />
            </div>
        );
    };

    // Maschera Tecnico
    const TecnicoMask = ({ user, company, onLogout, selectedUserNameForCompany }) => {
        const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
        const [cantiereDocuments, setCantiereDocuments] = useState([]);
        const [message, setMessage] = useState('');

        const handleOpenDocuments = async () => {
            setMessage("Funzionalità di visualizzazione documenti in fase di sviluppo. Il caricamento è riservato al Gestore.");
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4 flex flex-col items-center">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-8 mt-8 mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Maschera Tecnico</h2>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
                        >
                            <PowerIcon className="h-5 w-5" /> Logout
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4">Benvenuto, <span className="font-semibold text-green-700">{selectedUserNameForCompany}</span> di <span className="font-semibold text-green-700">{company}</span>!</p>
                    <p className="text-gray-700">Qui verranno visualizzate le funzionalità specifiche per il Tecnico, come la visualizzazione dettagliata dei report e la gestione degli interventi.</p>
                    
                    <div className="mt-6 flex flex-col gap-4">
                        <button
                            onClick={handleOpenDocuments}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2"
                        >
                            <FolderOpenIcon className="h-5 w-5" /> Documenti
                        </button>
                        {message && <p className="text-blue-600 text-sm mt-2 text-center">{message}</p>}
                    </div>

                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-green-800 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="h-6 w-6" />
                        <span>Funzionalità Tecniche in fase di sviluppo...</span>
                    </div>
                </div>
                <DocumentModal 
                    isOpen={isDocumentModalOpen} 
                    onClose={() => setIsDocumentModalOpen(false)} 
                    documents={cantiereDocuments}
                    cantiereName="Il tuo cantiere"
                />
            </div>
        );
    };

    // Maschera Amministratore
    const AmministratoreMask = ({ user, company, onLogout, selectedUserNameForCompany }) => {
        const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
        const [cantiereDocuments, setCantiereDocuments] = useState([]);
        const [message, setMessage] = useState('');

        const handleOpenDocuments = async () => {
            setMessage("Funzionalità di visualizzazione documenti in fase di sviluppo. Il caricamento è riservato al Gestore.");
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 p-4 flex flex-col items-center">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-8 mt-8 mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Maschera Amministratore</h2>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
                        >
                            <PowerIcon className="h-5 w-5" /> Logout
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4">Benvenuto, <span className="font-semibold text-orange-700">{selectedUserNameForCompany}</span> di <span className="font-semibold text-orange-700">{company}</span>!</p>
                    <p className="text-gray-700">Qui verranno visualizzate le funzionalità di gestione per la tua azienda, come la supervisione dei cantieri e degli operatori.</p>
                    
                    <div className="mt-6 flex flex-col gap-4">
                        <button
                            onClick={handleOpenDocuments}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2"
                        >
                            <FolderOpenIcon className="h-5 w-5" /> Documenti
                        </button>
                        {message && <p className="text-blue-600 text-sm mt-2 text-center">{message}</p>}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center gap-2">
                        <BuildingOfficeIcon className="h-6 w-6" />
                        <span>Funzionalità Amministrative in fase di sviluppo...</span>
                    </div>
                </div>
                <DocumentModal 
                    isOpen={isDocumentModalOpen} 
                    onClose={() => setIsDocumentModalOpen(false)} 
                    documents={cantiereDocuments}
                    cantiereName="Il tuo cantiere"
                />
            </div>
        );
    };

    // Maschera Magazzino
    const MagazzinoMask = ({ user, company, onLogout, selectedUserNameForCompany }) => {
        const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
        const [cantiereDocuments, setCantiereDocuments] = useState([]);
        const [message, setMessage] = useState('');

        const handleOpenDocuments = async () => {
            setMessage("Funzionalità di visualizzazione documenti in fase di sviluppo. Il caricamento è riservato al Gestore.");
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-500 to-slate-700 p-4 flex flex-col items-center">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-8 mt-8 mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Maschera Magazzino</h2>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
                        >
                            <PowerIcon className="h-5 w-5" /> Logout
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4">Benvenuto, <span className="font-semibold text-slate-700">{selectedUserNameForCompany}</span> di <span className="font-semibold text-slate-700">{company}</span>!</p>
                    <p className="text-gray-700">Qui verranno visualizzate le funzionalità specifiche per la gestione del magazzino, come inventario, entrate/uscite materiali.</p>
                    
                    <div className="mt-6 flex flex-col gap-4">
                        <button
                            onClick={handleOpenDocuments}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2"
                        >
                            <FolderOpenIcon className="h-5 w-5" /> Documenti
                        </button>
                        {message && <p className="text-blue-600 text-sm mt-2 text-center">{message}</p>}
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 flex items-center gap-2">
                        <CubeTransparentIcon className="h-6 w-6" />
                        <span>Funzionalità Magazzino in fase di sviluppo...</span>
                    </div>
                </div>
                <DocumentModal 
                    isOpen={isDocumentModalOpen} 
                    onClose={() => setIsDocumentModalOpen(false)} 
                    documents={cantiereDocuments}
                    cantiereName="Il tuo cantiere"
                />
            </div>
        );
    };

    // Maschera Gestore
    const GestoreMask = ({ user, cantieriData, onLogout }) => {
        const [activeTab, setActiveTab] = useState('overview');
        const [uploadCompany, setUploadCompany] = useState('');
        const [uploadCantiere, setUploadCantiere] = useState('');
        const [documentTitle, setDocumentTitle] = useState('');
        const [documentFile, setDocumentFile] = useState(null);
        const [uploadMessage, setUploadMessage] = useState('');
        const [uploadLoading, setUploadLoading] = useState(false);
        const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
        const [cantiereDocuments, setCantiereDocuments] = useState([]);
        const [viewDocCantiere, setViewDocCantiere] = useState('');

        // Stati per la Gestione Utenti
        const [users, setUsers] = useState([]);
        const [newUserEmail, setNewUserEmail] = useState('');
        const [newUserNameCognome, setNewUserNameCognome] = useState('');
        const [newUserPhone, setNewUserPhone] = useState('');
        const [newUserRole, setNewUserRole] = useState(USER_ROLES[0]);
        const [newUserPassword, setNewUserPassword] = useState('');
        const [showNewUserPassword, setShowNewUserPassword] = useState(false);
        const [userManagementMessage, setUserManagementMessage] = useState('');
        const [userManagementLoading, setUserManagementLoading] = useState(false);
        const [editingUser, setEditingUser] = useState(null);

        const allCompanies = [...new Set(cantieriData.map(item => item.azienda))];
        const cantieriForSelectedCompany = uploadCompany ? [...new Set(cantieriData.filter(item => item.azienda === uploadCompany).map(item => item.cantiere))] : [];
        const allCantieri = [...new Set(cantieriData.map(item => item.cantiere))];

        // Funzione per recuperare tutti gli utenti (da Firestore)
        const fetchUsers = async () => {
            setUserManagementLoading(true);
            setUserManagementMessage('Caricamento utenti...');
            try {
                const usersCollectionRef = collection(db, "users");
                const q = query(usersCollectionRef);
                const querySnapshot = await getDocs(q);
                const fetchedUsers = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(fetchedUsers);
                setUserManagementMessage('Utenti caricati.');
            } catch (error) {
                console.error("Errore nel recupero utenti da Firestore:", error);
                setUserManagementMessage(`Errore nel recupero utenti: ${error.message}`);
            } finally {
                setUserManagementLoading(false);
            }
        };

        // Effetto per caricare gli utenti quando la tab cambia o al primo render
        useEffect(() => {
            if (activeTab === 'manageUsers') {
                fetchUsers();
            }
        }, [activeTab]);

        // Gestione creazione/modifica utente
        const handleCreateOrUpdateUser = async () => {
            setUserManagementLoading(true);
            setUserManagementMessage('');

            if (!newUserEmail || !newUserNameCognome || !newUserRole || (!editingUser && !newUserPassword)) {
                setUserManagementMessage('Per favore, compila tutti i campi obbligatori.');
                setUserManagementLoading(false);
                return;
            }
            if (!editingUser && newUserPassword.length < 6) {
                setUserManagementMessage('La password deve essere di almeno 6 caratteri.');
                setUserManagementLoading(false);
                return;
            }

            try {
                let response;
                if (editingUser) {
                    setUserManagementMessage('Aggiornamento utente in corso...');
                    const payload = {
                        email: newUserEmail,
                        nameCognome: newUserNameCognome,
                        phone: newUserPhone,
                        role: newUserRole,
                        password: newUserPassword || undefined
                    };
                    response = await fetch(`${BACKEND_URL}/api/users/${editingUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    setUserManagementMessage('Creazione nuovo utente in corso...');
                    const payload = {
                        email: newUserEmail,
                        password: newUserPassword,
                        nameCognome: newUserNameCognome,
                        phone: newUserPhone,
                        role: newUserRole
                    };
                    response = await fetch(`${BACKEND_URL}/api/users/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                }

                if (response.ok) {
                    const result = await response.json();
                    setUserManagementMessage(editingUser ? 'Utente aggiornato con successo!' : 'Utente creato con successo!');
                    console.log("DEBUG USER MANAGEMENT: Backend response:", result);

                    if (!editingUser) {
                        try {
                            const emailPayload = {
                                userEmail: newUserEmail,
                                userRole: newUserRole,
                                managerEmail: MANAGER_EMAIL,
                                userNameCognome: newUserNameCognome
                            };
                            await fetch(`${BACKEND_URL}/api/send-registration-email`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(emailPayload),
                            });
                            console.log('DEBUG USER MANAGEMENT: Richiesta invio email al backend per nuova registrazione.');
                        } catch (emailError) {
                            console.error('DEBUG USER MANAGEMENT: Errore durante la richiesta di invio email al backend:', emailError);
                        }
                    }

                    setNewUserEmail('');
                    setNewUserNameCognome('');
                    setNewUserPhone('');
                    setNewUserRole(USER_ROLES[0]);
                    setNewUserPassword('');
                    setShowNewUserPassword(false);
                    setEditingUser(null);
                    fetchUsers();
                } else {
                    const errorData = await response.json();
                    setUserManagementMessage(`Errore: ${errorData.error || 'Qualcosa è andato storto.'}`);
                    console.error("DEBUG USER MANAGEMENT: Backend error:", errorData);
                }
            } catch (error) {
                setUserManagementMessage(`Errore di rete: ${error.message}`);
                console.error("DEBUG USER MANAGEMENT: Network error:", error);
            } finally {
                setUserManagementLoading(false);
            }
        };

        const handleEditClick = (userToEdit) => {
            setEditingUser(userToEdit);
            setNewUserEmail(userToEdit.email);
            setNewUserNameCognome(userToEdit.nameCognome || '');
            setNewUserPhone(userToEdit.phone || '');
            setNewUserRole(userToEdit.role || USER_ROLES[0]);
            setNewUserPassword('');
            setUserManagementMessage('');
            setActiveTab('manageUsers');
        };

        const handleCancelEdit = () => {
            setEditingUser(null);
            setNewUserEmail('');
            setNewUserNameCognome('');
            setNewUserPhone('');
            setNewUserRole(USER_ROLES[0]);
            setNewUserPassword('');
            setShowNewUserPassword(false);
            setUserManagementMessage('');
        };

        const handleDisableEnableUser = async (userToToggle) => {
            setUserManagementLoading(true);
            setUserManagementMessage('');
            try {
                const newStatus = userToToggle.disabled ? false : true;
                const payload = { disabled: newStatus };
                const response = await fetch(`${BACKEND_URL}/api/users/${userToToggle.id}/disable`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    setUserManagementMessage(`Utente ${userToToggle.email} ${newStatus ? 'disabilitato' : 'abilitato'} con successo!`);
                    fetchUsers();
                } else {
                    const errorData = await response.json();
                    setUserManagementMessage(`Errore: ${errorData.error || 'Impossibile modificare lo stato utente.'}`);
                }
            } catch (error) {
                setUserManagementMessage(`Errore di rete: ${error.message}`);
                console.error("DEBUG USER MANAGEMENT: Network error:", error);
            } finally {
                setUserManagementLoading(false);
            }
        };

        const handleExportUsersToExcel = () => {
            if (users.length === 0) {
                setUserManagementMessage('Nessun utente da esportare.');
                return;
            }

            const dataToExport = users.map(user => ({
                'ID Utente': user.id,
                'Email': user.email,
                'Nome Cognome': user.nameCognome || '',
                'Telefono': user.phone || '',
                'Ruolo': user.role || 'N/A',
                'Data Registrazione': user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : '',
                'Disabilitato': user.disabled ? 'Sì' : 'No'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Utenti");
            XLSX.writeFile(wb, "lista_utenti_app_cantieri.xlsx");
            setUserManagementMessage('Utenti esportati in Excel!');
        };

        const handleDocumentFileChange = (e) => {
            setDocumentFile(e.target.files[0]);
        };

        const handleUploadDocument = async () => {
            if (!uploadCompany || !uploadCantiere || !documentTitle || !documentFile) {
                setUploadMessage('Per favor, compila tutti i campi e seleziona un file.');
                return;
            }

            setUploadLoading(true);
            setUploadMessage('Caricamento documento in corso...');

            try {
                const fileExtension = documentFile.name.split('.').pop();
                const storagePath = `documents/${uploadCompany}/${uploadCantiere}/${documentTitle}_${Date.now()}.${fileExtension}`;
                const storageRef = ref(storage, storagePath);
                await uploadBytes(storageRef, documentFile);
                const fileURL = await getDownloadURL(storageRef);

                const docData = {
                    azienda: uploadCompany,
                    cantiere: uploadCantiere,
                    title: documentTitle,
                    fileURL: fileURL,
                    fileName: documentFile.name,
                    mimeType: documentFile.type,
                    uploadedBy: user.email,
                    timestamp: new Date().toISOString(),
                };

                await setDoc(doc(db, "cantiereDocuments", `${uploadCompany}_${uploadCantiere}_${Date.now()}`), docData);
                setUploadMessage('Documento caricato con successo!');
                setUploadCompany('');
                setUploadCantiere('');
                setDocumentTitle('');
                setDocumentFile(null);
                if (document.getElementById('documentFileInput')) {
                    document.getElementById('documentFileInput').value = '';
                }
            } catch (error) {
                console.error("Errore caricamento documento:", error);
                setUploadMessage(`Errore caricamento documento: ${error.message}`);
            } finally {
                setUploadLoading(false);
            }
        };

        const fetchCantiereDocumentsForView = async () => {
            if (!viewDocCantiere) {
                setUploadMessage("Selezionare un cantiere per visualizzare i documenti.");
                return;
            }
            
            setUploadLoading(true);
            setUploadMessage("Caricamento documenti...");
            try {
                const q = query(
                    collection(db, "cantiereDocuments"),
                    where("cantiere", "==", viewDocCantiere)
                );
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCantiereDocuments(docs);
                setIsDocumentModalOpen(true);
                setUploadMessage("");
            } catch (error) {
                console.error("Errore nel recupero documenti:", error);
                setUploadMessage(`Errore nel recupero documenti: ${error.message}`);
            } finally {
                setUploadLoading(false);
            }
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-700 p-4 flex flex-col items-center">
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-8 mt-8 mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Maschera Gestore</h2>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
                        >
                            <PowerIcon className="h-5 w-5" /> Logout
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4">Benvenuto, <span className="font-semibold text-purple-700">{user.email}</span>!</p>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`${activeTab === 'overview' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition duration-200`}
                            >
                                <ChartBarIcon className="h-5 w-5 inline-block mr-2" /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('uploadDocuments')}
                                className={`${activeTab === 'uploadDocuments' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition duration-200`}
                            >
                                <CloudArrowUpIcon className="h-5 w-5 inline-block mr-2" /> Carica Documenti
                            </button>
                            <button
                                onClick={() => setActiveTab('viewDocuments')}
                                className={`${activeTab === 'viewDocuments' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition duration-200`}
                            >
                                <FolderOpenIcon className="h-5 w-5 inline-block mr-2" /> Visualizza Documenti
                            </button>
                            <button
                                onClick={() => setActiveTab('manageUsers')}
                                className={`${activeTab === 'manageUsers' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition duration-200`}
                            >
                                <UserIcon className="h-5 w-5 inline-block mr-2" /> Gestione Utenti
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'overview' && (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">Panoramica Cantieri</h3>
                            <p className="text-gray-600">Qui potrai vedere una panoramica di tutti i cantieri, i loro stati e le attività recenti.</p>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cantieriData.map((cantiere, index) => (
                                    <div key={index} className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                                        <p className="font-semibold text-blue-800">{cantiere.cantiere}</p>
                                        <p className="text-sm text-blue-700">Azienda: {cantiere.azienda}</p>
                                        <p className="text-sm text-blue-700">Utente: {cantiere.utente}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'uploadDocuments' && (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">Carica Documenti Cantiere</h3>
                            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6 items-end">
                                <div className="md:col-span-1 lg:col-span-1">
                                    <label htmlFor="uploadCompany" className="block text-gray-700 text-sm font-semibold mb-2">Azienda</label>
                                    <select
                                        id="uploadCompany"
                                        className="shadow border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={uploadCompany}
                                        onChange={(e) => { setUploadCompany(e.target.value); setUploadCantiere(''); setDocumentTitle(''); setDocumentFile(null); }}
                                    >
                                        <option value="">Seleziona Azienda</option>
                                        {allCompanies.map(company => (
                                            <option key={company} value={company}>{company}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-1 lg:col-span-1">
                                    <label htmlFor="uploadCantiere" className="block text-gray-700 text-sm font-semibold mb-2">Cantiere</label>
                                    <select
                                        id="uploadCantiere"
                                        className="shadow border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={uploadCantiere}
                                        onChange={(e) => { setUploadCantiere(e.target.value); setDocumentTitle(''); setDocumentFile(null); }}
                                        disabled={!uploadCompany}
                                    >
                                        <option value="">Seleziona Cantiere</option>
                                        {cantieriForSelectedCompany.map(cantiere => (
                                            <option key={cantiere} value={cantiere}>{cantiere}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label htmlFor="documentTitle" className="block text-gray-700 text-sm font-semibold mb-2">Titolo Documento</label>
                                    <input
                                        type="text"
                                        id="documentTitle"
                                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Es. Planimetria, Relazione Tecnica"
                                        value={documentTitle}
                                        onChange={(e) => setDocumentTitle(e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label htmlFor="documentFileInput" className="block text-gray-700 text-sm font-semibold mb-2">Seleziona File</label>
                                    <input
                                        type="file"
                                        id="documentFileInput"
                                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        onChange={handleDocumentFileChange}
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-4 flex justify-center">
                                    <button
                                        onClick={handleUploadDocument}
                                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={uploadLoading || !uploadCompany || !uploadCantiere || !documentTitle || !documentFile}
                                    >
                                        {uploadLoading ? (
                                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <CloudArrowUpIcon className="h-5 w-5" />
                                        )}
                                        Carica Documento
                                    </button>
                                </div>
                                <div className="md:col-span-2 lg:col-span-4 text-center">
                                    {uploadMessage && <p className="text-blue-600 text-sm mt-2">{uploadMessage}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'viewDocuments' && (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">Visualizza Documenti Cantiere</h3>
                            <div className="flex flex-col items-center w-full px-4">
                                <div className="w-full max-w-sm mb-4">
                                    <label htmlFor="viewDocCantiere" className="block text-gray-700 text-sm font-semibold mb-2 text-left">Seleziona Cantiere</label>
                                    <select
                                        id="viewDocCantiere"
                                        className="shadow border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={viewDocCantiere}
                                        onChange={(e) => { setViewDocCantiere(e.target.value); setUploadMessage(''); }}
                                    >
                                        <option value="">Seleziona Cantiere</option>
                                        {allCantieri.map(cantiere => (
                                            <option key={cantiere} value={cantiere}>{cantiere}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={fetchCantiereDocumentsForView}
                                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={!viewDocCantiere || uploadLoading}
                                >
                                    <FolderOpenIcon className="h-5 w-5" /> Visualizza Documenti
                                </button>
                                {uploadMessage && <p className="text-blue-600 text-sm mt-2 text-center">{uploadMessage}</p>}
                            </div>
                            <DocumentModal 
                                isOpen={isDocumentModalOpen} 
                                onClose={() => setIsDocumentModalOpen(false)} 
                                documents={cantiereDocuments}
                                cantiereName={viewDocCantiere}
                            />
                        </div>
                    )}

                    {activeTab === 'manageUsers' && (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">{editingUser ? 'Modifica Utente' : 'Crea Nuovo Utente'}</h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label htmlFor="newUserEmail" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="newUserEmail"
                                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="email@esempio.com"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        disabled={userManagementLoading || editingUser}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newUserNameCognome" className="block text-gray-700 text-sm font-semibold mb-2">Nome.Cognome</label>
                                    <input
                                        type="text"
                                        id="newUserNameCognome"
                                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="nome.cognome"
                                        value={newUserNameCognome}
                                        onChange={(e) => setNewUserNameCognome(e.target.value)}
                                        disabled={userManagementLoading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newUserPhone" className="block text-gray-700 text-sm font-semibold mb-2">Telefono (opzionale)</label>
                                    <input
                                        type="tel"
                                        id="newUserPhone"
                                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="+39 123 4567890"
                                        value={newUserPhone}
                                        onChange={(e) => setNewUserPhone(e.target.value)}
                                        disabled={userManagementLoading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newUserRole" className="block text-gray-700 text-sm font-semibold mb-2">Ruolo</label>
                                    <select
                                        id="newUserRole"
                                        className="shadow border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                        disabled={userManagementLoading}
                                    >
                                        {USER_ROLES.map(role => (
                                            <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label htmlFor="newUserPassword" className="block text-gray-700 text-sm font-semibold mb-2">Password Iniziale</label>
                                        <div className="relative">
                                            <input
                                                type={showNewUserPassword ? "text" : "password"}
                                                id="newUserPassword"
                                                className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                                placeholder="Min. 6 caratteri"
                                                value={newUserPassword}
                                                onChange={(e) => setNewUserPassword(e.target.value)}
                                                disabled={userManagementLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                            >
                                                {showNewUserPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {editingUser && (
                                    <div className="mt-4">
                                        <label htmlFor="changePassword" className="block text-gray-700 text-sm font-semibold mb-2">Nuova Password (lascia vuoto per non cambiare)</label>
                                        <div className="relative">
                                            <input
                                                type={showNewUserPassword ? "text" : "password"}
                                                id="changePassword"
                                                className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                                placeholder="Min. 6 caratteri"
                                                value={newUserPassword}
                                                onChange={(e) => setNewUserPassword(e.target.value)}
                                                disabled={userManagementLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                                            >
                                                {showNewUserPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleCreateOrUpdateUser}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={userManagementLoading}
                                >
                                    {userManagementLoading ? (
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    ) : (
                                        editingUser ? <PencilSquareIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />
                                    )}
                                    {editingUser ? 'Aggiorna Utente' : 'Crea Utente'}
                                </button>
                                {editingUser && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={userManagementLoading}
                                    >
                                        <XMarkIcon className="h-5 w-5" /> Annulla
                                    </button>
                                )}
                            </div>
                            {userManagementMessage && <p className="text-blue-600 text-sm mt-4 text-center">{userManagementMessage}</p>}

                            <h3 className="text-2xl font-bold text-gray-700 mb-4 mt-8">Elenco Utenti</h3>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={handleExportUsersToExcel}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition duration-200 flex items-center gap-2 disabled:opacity-50"
                                    disabled={userManagementLoading || users.length === 0}
                                >
                                    <ArrowDownOnSquareIcon className="h-5 w-5" /> Esporta Excel
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-xl shadow-md">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                            <th className="py-3 px-6 text-left">Email</th>
                                            <th className="py-3 px-6 text-left">Nome.Cognome</th>
                                            <th className="py-3 px-6 text-left">Ruolo</th>
                                            <th className="py-3 px-6 text-center">Stato</th>
                                            <th className="py-3 px-6 text-center">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                        {users.length === 0 && !userManagementLoading ? (
                                            <tr>
                                                <td colSpan="5" className="py-3 px-6 text-center">Nessun utente trovato.</td>
                                            </tr>
                                        ) : (
                                            users.map(user => (
                                                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                                    <td className="py-3 px-6 text-left whitespace-nowrap">{user.email}</td>
                                                    <td className="py-3 px-6 text-left">{user.nameCognome || 'N/A'}</td>
                                                    <td className="py-3 px-6 text-left">{user.role || 'N/A'}</td>
                                                    <td className="py-3 px-6 text-center">
                                                        <span className={`relative inline-block px-3 py-1 font-semibold text-xs rounded-full ${user.disabled ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'}`}>
                                                            {user.disabled ? 'Disabilitato' : 'Attivo'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="flex item-center justify-center">
                                                            <button 
                                                                onClick={() => handleEditClick(user)}
                                                                className="w-8 h-8 mr-2 transform hover:text-purple-500 hover:scale-110"
                                                                title="Modifica Utente"
                                                            >
                                                                <PencilSquareIcon className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDisableEnableUser(user)}
                                                                className={`w-8 h-8 transform hover:scale-110 ${user.disabled ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
                                                                title={user.disabled ? 'Abilita Utente' : 'Disabilita Utente'}
                                                            >
                                                                {user.disabled ? <ArrowPathIcon className="w-5 w-5" /> : <TrashIcon className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };


    // Funzione per recuperare i dati dei cantieri dal backend Flask
    const fetchCantieriData = async () => {
        setLoadingCantieri(true);
        console.log('DEBUG APP (fetchCantieriData): Inizio recupero dati cantieri...');
        let rawResponseText = '';
        try {
            const urlToFetch = `${BACKEND_URL}/api/cantieri`;
            console.log('DEBUG APP (fetchCantieriData): Tentativo di recuperare i cantieri da:', urlToFetch);
            const response = await fetch(urlToFetch);

            rawResponseText = await response.text();

            if (!response.ok) {
                console.error(`DEBUG APP (fetchCantieriData): Errore HTTP! Status: ${response.status}, Testo risposta (non JSON):`, rawResponseText);
                setAppMessage(`Errore caricamento cantieri: ${response.status}. Risposta dal server: ${rawResponseText.substring(0, 200)}...`);
                throw new Error(`HTTP error! status: ${response.status}, response: ${rawResponseText}`);
            }
            
            let data;
            try {
                data = JSON.parse(rawResponseText);
                console.log('DEBUG APP (fetchCantieriData): Dati cantieri caricati dal backend:', data);
                setCantieriData(data);
                setLoadingCantieri(false);
                setAppMessage('');
            } catch (jsonError) {
                console.error(`DEBUG APP (fetchCantieriData): Errore di parsing JSON! Risposta ricevuta (non JSON):`, rawResponseText);
                setAppMessage(`Errore caricamento cantieri: Formato dati non valido. Risposta: ${rawResponseText.substring(0, 200)}...`);
                throw new Error(`JSON parsing error: ${jsonError.message}, Raw response: ${rawResponseText}`);
            }

        } catch (error) {
            console.error('DEBUG APP (fetchCantieriData): Errore generale durante il recupero dei cantieri:', error);
            const displayMessage = rawResponseText ? `Risposta: ${rawResponseText.substring(0, 200)}...` : 'Nessuna risposta dal server o errore di rete.';
            setAppMessage(`Errore caricamento cantieri: ${error.message}. ${displayMessage}`);
            setLoadingCantieri(false);
        }
    };


    // Effetto per l'autenticazione Firebase
    useEffect(() => {
        console.log('DEBUG APP (onAuthStateChanged useEffect): Inizializzazione listener onAuthStateChanged.');
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('DEBUG APP (onAuthStateChanged callback): Callback attivata. User object:', user);
            setCurrentUser(user);
            if (user) {
                console.log('DEBUG APP (onAuthStateChanged callback): Utente autenticato rilevato:', user.email);
                console.log('DEBUG APP (onAuthStateChanged callback): User UID da auth:', user.uid);
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    console.log('DEBUG APP (onAuthStateChanged callback): Tentativo di recuperare documento utente da Firestore per UID:', user.uid);
                    const docSnap = await getDoc(userDocRef, { source: 'server' }); 
                    
                    let role = 'preposto';

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        role = userData.role || 'preposto';
                        console.log('DEBUG APP (onAuthStateChanged callback): Ruolo recuperato da Firestore:', role, 'per UID:', user.uid);
                    } else {
                        console.warn('DEBUG APP (onAuthStateChanged callback): Documento utente NON trovato in Firestore per UID:', user.uid);
                        console.warn('DEBUG APP (onAuthStateChanged callback): Tentativo di creare documento utente in Firestore con ruolo predefinito "preposto" e UID:', user.uid);
                        try {
                            await setDoc(userDocRef, {
                                email: user.email,
                                role: 'preposto',
                                registrationDate: new Date().toISOString(),
                            });
                            console.log('DEBUG APP (onAuthStateChanged callback): Documento utente creato con successo in Firestore.');
                        } catch (createDocError) {
                            console.error('DEBUG APP (onAuthStateChanged callback): ERRORE nella creazione del documento utente in Firestore:', createDocError);
                            console.error('DEBUG APP (onAuthStateChanged callback): Messaggio di errore creazione documento:', createDocError.message);
                            setAppMessage(`Errore critico: Impossibile creare il documento utente in Firestore. Contatta l'amministratore. Errore: ${createDocError.message}`);
                            role = 'preposto';
                        }
                    }
                    setUserRole(role);
                    
                } catch (error) {
                    console.error('DEBUG APP (onAuthStateChanged callback): Errore generale nel recupero/creazione del ruolo da Firestore:', error);
                    console.error('DEBUG APP (onAuthStateChanged callback): Messaggio di errore generale:', error.message);
                    setUserRole('preposto');
                    setAppMessage(`Errore nel recupero del ruolo utente: ${error.message}. Potrebbe non avere i permessi corretti.`);
                }
                
                fetchCantieriData(); 

            } else {
                console.log('DEBUG APP (onAuthStateChanged callback): Nessun utente autenticato rilevato. Impostazione stato a disconnesso.');
                setCurrentUser(null);
                setUserRole(null);
                setSelectedCompany('');
                setSelectedUserNameForCompany('');
                setIsInitialLoad(true);
                console.log('DEBUG APP (onAuthStateChanged callback): Utente disconnesso.');
                setLoadingCantieri(false); 
            }
            setLoadingAuth(false);
            console.log('DEBUG APP (onAuthStateChanged callback): loadingAuth impostato a false.');
        });

        console.log('DEBUG APP (onAuthStateChanged useEffect): auth.currentUser al momento della configurazione listener:', auth.currentUser);

        return () => {
            console.log('DEBUG APP (onAuthStateChanged useEffect): Pulizia listener onAuthStateChanged.');
            unsubscribe();
        };
    }, []);

    // Effetto per l'auto-selezione di azienda/utente basata sui dati dei cantieri e sul ruolo
    useEffect(() => {
        console.log('DEBUG APP (useEffect auto-selezione): Stato attuale - currentUser:', currentUser?.email, 'userRole:', userRole, 'cantieriData.length:', cantieriData.length, 'isInitialLoad:', isInitialLoad);
        if (currentUser && userRole && cantieriData.length > 0 && isInitialLoad) {
            console.log('DEBUG APP (useEffect auto-selezione): Tentativo di auto-selezione avviato...');
            const userEmail = currentUser.email;
            console.log('DEBUG APP (useEffect auto-selezione): Email utente loggato:', userEmail);

            if (userRole === 'proprietario' || userRole === 'amministratore' || userRole === 'magazziniere' || userRole === 'it') {
                setSelectedCompany('Tutte le Aziende');
                setSelectedUserNameForCompany(userEmail);
                console.log(`DEBUG APP (useEffect auto-selezione): Ruolo ${userRole}: impostato accesso a tutte le aziende.`);
            } else {
                console.log('DEBUG APP (useEffect auto-selezione): Ricerca assegnazione per ruolo Preposto/Tecnico/Operaio...');
                const userAssignment = cantieriData.find(item => {
                    const match = item['ID Utente'] === userEmail;
                    return match;
                });

                if (userAssignment) {
                    setSelectedCompany(userAssignment.azienda);
                    setSelectedUserNameForCompany(userAssignment.utente);
                    console.log(`DEBUG APP (useEffect auto-selezione): Ruolo ${userRole}: auto-selezionato azienda ${userAssignment.azienda} per utente ${userAssignment.utente}.`);
                } else {
                    console.log(`DEBUG APP (useEffect auto-selezione): Ruolo ${userRole}: Nessuna assegnazione trovata per l'utente ${userEmail} in cantieriData. Impostazione a vuoto.`);
                    setSelectedCompany('');
                    setSelectedUserNameForCompany('');
                    setAppMessage(`Attenzione: Nessuna assegnazione cantiere trovata per l'utente ${userEmail}. Contatta il gestore.`);
                }
            }
            setIsInitialLoad(false); 
            console.log('DEBUG APP (useEffect auto-selezione): Auto-selezione completata. selectedCompany:', selectedCompany, 'selectedUserNameForCompany:', selectedUserNameForCompany);
        } else if (currentUser && userRole && !isInitialLoad && cantieriData.length === 0) {
            console.log('DEBUG APP (useEffect auto-selezione): Dati cantieri non disponibili o già caricati, ma non trovati per utente.');
        } else {
            console.log('DEBUG APP (useEffect auto-selezione): Condizioni per auto-selezione non soddisfatte.');
        }
    }, [currentUser, userRole, cantieriData, isInitialLoad]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('Logout effettuato con successo.');
        } catch (error) {
            console.error("Errore durante il logout:", error);
        }
    };

    // LOGICA DI RENDERING
    if (loadingAuth) { 
        console.log('DEBUG APP (Render): Mostro schermata di caricamento autenticazione.');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
                    <p className="mt-4 text-lg text-gray-700">Caricamento autenticazione...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        console.log('DEBUG APP (Render): Nessun utente autenticato. Mostro schermata di login o registrazione.');
        return showRegisterScreen ? (
            <RegistrationScreen 
                onRegistrationSuccess={() => setShowRegisterScreen(false)} 
                onGoToLogin={() => setShowRegisterScreen(false)} 
            />
        ) : (
            <LoginScreen 
                onLoginSuccess={() => {
                    setLoadingAuth(true);
                    setIsInitialLoad(true);
                }} 
                onGoToRegister={() => setShowRegisterScreen(true)} 
                deferredInstallPrompt={deferredInstallPrompt}
                onInstallPromptClick={handleInstallPromptClick}
            />
        );
    }

    if (loadingCantieri) {
        console.log('DEBUG APP (Render): Mostro schermata di caricamento dati cantieri.');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
                    <p className="mt-4 text-lg text-gray-700">Caricamento dati cantieri...</p>
                </div>
            </div>
        );
    }

    console.log('DEBUG APP (Render): Utente autenticato e dati caricati. Rendering maschera per ruolo:', userRole);
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            {appMessage && (
                <div className="w-full max-w-4xl bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
                    <strong className="font-bold">Attenzione!</strong>
                    <span className="block sm:inline"> {appMessage}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <XMarkIcon className="fill-current h-6 w-6 text-yellow-500 cursor-pointer" onClick={() => setAppMessage('')} />
                    </span>
                </div>
            )}

            {userRole === 'operaio' && (
                <PrepostoMask 
                    user={currentUser} 
                    company={selectedCompany} 
                    cantieriData={cantieriData} 
                    onLogout={handleLogout} 
                    selectedUserNameForCompany={selectedUserNameForCompany} 
                />
            )}
            {userRole === 'preposto' && (
                <PrepostoMask 
                    user={currentUser} 
                    company={selectedCompany} 
                    cantieriData={cantieriData} 
                    onLogout={handleLogout} 
                    selectedUserNameForCompany={selectedUserNameForCompany} 
                />
            )}
            {userRole === 'magazziniere' && (
                <MagazzinoMask 
                    user={currentUser} 
                    company={selectedCompany} 
                    onLogout={handleLogout} 
                    selectedUserNameForCompany={selectedUserNameForCompany} 
                />
            )}
            {userRole === 'tecnico' && (
                <TecnicoMask 
                    user={currentUser} 
                    company={selectedCompany} 
                    onLogout={handleLogout} 
                    selectedUserNameForCompany={selectedUserNameForCompany} 
                />
            )}
            {userRole === 'amministrazione' && (
                <AmministratoreMask 
                    user={currentUser} 
                    company={selectedCompany} 
                    onLogout={handleLogout} 
                    selectedUserNameForCompany={selectedUserNameForCompany} 
                />
            )}
            {userRole === 'titolare azienda' && (
                <AmministratoreMask 
                    user={currentUser} 
                    company={selectedCompany} 
                    onLogout={handleLogout} 
                    selectedUserNameForCompany={selectedUserNameForCompany} 
                />
            )}
            {userRole === 'proprietario' && (
                <GestoreMask 
                    user={currentUser} 
                    cantieriData={cantieriData} 
                    onLogout={handleLogout} 
                />
            )}
            {userRole === 'it' && (
                <GestoreMask 
                    user={currentUser} 
                    cantieriData={cantieriData} 
                    onLogout={handleLogout} 
                />
            )}
            {!userRole && !loadingAuth && (
                <div className="mt-8 p-6 bg-red-100 rounded-xl shadow-md text-red-800 text-center">
                    <p>Impossibile determinare il tuo ruolo. Contatta l'amministratore.</p>
                    <button
                        onClick={handleLogout}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 mx-auto"
                    >
                        <PowerIcon className="h-5 w-5" /> Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
