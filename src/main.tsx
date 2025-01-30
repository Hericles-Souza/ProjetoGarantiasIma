import {StrictMode} from "react";
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import './App.css';
import ScreenAcordoComercial from "@app/views/private/acordo-comercial/ScreenInitialTradeAgreement/ScreenInitialTradeAgreement";
// import InvoicePage from "@shared/ViewPreInvoice/ViewPreInvoice";

// import App from './App.tsx';
// import TechnicalAndSupervisorInitialRGI from "@app/views/private/technicalAndSupervisorRGI/technicalAndSupervisorInitialRGI/technicalAndSupervisorInitialRGI.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ScreenAcordoComercial/>
    </Router>
  </StrictMode>
);
 