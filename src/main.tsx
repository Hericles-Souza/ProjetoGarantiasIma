import {StrictMode} from "react";
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import './App.css';
// import App from './App.tsx';
import DetailsItensNF from "@app/views/private/rgi/processRGI/DetailsItensNF";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      {/* <App/> */}
      <DetailsItensNF/>
    </Router>
  </StrictMode>
);
