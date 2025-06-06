// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORTE

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <--- ENVOLVA O APP */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);