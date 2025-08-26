import React from 'react';
// Importa le icone necessarie da Heroicons, una libreria di icone molto usata.
// Le icone sono componenti React e puoi cambiare il loro colore e la dimensione.
import { CameraIcon, VideoCameraIcon, FolderIcon } from '@heroicons/react/24/solid';

// Questo componente funzionale si occupa di renderizzare tutti i pulsanti di azione.
// Accetta le seguenti props dal componente padre per gestire la logica:
// - isSaving: booleano per disabilitare i pulsanti durante un'operazione di salvataggio.
// - selectedCantiere: l'ID del cantiere selezionato; i pulsanti sono disabilitati se non è selezionato.
// - onPhoto: funzione chiamata per scattare una foto, con un'etichetta come argomento.
// - onVideo: funzione chiamata per registrare un video.
// - onOpenDocumentsModal: funzione per aprire la finestra modale dei documenti.
const ActionButtons = ({ isSaving, selectedCantiere, onPhoto, onVideo, onOpenDocumentsModal }) => {
    
    // Definisce una stringa di classi di stile di Tailwind CSS che sarà riutilizzata per tutti i pulsanti.
    // Questo rende il codice più pulito e facile da modificare.
    const buttonClasses = `
        // Stile base del contenitore del pulsante.
        flex flex-col items-center justify-center p-6
        // Bordo arrotondato e ombra leggera. Ho aggiunto border-2 e border-gray-800.
        rounded-2xl shadow-sm border-2 border-gray-800
        // Testo del pulsante.
        text-gray-700 font-semibold text-center
        // Transizioni fluide al passaggio del mouse.
        transition-all duration-300
        // Stato hover: cambia lo sfondo e l'ombra quando il mouse passa sopra il pulsante.
        hover:bg-gray-100 hover:shadow-md
        // Stato active: riduce leggermente il pulsante quando viene cliccato per dare un feedback visivo.
        active:scale-[0.98]
        // Stato disabled: riduce l'opacità e cambia il cursore quando il pulsante è disabilitato.
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        // Contenitore che usa un layout a griglia (grid) per disporre i pulsanti.
        // `grid-cols-2 lg:grid-cols-4`: crea 2 colonne su schermi piccoli e 4 colonne su schermi più grandi.
        // `gap-4`: aggiunge spazio tra gli elementi della griglia.
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Pulsante "Inizio Lavoro" */}
            <button
                // Chiama la funzione onPhoto passando "inizio lavoro" come argomento.
                onClick={() => onPhoto("inizio lavoro")}
                // Disabilita il pulsante se isSaving è true o se nessun cantiere è selezionato.
                disabled={isSaving || !selectedCantiere}
                // Applica le classi di stile definite sopra.
                className={buttonClasses}
            >
                {/* Icona della fotocamera. Puoi cambiare il colore (`text-blue-500`) qui. */}
                <CameraIcon className="h-12 w-12 text-blue-500 mb-2" />
                {/* Testo del pulsante. */}
                <span className="text-sm font-semibold">Inizio Lavoro</span>
            </button>

            {/* Pulsante "Lavoro" */}
            <button
                // Chiama la funzione onPhoto passando "lavoro" come argomento.
                onClick={() => onPhoto("lavoro")}
                disabled={isSaving || !selectedCantiere}
                className={buttonClasses}
            >
                {/* Icona della fotocamera. Il colore è verde. */}
                <CameraIcon className="h-12 w-12 text-green-500 mb-2" />
                <span className="text-sm font-semibold">Lavoro</span>
            </button>

            {/* Pulsante "Fine Lavoro" */}
            <button
                // Chiama la funzione onPhoto passando "fine lavoro" come argomento.
                onClick={() => onPhoto("fine lavoro")}
                disabled={isSaving || !selectedCantiere}
                className={buttonClasses}
            >
                {/* Icona della fotocamera. Il colore è rosso. */}
                <CameraIcon className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-sm font-semibold">Fine Lavoro</span>
            </button>

            {/* Pulsante "Registra Video" */}
            <button
                // Chiama la funzione onVideo.
                onClick={onVideo}
                disabled={isSaving || !selectedCantiere}
                className={buttonClasses}
            >
                {/* Icona della videocamera. Il colore è indaco. */}
                <VideoCameraIcon className="h-12 w-12 text-indigo-500 mb-2" />
                <span className="text-sm font-semibold">Registra Video</span>
            </button>

            {/* Pulsante "Documenti" */}
            <button
                // Chiama la funzione onOpenDocumentsModal.
                onClick={onOpenDocumentsModal}
                disabled={isSaving || !selectedCantiere}
                className={buttonClasses}
            >
                {/* Icona della cartella. Il colore è grigio. */}
                <FolderIcon className="h-12 w-12 text-gray-500 mb-2" />
                <span className="text-sm font-semibold">Documenti</span>
            </button>
        </div>
    );
};

// Esporta il componente per renderlo disponibile per l'uso in altre parti dell'applicazione.
export default ActionButtons;
