import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServicePage from "./pages/ServicePage";
import { servicePages } from "./data/pages";
import { heads } from "./lib/seo";

/** Rutas de la web. El router lo pone main.tsx (navegador) o entry-server.tsx (HTML pregenerado). */
const App = () => {
  const { pathname } = useLocation();

  // Al navegar dentro de la app, el título sigue a la página (el HTML pregenerado ya lo trae).
  useEffect(() => {
    const head = heads.find((h) => h.path === pathname || h.path === `${pathname}/`);
    if (head) document.title = head.title;
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {servicePages.map((p) => (
        <Route key={p.slug} path={`/${p.slug}`} element={<ServicePage page={p} />} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
