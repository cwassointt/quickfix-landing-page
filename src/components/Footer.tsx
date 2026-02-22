import { MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <p className="font-black text-2xl tracking-tight text-white mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Quick<span className="text-orange-500">Fix</span>
            </p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
              Servicio técnico especializado en hardware de alto rendimiento.
              Devolvemos la ingeniería original a su equipo con procesos de laboratorio.
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">Atención Previa Cita</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Laptops Gamer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">PC Master Race</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mantenimiento GPU</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Consolas</a></li>
            </ul>
          </div>

          {/* Contact Mini */}
          <div>
             <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Ubicación</h4>
             <ul className="space-y-3 text-sm text-gray-500">
               <li className="flex items-start gap-2">
                 <MapPin className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                 <span>Talambo 135, San Miguel,<br/>Lima, Perú</span>
               </li>
               <li className="flex items-start gap-2">
                 <Clock className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                 <span>24 Horas / 7 Días<br/><span className="text-xs opacity-60">(Previa coordinación)</span></span>
               </li>
             </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} QuickFix. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
             <span className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer">Términos</span>
             <span className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer">Garantía</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
