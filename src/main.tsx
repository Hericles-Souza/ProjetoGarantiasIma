/* eslint-disable @typescript-eslint/no-explicit-any */
import { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import './App.css';
// import TechnicalAndSupervisorDetailsItens from "@app/views/private/technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens";

import App from './App.tsx';

import { Buffer } from "buffer";

// polyfill global para Buffer no browser
if (typeof (window as any).Buffer === "undefined") {
  (window as any).Buffer = Buffer;
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
