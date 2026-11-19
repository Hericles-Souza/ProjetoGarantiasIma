/* eslint-disable @typescript-eslint/no-explicit-any */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import "./App.css";
// O reset do antd era importado dentro das telas de relatório; com as telas carregadas
// sob demanda ele precisa ficar aqui, depois dos estilos globais, como era no bundle único.
import "antd/dist/reset.css";

import App from "./App.tsx";

import { Buffer } from "buffer";

// polyfill global para Buffer no browser
if (typeof (window as any).Buffer === "undefined") {
  (window as any).Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
