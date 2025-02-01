import {StrictMode} from "react";
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import './App.css';
// import TechnicalAndSupervisorDetailsItens from "@app/views/private/technicalAndSupervisorRGI/technicalAndSupervisorDetailsItens/technicalAndSupervisorDetailsItens";

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App/>
    </Router>
  </StrictMode>
);
 