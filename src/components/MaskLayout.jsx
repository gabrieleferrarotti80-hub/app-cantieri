import React from 'react';

// Questo è un componente React funzionale chiamato MaskLayout.
// Accetta diverse props (proprietà) che gli vengono passate dal componente genitore,
// come i dati dell'utente, le funzioni di logout e gli elenchi dei cantieri.
const MaskLayout = ({
    children, // Questa prop speciale renderizza il contenuto all'interno del nostro componente. È il "buco" dove andrà il resto dell'interfaccia.
    user, // Oggetto che contiene i dati dell'utente (ad esempio, user.displayName o user.email).
    onLogout, // Funzione da chiamare quando l'utente clicca sul pulsante di logout.
    selectedCantiere, // ID del cantiere attualmente selezionato.
    onCantiereChange, // Funzione da chiamare quando l'utente cambia cantiere dal menu a tendina.
    cantieri, // Array di oggetti che rappresentano i cantieri disponibili.
    cantieriLoading, // Booleano che indica se l'elenco dei cantieri è ancora in fase di caricamento.
    isSaving, // Booleano che indica se un'operazione di salvataggio è in corso (per disabilitare i controlli).
    title, // Titolo principale della pagina, mostrato nell'intestazione.
    subtitle // Sottotitolo della pagina, opzionale.
}) => {
    return (
        // Contenitore principale che avvolge l'intera interfaccia.
        // `min-h-screen`: garantisce che occupi almeno l'intera altezza dello schermo.
        // `w-full`: occupa l'intera larghezza.
        // `flex flex-col items-center justify-center`: usa Flexbox per centrare il contenuto sia orizzontalmente che verticalmente.
        // `p-4 sm:p-6 lg:p-8`: aggiunge un padding responsivo per adattarsi a diversi schermi.
        // `bg-gray-100`: classe di sfondo. Puoi cambiarla per modificare il colore di sfondo dell'intera pagina.
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-100">
            {/* Contenitore interno che rappresenta la "maschera" o la card principale dell'interfaccia. */}
            {/* `w-full h-full`: occupa l'intera larghezza e altezza del contenitore genitore. */}
            {/* `bg-white`: imposta lo sfondo bianco per la maschera. Puoi cambiare questo colore. */}
            {/* `rounded-3xl`: applica angoli molto arrotondati. */}
            {/* `shadow-2xl`: crea un'ombra pronunciata per dare profondità. */}
            {/* `p-6 sm:p-8 lg:p-10`: aggiunge un padding responsivo all'interno della maschera. */}
            <div className="w-full h-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">

                {/* Sezione dell'intestazione (header) */}
                {/* `flex justify-between items-center`: allinea gli elementi (titolo e pulsante) a sinistra e a destra. */}
                {/* `mb-6 border-b-2 border-gray-200 pb-4`: aggiunge un margine inferiore e un bordo per separare l'header dal contenuto. */}
                <header className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
                    {/* Contenitore per il titolo e il sottotitolo. */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    
                    {/* Se l'utente è loggato, mostra il suo nome e il pulsante di logout. */}
                    {user && (
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block mr-2">
                                {user.displayName || user.email}
                            </span>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </header>

                {/* Sezione del contenuto principale. */}
                <main>
                    {/* Blocco per il menu a tendina del cantiere. */}
                    <div className="mb-6">
                        {cantieriLoading ? (
                            // Se i cantieri stanno caricando, mostra un messaggio.
                            <p className="text-gray-500 text-center">Caricamento cantieri...</p>
                        ) : (
                            // Altrimenti, mostra l'etichetta e il menu a tendina.
                            <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                                <label htmlFor="cantiere-select" className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                                    Seleziona Cantiere:
                                </label>
                                <select
                                    id="cantiere-select"
                                    value={selectedCantiere || ''}
                                    onChange={onCantiereChange}
                                    className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSaving}
                                >
                                    {/* Opzione disabilitata per l'utente, serve da placeholder se nessun cantiere è selezionato. */}
                                    {!selectedCantiere && <option value="" disabled>Seleziona un cantiere</option>}
                                    {/* Mappa l'array dei cantieri per creare un'opzione per ogni cantiere. */}
                                    {cantieri.map((cantiere) => (
                                        <option key={cantiere.id} value={cantiere.id}>
                                            {cantiere.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    {/* Renderizza il contenuto passato come prop "children". */}
                    {children}
                </main>
            </div>
        </div>
    );
};

// Esporta il componente per renderlo utilizzabile in altre parti dell'applicazione.
export default MaskLayout;
