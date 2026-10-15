import { ADDRESS, EMAIL, INSTAGRAM_URL, MAPS_EMBED, MAPS_URL, PHONE_DISPLAY, TIKTOK_URL, WAZE_URL, waLink } from "@/lib/site";

const PRESS =
  "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";

const ContactSection = () => (
  <section id="contacto" className="bg-[#0b0b0b] py-24 md:py-36">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div>
        <h2 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">Agenda tu cita</h2>
        <p className="mt-6 max-w-[42ch] text-lg text-white/80">Atiendo las 24 horas, todos los días, con cita previa. También voy a domicilio en Lima.</p>

        <dl className="mt-12 space-y-8">
          <div>
            <dt className="text-white/60">Dirección</dt>
            <dd className="mt-1 text-2xl text-white">{ADDRESS}</dd>
            <dd className="mt-3 flex flex-wrap gap-2">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={`${PRESS} rounded-full bg-white/[0.08] px-5 py-2.5 text-white hover:bg-white/[0.14]`}>
                Google Maps
              </a>
              <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" className={`${PRESS} rounded-full bg-white/[0.08] px-5 py-2.5 text-white hover:bg-white/[0.14]`}>
                Waze
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-white/60">Horario</dt>
            <dd className="mt-1 text-2xl text-white">24/7 con cita previa</dd>
          </div>
          <div>
            <dt className="text-white/60">WhatsApp</dt>
            <dd className="mt-1">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="text-2xl text-white underline-offset-4 hover:text-primary hover:underline">
                {PHONE_DISPLAY}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-white/60">Correo y redes</dt>
            <dd className="mt-1 flex flex-wrap gap-x-6 gap-y-2 text-lg">
              <a href={`mailto:${EMAIL}`} className="text-white underline-offset-4 hover:text-primary hover:underline">{EMAIL}</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white underline-offset-4 hover:text-primary hover:underline">Instagram</a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-white underline-offset-4 hover:text-primary hover:underline">TikTok</a>
            </dd>
          </div>
        </dl>

        <a href={waLink()} target="_blank" rel="noopener noreferrer" className={`${PRESS} mt-12 inline-flex rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f]`}>
          Agendar por WhatsApp
        </a>
      </div>

      <div className="min-h-[420px] overflow-hidden rounded-3xl bg-[#151515]">
        <iframe
          title="Ubicación de QuickFix en San Miguel, Lima"
          src={MAPS_EMBED}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-[420px] w-full"
        />
      </div>
    </div>
  </section>
);

export default ContactSection;
