import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { PowerIcon, UserIcon, EyeIcon, EyeSlashIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const LoginScreen = ({ onLoginSuccess, onLogout }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoginDisabled, setIsLoginDisabled] = useState(true);

    const validateForm = (email, password) => {
        return email.length > 0 && password.length > 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Correggi il nome della collezione da 'utenti' a 'users'
            const userDocRef = doc(db, 'users', user.uid); 
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                onLoginSuccess(userData.ruolo, userData.azienda);
            } else {
                console.error("Utente autenticato ma non trovato nel database.");
                onLogout();
            }
        } catch (error) {
            console.error("Errore di login:", error);
            // Non usare alert(), crea un div per gli errori
            alert("Errore di login. Verifica email e password."); 
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (setter, value) => {
        setter(value);
        setIsLoginDisabled(!validateForm(email, password));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-500 hover:scale-105">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Accedi al tuo account</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                placeholder="La tua email"
                            />
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                placeholder="La tua password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                            <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoginDisabled || loading}
                        className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 ${isLoginDisabled || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {loading ? 'Accesso in corso...' : 'Accedi'}
                    </button>
                </form>
            </div>
            <div className="mt-8">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-white text-opacity-80 hover:text-opacity-100 transition-all duration-200"
                >
                    <PowerIcon className="h-5 w-5" /> Logout
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
