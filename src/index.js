import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Non importiamo più serviceWorkerRegistration.js qui, perché useremo una registrazione manuale

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrazione manuale del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrato con successo:', registration.scope);
      })
      .catch(error => {
        console.error('Registrazione Service Worker fallita:', error);
      });
  });
}

// Se vuoi misurare le performance nella tua app, passa una funzione
// per registrare i risultati (es. reportWebVitals(console.log))
// o inviare a un endpoint di analisi. Scopri di più: https://bit.ly/CRA-vitals
// import reportWebVitals from './reportWebVitals'; // Se hai reportWebVitals, lascialo così
// reportWebVitals(); // Se hai reportWebVitals, lascialo così com'è o rimuovilo se non lo usi.
