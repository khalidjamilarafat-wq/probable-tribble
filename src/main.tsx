import React from 'react';
import ReactDOM from 'react-dom/client';
import DentalLabApp from './LabApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DentalLabApp />
  </React.StrictMode>
);

// PWA: register the service worker in production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
