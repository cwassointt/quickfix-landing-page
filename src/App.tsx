import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Tipografía global: DM Sans para texto, Space Grotesk para títulos (ambas cargadas en index.html). */}
    <style>{`
      :root {
        --font-visual-sans: 'DM Sans', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --font-display: 'Space Grotesk', 'DM Sans', system-ui, sans-serif;
      }
      body, button, input, textarea, div, span, p, a, li {
        font-family: var(--font-visual-sans) !important;
      }
      h1, h2, h3, h4, h5, h6, .font-display {
        font-family: var(--font-display) !important;
      }
      /* La barra del cotizador ya tiene su botón de WhatsApp; no apilar dos en móvil. */
      @media (max-width: 1023px) {
        body:has(.qf-bar) .wa-float { opacity: 0; pointer-events: none; }
      }
      .font-mono, .font-mono * {
        font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace !important;
      }
    `}</style>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
