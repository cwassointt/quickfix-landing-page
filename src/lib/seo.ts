import { diagnosis, maintenance, repairs } from "@/data/catalog";
import { servicePages, type ServicePage } from "@/data/pages";
import { EMAIL, INSTAGRAM_URL, MAPS_URL, TIKTOK_URL } from "@/lib/site";
import { WHATSAPP_NUMBER } from "@/lib/quote";

export const SITE = "https://quickfix.pe";
export const OG_IMAGE = "https://res.cloudinary.com/dmegp6gmd/image/upload/c_fill,w_1200,h_630,f_jpg,q_80/hero-background_ynkel5.webp";

/** Lo que va en <head> de cada URL; el prerender lo escribe en el HTML. */
export type Head = { path: string; title: string; description: string; jsonLd: object[] };

const allPrices = [...maintenance.flatMap((c) => c.services.map((s) => s.price)), ...diagnosis.map((d) => d.price), ...repairs.map((r) => r.from)];

/** Datos del negocio. Deben coincidir con la ficha de Google (nombre, dirección, teléfono, ubicación). */
export const business = {
  "@context": "https://schema.org",
  "@type": "ElectronicsRepairShop",
  "@id": `${SITE}/#negocio`,
  name: "QuickFix",
  url: `${SITE}/`,
  image: OG_IMAGE,
  telephone: `+${WHATSAPP_NUMBER}`,
  email: EMAIL,
  priceRange: `S/ ${Math.min(...allPrices)} - S/ ${Math.max(...allPrices)}`,
  description: "Mantenimiento con metal líquido y reparación de placa para laptops gamer, ASUS ROG, PC y consolas en San Miguel, Lima. Atención 24/7 con cita.",
  address: { "@type": "PostalAddress", streetAddress: "Talambo 135", addressLocality: "San Miguel", addressRegion: "Lima", postalCode: "15087", addressCountry: "PE" },
  // Plus Code WVCQ+JW San Miguel.
  geo: { "@type": "GeoCoordinates", latitude: -12.078437, longitude: -77.110188 },
  hasMap: MAPS_URL,
  areaServed: { "@type": "City", name: "Lima" },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [INSTAGRAM_URL, TIKTOK_URL, MAPS_URL],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Mantenimiento y reparación",
    itemListElement: maintenance.flatMap((c) =>
      c.services.map((s) => ({
        "@type": "Offer",
        price: s.price,
        priceCurrency: "PEN",
        itemOffered: { "@type": "Service", name: `Mantenimiento ${s.name}`, description: s.detail || undefined },
      })),
    ),
  },
};

const breadcrumb = (page: ServicePage) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE}/${page.slug}/` },
  ],
});

const service = (page: ServicePage) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: page.h1,
  description: page.description,
  provider: { "@id": `${SITE}/#negocio` },
  areaServed: { "@type": "City", name: "Lima" },
  offers: { "@type": "Offer", price: page.priceFrom, priceCurrency: "PEN", url: `${SITE}/${page.slug}/` },
});

export const heads: Head[] = [
  {
    path: "/",
    title: "Mantenimiento ASUS ROG y laptops gamer en Lima | QuickFix",
    description:
      "Especialista en ASUS ROG y laptops gamer en San Miguel, Lima: mantenimiento con metal líquido, masilla térmica y reparación de placa. 5.0 en Google con +140 reseñas. Atención 24/7 con cita.",
    jsonLd: [business],
  },
  ...servicePages.map((p) => ({ path: `/${p.slug}/`, title: p.title, description: p.description, jsonLd: [business, service(p), breadcrumb(p)] })),
];
