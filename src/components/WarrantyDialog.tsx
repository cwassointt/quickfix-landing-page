import { X, ShieldCheck, Thermometer, Wrench, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface WarrantyDialogProps {
  open: boolean;
  onClose: () => void;
}

const WarrantyDialog = ({ open, onClose }: WarrantyDialogProps) => {
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) setShow(true);
    else setTimeout(() => setShow(false), 300);
  }, [open]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 transition-all duration-500 ease-out ${
        open ? "bg-black/80 backdrop-blur-md opacity-100" : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
    >
      <div
        className={`bg-[#0F0F0E] w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] transform ${
          open ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-12"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">QuickFix Promise</span>
              <h2 className="text-2xl font-bold text-white mt-0.5">Políticas de Garantía</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">

            {/* Thermal Warranty Section */}
            <div className="group bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.07] transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Thermometer className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Garantía Térmica</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Nuestros servicios de mantenimiento preventivo y correctivo cuentan con una <strong>Garantía de Satisfacción Térmica</strong>.
                        </p>
                    </div>
                </div>
                <div className="pl-14 space-y-3">
                    <p className="text-gray-300 text-sm">
                        Si después del servicio notas que las temperaturas no han mejorado según lo proyectado o el equipo presenta estrangulamiento térmico (thermal throttling) injustificado, te ofrecemos <strong>soporte inmediato sin costo adicional</strong>.
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                            <span>Revisión prioritaria en taller.</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                            <span>Re-aplicación de insumos si fuera necesario.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Installation Warranty Section */}
            <div className="group bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.07] transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-green-500/10 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Wrench className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Garantía de Instalación (2 Años)</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                           Para reparaciones que involucran cambio de piezas (teclados, pantallas, baterías) o ensamblaje de componentes.
                        </p>
                    </div>
                </div>
                 <div className="pl-14 space-y-3">
                    <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
                        <p className="text-orange-200 text-sm font-medium">
                            Estamos tan seguros de nuestra mano de obra que ofrecemos <span className="text-white font-bold">2 años de garantía</span> sobre la instalación realizada.
                        </p>
                    </div>
                    <p className="text-gray-300 text-sm mt-3">
                        Esto cubre cualquier desperfecto derivado de un mal montaje o instalación en Laptops y PCs de Escritorio.
                        <br/>
                        <span className="text-xs text-gray-500 italic mt-1 block">* La garantía del componente físico (hardware) está sujeta a la póliza del fabricante de la pieza.</span>
                    </p>
                </div>
            </div>

             <p className="text-center text-xs text-gray-600 pt-4">
                Nos reservamos el derecho de invalidar la garantía si el equipo presenta manipulación por terceros, golpes, daños por líquidos o mal uso eléctrico posterior a nuestro servicio.
            </p>

        </div>
      </div>
    </div>
  );
};

export default WarrantyDialog;

