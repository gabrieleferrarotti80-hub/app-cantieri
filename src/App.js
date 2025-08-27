/* eslint-disable no-undef */

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { PowerIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { useAuthentication } from './useAuthentication';
import PrepostoMask from './components/PrepostoMask';
import GestoreMask from './components/GestoreMask';
import TecnicoMask from './components/TecnicoMask';
import AmministratoreMask from './components/AmministratoreMask';
import { auth } from './firebaseConfig';

function App() {
    console.log("APP: Componente App renderizzato.");

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Utilizza il custom hook per l'autenticazione.
    const {
        currentUser,
        userRole,
        loadingAuth,
        handleLogout,
        userAziendaId
    } = useAuthentication();

    useEffect(() => {
        console.log("APP: useEffect attivato. Stato corrente: loadingAuth:", loadingAuth, "currentUser:", !!currentUser, "userRole:", userRole);
        // Logga i dati dell'utente quando l'autenticazione è completa e l'utente è loggato
        if (!loadingAuth && currentUser) {
            console.log("------------------------------------------");
            console.log("Dati utente ricevuti dall'hook useAuthentication:");
            console.log("Nome:", currentUser.nome);
            console.log("Cognome:", currentUser.cognome);
            console.log("Ruolo:", userRole);
            console.log("ID Azienda:", userAziendaId);
            console.log("Oggetto currentUser completo:", currentUser);
            console.log("------------------------------------------");
        }
    }, [loadingAuth, currentUser, userRole, userAziendaId]);

    const handleLogin = async (e) => {
        console.log("LOGIN: Funzione handleLogin avviata.");
        e.preventDefault();
        setLoading(true);
        setLoginError('');
        console.log("LOGIN: Tentativo di accesso con email:", email);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("LOGIN: signInWithEmailAndPassword completato con successo.");
        } catch (error) {
            console.error("ERRORE LOGIN: Errore durante l'accesso:", error.code, error.message);
            if (error.code === 'auth/network-request-failed') {
                setLoginError("Errore di rete. Controlla la tua connessione.");
                console.log("LOGIN: Errore di rete impostato.");
            } else {
                setLoginError("Credenziali non valide o errore sconosciuto. Riprova.");
                console.log("LOGIN: Errore credenziali o sconosciuto impostato.");
            }
        } finally {
            console.log("LOGIN: Blocco 'finally' di handleLogin. Imposto loading a false.");
            setLoading(false);
        }
    };

    if (loadingAuth) {
        console.log("RENDER: Mostro la schermata di caricamento.");
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    console.log("RENDER: loadingAuth è false. Controllo se l'utente è loggato.");

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            {!currentUser ? (
                <div className="login-container p-8 bg-white rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="password"
                                type="password"
                                placeholder="******************"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {loginError && <p className="text-red-500 text-xs italic mb-4">{loginError}</p>}
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Accesso in corso...' : 'Accedi'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="main-content w-full h-full">
                    {userRole === 'titolare azienda' && (
                        <AmministratoreMask
                            user={currentUser}
                            onLogout={handleLogout}
                            userAziendaId={userAziendaId}
                        />
                    )}
                    {userRole === 'preposto' && (
                        <PrepostoMask
                            user={currentUser}
                            onLogout={handleLogout}
                            userAziendaId={userAziendaId}
                        />
                    )}
                    {(userRole === 'proprietario' || userRole === 'it' || userRole === 'admin') && (
                        <GestoreMask
                            user={currentUser}
                            onLogout={handleLogout}
                            userAziendaId={userAziendaId}
                        />
                    )}
                    {userRole === 'tecnico' && (
                        <TecnicoMask
                            user={currentUser}
                            onLogout={handleLogout}
                            userAziendaId={userAziendaId}
                        />
                    )}
                    {!userRole && (
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
            )}
        </div>
    );
}

export default App;
