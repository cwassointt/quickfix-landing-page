import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import ServicesSection from "@/components/ServicesSection";
import QuoteSection from "@/components/QuoteSection";
import ProcessSection from "@/components/ProcessSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

// Orden de la página: primero la confianza (hero y reseñas), luego precios, cotizador y cómo se trabaja.
const Index = () => (
  <div className="relative min-h-[100svh] w-full overflow-x-clip bg-[#050505]">
    <Navbar />
    <main>
      <HeroSection />
      <ReviewsSection />
      <ServicesSection />
      <QuoteSection />
      <ProcessSection />
      <FaqSection />
      <ContactSection />
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Index;
