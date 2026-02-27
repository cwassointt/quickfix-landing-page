import { memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, HardDrive, AlertTriangle, Clock, ShieldAlert } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onClose: () => void;
}

const clauses = [
  {
    icon: <HardDrive className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
    title: "Cláusula 1 — Respaldo de Información (Data Loss)",
    body: "El cliente es el único responsable de realizar copias de seguridad (backups) de su información antes de entregar el equipo. QuickFix no se hace responsable por la pérdida parcial o total de datos, software o archivos durante los procesos de mantenimiento, diagnóstico o formateo.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
    title: "Cláusula 2 — Fallas Preexistentes y Ocultas",
    body: "Al ingresar un equipo, QuickFix asume que las fallas declaradas por el cliente son las únicas existentes. Si durante el desarme o revisión se detectan daños físicos (placas fisuradas, flexos rotos, sulfatación previa) o cortocircuitos ocultos, la empresa no asumirá responsabilidad sobre la inoperatividad derivada de estos defectos.",
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
    title: "Cláusula 3 — Riesgos del Metal Líquido",
    body: "La aplicación de Metal Líquido es un proceso de ingeniería térmica avanzada. El cliente acepta que este servicio es recomendado únicamente para equipos de gama alta. QuickFix aplica todas las medidas de aislamiento (conformal coating y barreras), pero la manipulación indebida posterior por parte del cliente o técnicos externos anula cualquier garantía.",
  },
  {
    icon: <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
    title: "Cláusula 4 — Abandono de Equipos",
    body: "Todo equipo que no sea recogido dentro de los 30 días calendario posteriores a la notificación de finalización del servicio generará un costo de almacenaje. Pasados los 60 días, QuickFix dispondrá del equipo para cubrir los costos operativos, según las leyes vigentes.",
  },
];

const TermsDialog = memo(({ open, onClose }: TermsDialogProps) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Modal */}
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
              <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Términos y Condiciones
                    </h2>
                    <p className="text-xs text-white/40 mt-0.5 uppercase tracking-widest">
                      de Servicio — QuickFix
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 no-scrollbar">
                <p className="text-sm text-white/40 leading-relaxed border-l-2 border-orange-500/40 pl-4">
                  Al entregar su equipo a QuickFix, el cliente declara haber leído y aceptado
                  íntegramente los siguientes términos. Este documento tiene validez contractual
                  desde el momento de la recepción del equipo.
                </p>

                {clauses.map((clause, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-orange-500/20 transition-colors duration-300"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {clause.icon}
                      <h3 className="text-sm font-bold text-white/90 leading-snug">
                        {clause.title}
                      </h3>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed pl-8">
                      {clause.body}
                    </p>
                  </div>
                ))}

                <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
                  <p className="text-xs text-orange-500/80">
                    Para consultas legales contáctenos en{" "}
                    <a href="mailto:quickfix.pe24@gmail.com" className="underline underline-offset-2 hover:text-orange-400 transition-colors">
                      quickfix.pe24@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-white/5 shrink-0 flex items-center justify-between">
                <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
                  Rev. {new Date().getFullYear()}.1 — Lima, Perú
                </span>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold tracking-wide transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,102,0,0.4)]"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
);

export default TermsDialog;

