import {StrictMode} from "react";
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import './App.css';
import Dashboard from "@app/views/private/dashboard/dashboard";

// import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Dashboard/>
    </Router>
  </StrictMode>
);
 