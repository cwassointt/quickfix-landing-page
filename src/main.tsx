import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

const root = document.getElementById("root")!;
const app = (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
);

// Con HTML pregenerado (producción) se hidrata; en desarrollo el root llega vacío.
// Recepción y Taller se pregeneran sin contenido (se cargan aparte) y React avisa que las dibuja en el navegador (#419): es lo esperado.
if (root.firstElementChild) hydrateRoot(root, app, {
  onRecoverableError: (e) => { if (!/#419|Suspense boundary/.test(String((e as Error)?.message ?? e))) console.error(e); },
});
else createRoot(root).render(app);

// Analytics cuando la página ya cargó, para no competir con el contenido.
if (document.readyState === "complete") initAnalytics();
else window.addEventListener("load", initAnalytics, { once: true });
