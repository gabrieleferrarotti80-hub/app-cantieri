import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { PowerIcon, BriefcaseIcon, CubeTransparentIcon, UserIcon } from '@heroicons/react/24/solid';
import { auth, db } from '../firebaseConfig'; // Importa le istanze
import { signOut } from 'firebase/auth';

const TecnicoMask = ({ user, company, onLogout }) => {
    // ... tutto il codice del TecnicoMask dal tuo file App.js
    const [cantieri, setCantieri] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'cantieri'), where('azienda', '==', company));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cantieriList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCantieri(cantieriList);
        });
        return () => unsubscribe();
    }, [company]);

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8 text-gray-800">
            {/* ... tutto il codice JSX del TecnicoMask */}
        </div>
    );
};

export default TecnicoMask;