import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
const app = (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
);

// Con HTML pregenerado (producción) se hidrata; en desarrollo el root llega vacío.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
