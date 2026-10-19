import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export { heads } from "./lib/seo";

/** Usado por scripts/prerender.mjs para generar el HTML de cada URL en la compilación. */
export function render(url: string) {
  return renderToString(
    <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </StaticRouter>,
  );
}
