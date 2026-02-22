import { X, ChevronDown, HelpCircle, Thermometer, MapPin, CreditCard, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, icon, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between py-5 text-left group transition-all duration-300 px-4 rounded-xl my-1 ${isOpen ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
      >
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                {icon || <HelpCircle className="w-5 h-5" />}
            </div>
            <span className={`font-medium text-base md:text-lg transition-colors ${isOpen ? 'text-orange-400' : 'text-gray-200 group-hover:text-white'}`}>
                {question}
            </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${
            isOpen ? "rotate-180 text-orange-500" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-6 pt-2 pl-16 pr-4 text-gray-400 font-light leading-relaxed text-sm md:text-base">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FAQDialogProps {
  open: boolean;
  onClose: () => void;
}

const FAQDialog = ({ open, onClose }: FAQDialogProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) setShow(true);
    else setTimeout(() => setShow(false), 300);
  }, [open]);

  if (!show) return null;

  const faqs = [
    {
      question: "¿Cada cuánto tiempo debo realizar mantenimiento?",
      icon: <MapPin className="w-5 h-5" />,
      answer: (
        <div className="space-y-4">
          <p>
            La frecuencia <strong>depende críticamente de tu ubicación</strong>. El microclima es un factor determinante:
          </p>
          <ul className="list-disc pl-4 space-y-2 text-gray-300">
            <li>
                <span className="text-orange-400 font-semibold">Distritos costeros (San Miguel, Magdalena, Miraflores):</span> Tienden a sufrir mayor sulfatación debido a la humedad salina. Requieren mayor atención.
            </li>
            <li>
                <span className="text-orange-400 font-semibold">Distritos secos (La Molina, Surco):</span> Sufren menos desgaste químico, por lo que los intervalos pueden extenderse ligeramente.
            </li>
          </ul>
          <div className="bg-white/5 p-4 rounded-lg mt-2 border-l-2 border-orange-500">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Recomendación General QuickFix:</h4>
            <ul className="space-y-1 text-sm">
                <li>• <strong>Laptops Oficina:</strong> Cada 2 a 3 años.</li>
                <li>• <strong>Laptops Gamer (Pasta tradicional):</strong> Cada 1 a 2 años.</li>
                <li>• <strong>Gama Alta (Metal Líquido):</strong> Revisión anual, cambio cada 2 años.</li>
                <li>• <strong>PC Escritorio:</strong> 1 vez al año.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      question: "¿Por qué importa la conductividad térmica (W/mK)?",
      icon: <Thermometer className="w-5 h-5" />,
      answer: (
        <div className="space-y-3">
          <p>
            Los Watts por metro-Kelvin (W/mK) miden la eficiencia con la que un material transfiere el calor del chip hacia el disipador.
          </p>
          <p>
            Pastas térmicas estándar como la <em>Arctic MX-4 (8.5 W/mK)</em> son adecuadas para equipos de oficina o de baja exigencia térmica, pero resultan insuficientes para disipar el calor extremo generado por equipos gamer o workstations de gama alta.
          </p>
          <p className="border border-orange-500/30 bg-orange-500/5 p-3 rounded text-orange-200">
            En QuickFix utilizamos <strong>Thermalright TF9 (14 W/mK)</strong> para pastas, y <strong>Metal Líquido (73 W/mK)</strong> para casos extremos. Esta diferencia de números se traduce en 5°C a 15°C menos de temperatura, evitando el estrangulamiento térmico (Thermal Throttling) y alargando la vida útil de tu GPU/CPU.
          </p>
        </div>
      ),
    },
    {
      question: "¿A qué distritos tienen cobertura a domicilio?",
      icon: <MapPin className="w-5 h-5" />,
      answer: (
        <div className="space-y-4">
          <p>Llegamos a gran parte de Lima Metropolitana. Nuestra cobertura actual incluye:</p>

          {/* Map Embed */}
          <div className="w-full h-48 rounded-lg overflow-hidden border border-white/10 relative grayscale hover:grayscale-0 transition-all duration-500">
             <iframe
               src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d15607.399676672535!2d-77.042793!3d-12.053120!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2spe!4v1708456123456!5m2!1ses-419!2spe"
               width="100%"
               height="100%"
               style={{ border: 0 }}
               allowFullScreen
               loading="lazy"
               referrerPolicy="no-referrer-when-downgrade"
               className="opacity-70"
             ></iframe>
             <div className="absolute inset-0 pointer-events-none border border-orange-500/20 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
            {[
              "San Miguel", "Magdalena del Mar", "Pueblo Libre", "Jesús María",
              "Lince", "San Isidro", "Miraflores", "San Borja",
              "Surquillo", "Santiago de Surco", "La Molina", "Breña",
              "La Victoria", "Chorrillos"
            ].map((distrito) => (
              <div key={distrito} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></span>
                {distrito}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic mt-2">* Para otros distritos, consultar disponibilidad y costo de movilidad vía WhatsApp.</p>
        </div>
      ),
    },
    {
      question: "¿Por qué solo atienden previa cita?",
      icon: <Calendar className="w-5 h-5" />,
      answer: (
        <>
            Para garantizar la <strong>calidad de laboratorio</strong>. A diferencia de galerías comerciales donde reparan "al paso", aquí dedicamos horas exclusivas a tu equipo.
            <br/><br/>
            La cita nos permite mantener un orden estricto, evitar el polvo cruzado entre equipos y brindarte una asesoría personalizada de 15-20 minutos al recibir y entregar tu máquina.
        </>
      ),
    },
    {
        question: "¿Qué métodos de pago aceptan?",
        icon: <CreditCard className="w-5 h-5" />,
        answer: (
          <div className="flex flex-col gap-2">
            <p>Aceptamos todas las facilidades de pago para tu comodidad:</p>
            <div className="flex gap-3 mt-2">
                <span className="px-3 py-1 bg-white/10 rounded text-xs font-bold text-white">Transferencia BCP</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-xs font-bold">Yape</span>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-bold">Efectivo</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold">Plin</span>
            </div>
          </div>
        ),
      },
      {
        question: "¿Pierdo mis archivos con el mantenimiento?",
        icon: <HelpCircle className="w-5 h-5" />,
        answer: "No. El mantenimiento de hardware (limpieza y pasta térmica) no afecta en absoluto tu información. El disco duro/SSD no se toca ni se formatea, a menos que solicites explícitamente un servicio de 'Formateo y Optimización' de software.",
      },
  ];

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 transition-all duration-500 ${
        open ? "bg-black/90 backdrop-blur-md" : "bg-black/0 backdrop-blur-none pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-[#0F0F0E] w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${
          open ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-20"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#141414]">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">Knowledge Base</span>
            <h2 className="text-2xl font-bold text-white mt-1">Preguntas Frecuentes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-2">
                {faqs.map((faq, index) => (
                    <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    icon={faq.icon}
                    isOpen={openIndex === index}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141414] border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
                ¿Tienes otra duda? Escríbenos al <a href="https://wa.me/51940755119" target="_blank" className="text-orange-400 hover:underline">WhatsApp</a>
            </p>
        </div>
      </div>
    </div>
  );
};

export default FAQDialog;

