import { X, ShieldCheck, Thermometer, Wrench, CheckCircle2, Cpu } from "lucide-react";
import { memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface WarrantyDialogProps {
  open: boolean;
  onClose: () => void;
}

const WarrantyDialog = memo(({ open, onClose }: WarrantyDialogProps) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="pointer-events-auto w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
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

                  {/* Electronic Repair Warranty Section */}
                  <div className="group bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.07] transition-all duration-300">
                      <div className="flex items-start gap-4 mb-4">
                          <div className="p-2 bg-purple-500/10 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <Cpu className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white mb-2">Garantía de Microsoldadura (3 Meses)</h3>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                  Nuestras reparaciones a nivel de componente electrónico cuentan con una garantía técnica de 90 días.
                              </p>
                          </div>
                      </div>
                      <div className="pl-14 space-y-3">
                          <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg">
                              <p className="text-purple-200 text-sm font-medium">
                                  La cobertura aplica <span className="text-white font-bold">exclusivamente a la zona o componente electrónico reparado</span> (ej. circuito de carga, mosfets, VRAM).
                              </p>
                          </div>
                          <ul className="space-y-2 mt-3">
                              <li className="flex items-start gap-2 text-sm text-gray-400">
                                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                  <span>No cubre fallas futuras en circuitos distintos al intervenido originalmente.</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-400">
                                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                  <span>Se invalida automáticamente si el equipo sufre variaciones de voltaje (uso de cargadores genéricos) o nuevos derrames de líquidos.</span>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
);

export default WarrantyDialog;
