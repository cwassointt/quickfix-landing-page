import Navbar from "@/components/Navbar";
import QuoteSection from "@/components/QuoteSection";
import ReviewsSection from "@/components/ReviewsSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import OptimizedImage from "@/components/OptimizedImage";
import BackButton from "@/components/BackButton";
import { faq } from "@/data/faq";
import { servicePages, type ServicePage as Page } from "@/data/pages";
import { openQuote, waLink } from "@/lib/site";

import laptopImg from "../images/services/servicio-laptop.webp";
import laptopGamerImg from "../images/repair/laptopgamer-repair.webp";
import pcImg from "../images/services/servicio-pc.webp";
import gpuImg from "../images/services/servicio-gpu.webp";
import macbookImg from "../images/services/servicio-macbook.webp";
import consoleImg from "../images/services/servicio-consola.webp";
import boardImg from "../images/repair/gpu-repair.webp";

const IMG: Record<Page["image"], string> = { laptop: laptopImg, laptopGamer: laptopGamerImg, pc: pcImg, gpu: gpuImg, macbook: macbookImg, console: consoleImg, board: boardImg };
const PRESS =
  "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";

/** Página por servicio: mismo diseño que la portada, con texto propio para que Google la encuentre por esa búsqueda. */
const ServicePage = ({ page }: { page: Page }) => (
  <div className="relative min-h-[100svh] w-full overflow-x-clip bg-[#050505]">
    <Navbar />
    <main>
      <section className="bg-[#050505] pt-[72px]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-5 pb-12 pt-10 md:px-8 lg:py-20">
            <BackButton fallback="/#servicios" />
            <nav aria-label="Ruta" className="mt-8 text-white/60">
              <a href="/" className="hover:text-white">Inicio</a> <span aria-hidden="true">/</span> <span className="text-white/80">{page.h1}</span>
            </nav>
            <h1 className="mt-6 text-[2.6rem] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl xl:text-7xl">{page.h1}</h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-white/80 md:text-xl">{page.lead}</p>
            <p className="mt-8 text-white/60">
              desde <span className="font-display block text-5xl font-bold tracking-[-0.03em] text-white tabular-nums">S/ {page.priceFrom}</span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => openQuote(page.quote)} className={`${PRESS} rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f]`}>
                Cotizar mi equipo
              </button>
              <a href={waLink(`Hola QuickFix, quiero información sobre: ${page.h1}.`)} target="_blank" rel="noopener noreferrer" className={`${PRESS} rounded-full bg-white/[0.08] px-8 py-4 text-center text-lg text-white hover:bg-white/[0.14]`}>
                Escribir por WhatsApp
              </a>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-0">
            <OptimizedImage src={IMG[page.image]} alt={page.h1} width={1200} height={900} priority sizes="(max-width: 1024px) 100vw, 50vw" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0b] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-4xl font-bold leading-[1] tracking-[-0.035em] text-white md:text-6xl">Qué hago en tu equipo</h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-3">
            {page.points.map((p) => (
              <li key={p.title}>
                <h3 className="text-2xl font-bold tracking-[-0.02em] text-white">{p.title}</h3>
                <p className="mt-3 text-lg text-white/75">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <QuoteSection initial={page.quote} />
      <ReviewsSection />
      <FaqSection items={faq.filter((f) => page.faq.includes(f.q))} />

      <section className="bg-[#050505] pt-24 md:pt-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">Otros servicios</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {servicePages
              .filter((p) => p.slug !== page.slug)
              .map((p) => (
                <li key={p.slug}>
                  <a href={`/${p.slug}/`} className={`${PRESS} inline-flex rounded-full bg-white/[0.06] px-5 py-3 text-white hover:bg-white/[0.12]`}>
                    {p.h1.replace(" en Lima", "")}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </section>
      <ContactSection />
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default ServicePage;
