import { Star } from "lucide-react";

const ReviewsSection = () => {
  return (
    <section id="reseñas" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Opiniones
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mt-3 text-foreground">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Reseñas verificadas de Google Maps
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Google Maps Reviews Embed */}
          <div className="w-full max-w-3xl rounded-xl overflow-hidden border border-border bg-background shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.5!2d-77.09!3d-12.077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sTalambo+135%2C+San+Miguel!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Reseñas QuickFix en Google Maps"
            />
          </div>

          {/* CTA to leave a review */}
          <a
            href="https://maps.app.goo.gl/GShdQstVdWUyZLNj6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-heading font-semibold hover:bg-primary/90 transition-colors"
          >
            <Star className="w-5 h-5" />
            Déjanos tu reseña en Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
