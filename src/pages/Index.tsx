import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProcessSection from "@/components/ProcessSection";
import ContactSection from "@/components/ContactSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative bg-black">
       {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-orange-500 z-[60] shadow-[0_0_10px_rgba(249,115,22,0.7)] transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <Navbar />
      <HeroSection />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}>
        <ServicesSection />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 1200px" }}>
        <ProcessSection />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}>
        <ContactSection />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 400px" }}>
        <Footer />
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default Index;
