import React, { useState, useEffect } from 'react';
import { PowerIcon, BuildingOfficeIcon, UserIcon, PlusIcon, CloudArrowUpIcon, PencilSquareIcon, TrashIcon, ArrowDownOnSquareIcon, XMarkIcon, BriefcaseIcon, CubeTransparentIcon } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx';
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Importa le istanze
import { signOut } from 'firebase/auth';

const AmministratoreMask = ({ user, company, onLogout, selectedUserNameForCompany }) => {
    // ... tutto il codice dell'AmministratoreMask dal tuo file App.js
    const [companyCantieri, setCompanyCantieri] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedCompanyUsers, setSelectedCompanyUsers] = useState([]);
    const [showUsers, setShowUsers] = useState(false);
    const [showCantieri, setShowCantieri] = useState(false);

    useEffect(() => {
        if (selectedUserNameForCompany) {
            fetchCantieri();
            fetchAllUsers();
        }
    }, [selectedUserNameForCompany]);

    const fetchCantieri = () => {
        const q = collection(db, 'cantieri');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cantieriList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCompanyCantieri(cantieriList);
        });
        return unsubscribe;
    };

    // CORREZIONE QUI: Modifica 'utenti' in 'users'
    const fetchAllUsers = () => {
        const usersRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(usersList);
        });
        return unsubscribe;
    };

    const exportToExcel = () => {
        // ... (resto della logica per l'esportazione)
    };

    const handleDeleteUser = async (userId) => {
        // ... (resto della logica per eliminare l'utente)
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8 text-gray-800">
            {/* ... tutto il codice JSX dell'AmministratoreMask */}
        </div>
    );
};

export default AmministratoreMask;