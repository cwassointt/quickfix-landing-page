import React, { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Thermometer, Microscope, Monitor, Laptop, Gamepad2, Cpu, ArrowLeft, Check, Plus, AlertTriangle, X } from "lucide-react";

type AddonsMap = Record<string, number | null>;

type ServiceItem = {
  id: string;
  name: string;
  base_price: number;
  addons?: AddonsMap;
};

type DiagnosisItem = {
  id: string;
  platform: string;
  name: string;
  diagnosis_price: number;
  preview_text: string;
};

type CatalogData = {
  service_catalog: {
    mantenimiento: {
      laptops: ServiceItem[];
      desktops: ServiceItem[];
      gpus: ServiceItem[];
      consoles: ServiceItem[];
    };
    reparacion: {
      diagnosticos: DiagnosisItem[];
    };
  };
};

type Intent = "mantenimiento" | "reparacion" | null;
type Platform = "laptops" | "desktops" | "gpus" | "consoles" | null;

type CartItem = {
  id: string;
  description: string;
  price: number;
};

const ADDON_LABELS: Record<string, string> = {
  thermal_pads: "Pads térmicos (Alto Rendimiento)",
  liquid_metal: "Metal líquido",
  liquid_metal_1_chip: "Metal líquido (1 chip)",
  liquid_metal_2_chips: "Metal líquido (2 chips)",
  pads_vrm: "Pads/Masilla térmica para VRM (Placa Madre)",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);

const parsePositiveNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getAddonLabel = (key: string) => ADDON_LABELS[key] ?? key.replace(/_/g, " ");

const loadHtml2Pdf = async () => {
  type Html2PdfWindow = Window & { html2pdf?: any };
  const htmlWindow = window as Html2PdfWindow;
  if (htmlWindow.html2pdf) return htmlWindow.html2pdf;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar html2pdf.js"));
    document.body.appendChild(script);
  });
  if (!htmlWindow.html2pdf) throw new Error("html2pdf.js no está disponible");
  return htmlWindow.html2pdf;
};

const QuoteSection = () => {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [catalogError, setCatalogError] = useState("");

  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intent, setIntent] = useState<Intent>(null);
  const [platform, setPlatform] = useState<Platform>(null);
  const [includeGpu, setIncludeGpu] = useState(false);

  // Selections
  const [mainServiceId, setMainServiceId] = useState<string | null>(null);
  const [mainAddons, setMainAddons] = useState<string[]>([]);
  const [gpuServiceId, setGpuServiceId] = useState<string | null>(null);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [manualPartName, setManualPartName] = useState("");
  const [manualPartPrice, setManualPartPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    fetch("/data/service-catalog.json")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setCatalog)
      .catch(() => setCatalogError("Error cargando el catálogo de laboratorio."));
  }, []);

  // Generate order number when first item is added
  useEffect(() => {
    if (cart.length > 0 && !orderNumber) {
      const now = new Date();
      const random = Math.floor(100 + Math.random() * 900);
      setOrderNumber(`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${random}`);
    }
  }, [cart, orderNumber]);

  const handleGoBack = () => {
    if (step === 3) {
      setMainServiceId(null);
      setGpuServiceId(null);
      setMainAddons([]);
      setStep(2);
    } else if (step === 2) {
      setPlatform(null);
      setIncludeGpu(false);
      setStep(1);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput.trim() === "1024") {
      setIsAdmin(true);
      setPinModalOpen(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("PIN incorrecto");
    }
  };

  const toggleAddon = (addon: string) => {
    setMainAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  // Check if current selection is valid to add to cart
  const isSelectionValid = useMemo(() => {
    if (!catalog || !intent || !platform || !mainServiceId) return false;
    if (intent === "reparacion") {
      return catalog.service_catalog.reparacion.diagnosticos.some(d => d.id === mainServiceId);
    } else if (intent === "mantenimiento") {
      const svc = catalog.service_catalog.mantenimiento[platform]?.find(s => s.id === mainServiceId);
      if (!svc) return false;
      if (platform === "desktops" && includeGpu && !gpuServiceId) return false;
      return true;
    }
    return false;
  }, [catalog, intent, platform, mainServiceId, includeGpu, gpuServiceId]);

  // Add current selection to cart
  const addToCart = () => {
    if (!catalog || !intent || !platform || !mainServiceId || !isSelectionValid) return;

    const newItems: CartItem[] = [];

    if (intent === "reparacion") {
      const diag = catalog.service_catalog.reparacion.diagnosticos.find(d => d.id === mainServiceId);
      if (diag) {
        newItems.push({
          id: `${Date.now()}-diag`,
          description: `Diagnóstico: ${diag.name}`,
          price: diag.diagnosis_price,
        });
      }
    } else if (intent === "mantenimiento") {
      const svc = catalog.service_catalog.mantenimiento[platform]?.find(s => s.id === mainServiceId);
      if (!svc) return;

      // Main service
      newItems.push({
        id: `${Date.now()}-main`,
        description: `Mantenimiento: ${svc.name}`,
        price: svc.base_price,
      });

      // Addons
      mainAddons.forEach(addonKey => {
        const addonPrice = svc.addons?.[addonKey];
        if (typeof addonPrice === "number") {
          newItems.push({
            id: `${Date.now()}-addon-${addonKey}`,
            description: `+ ${getAddonLabel(addonKey)}`,
            price: addonPrice,
          });
        }
      });

      // GPU if desktop
      if (platform === "desktops" && includeGpu && gpuServiceId) {
        const gpuSvc = catalog.service_catalog.mantenimiento.gpus.find(g => g.id === gpuServiceId);
        if (gpuSvc) {
          newItems.push({
            id: `${Date.now()}-gpu`,
            description: `+ GPU: ${gpuSvc.name}`,
            price: gpuSvc.base_price,
          });
        }
      }
    }

    if (newItems.length > 0) {
      setCart(prev => [...prev, ...newItems]);
      // Optionally reset selection? We'll keep it so user can add similar.
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const manualPartValue = isAdmin ? parsePositiveNumber(manualPartPrice) : 0;
  const discountValue = isAdmin ? parsePositiveNumber(discount) : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0) + manualPartValue;
  const finalTotal = Math.max(subtotal - discountValue, 0);

  const previewText = useMemo(() => {
    if (intent === "reparacion" && mainServiceId && catalog) {
      const diag = catalog.service_catalog.reparacion.diagnosticos.find((d) => d.id === mainServiceId);
      return diag?.preview_text;
    }
    return null;
  }, [intent, mainServiceId, catalog]);

  const buildWhatsAppMessage = (items: CartItem[]) => {
    const lines = [
      "Hola QuickFix.pe, solicito los servicios del laboratorio:",
      "",
      "🧾 *Resumen de Ticket*",
      ...items.map((item) => `🔹 ${item.description}: ${formatCurrency(item.price)}`),
    ];
    if (manualPartValue > 0 && manualPartName.trim()) {
      lines.push(`🔹 Repuesto manual (${manualPartName.trim()}): ${formatCurrency(manualPartValue)}`);
    }
    if (discountValue > 0) {
      lines.push(`🔹 Descuento aplicado: -${formatCurrency(discountValue)}`);
    }
    lines.push("");
    lines.push(`*Total estimado:* ${formatCurrency(finalTotal)}`);
    if (previewText) {
      lines.push("");
      lines.push(`⚠️ _Nota: ${previewText}_`);
    }
    return lines.join("\n");
  };

  const handleSendWhatsApp = () => {
    if (finalTotal === 0 || cart.length === 0) return;
    const url = `https://wa.me/51940755119?text=${encodeURIComponent(buildWhatsAppMessage(cart))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadPdf = async () => {
    if (!ticketRef.current || finalTotal === 0 || cart.length === 0) return;
    try {
      setIsDownloadingPdf(true);
      const html2pdf = await loadHtml2Pdf();
      await html2pdf()
        .set({
          margin: [12, 10, 12, 10],
          filename: "cotizacion-laboratorio-quickfix.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(ticketRef.current)
        .save();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Get current date/time string
  const now = new Date();
  const dateTimeStr = now.toLocaleString("es-PE", { hour12: false });

  return (
    <section id="cotizador" className="py-24 bg-[#050505] min-h-screen text-white font-sans">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-orange-500 font-medium text-sm tracking-widest uppercase">Laboratorio Técnico</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">Sistema de Cotización</h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Configura tu servicio con precisión. Diagnósticos electrónicos y mantenimientos de grado industrial.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* LEFT WIZARD PANEL */}
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm p-5 md:p-8 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {step > 1 && (
                  <button onClick={handleGoBack} className="p-1 hover:bg-white/10 rounded-full transition">
                    <ArrowLeft size={20} className="text-orange-400" />
                  </button>
                )}
                <span className="text-white/80">
                  {step === 1 ? "1. Tipo de Intervención" : step === 2 ? "2. Plataforma de Hardware" : "3. Especificaciones"}
                </span>
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full w-8 transition-colors ${step >= i ? "bg-orange-500" : "bg-white/10"}`} />
                ))}
              </div>
            </div>

            {catalogError ? (
              <p className="text-red-400 m-auto">{catalogError}</p>
            ) : !catalog ? (
              <p className="text-white/40 m-auto animate-pulse">Iniciando sistema de cotización...</p>
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => { setIntent("mantenimiento"); setStep(2); }}
                      className="group flex flex-col items-center text-center gap-4 p-8 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-orange-500/10 hover:border-orange-500/50 transition"
                    >
                      <Thermometer size={48} className="text-orange-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-semibold text-lg">Mantenimiento Profundo</h4>
                        <p className="text-sm text-white/50 mt-2">Optimización térmica, limpieza química y prevención.</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setIntent("reparacion"); setStep(2); }}
                      className="group flex flex-col items-center text-center gap-4 p-8 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-orange-500/10 hover:border-orange-500/50 transition"
                    >
                      <Microscope size={48} className="text-orange-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-semibold text-lg">Reparación Electrónica</h4>
                        <p className="text-sm text-white/50 mt-2">Diagnóstico de precisión, microsoldadura y recuperación.</p>
                      </div>
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: "laptops", icon: Laptop, label: "Laptop" },
                        { id: "desktops", icon: Monitor, label: "PC Torre" },
                        { id: "gpus", icon: Cpu, label: "GPU Dedicada" },
                        { id: "consoles", icon: Gamepad2, label: "Consola" },
                      ].map((plat) => {
                        const isSelected = platform === plat.id;
                        return (
                          <button
                            key={plat.id}
                            onClick={() => { setPlatform(plat.id as Platform); setIncludeGpu(false); }}
                            className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition ${isSelected ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                          >
                            <plat.icon size={32} className={isSelected ? "text-orange-400" : "text-white/60"} />
                            <span className={`text-sm font-medium ${isSelected ? "text-orange-300" : "text-white/80"}`}>{plat.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {intent === "mantenimiento" && platform === "desktops" && (
                      <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                          <Cpu className="text-orange-400" size={24} />
                          <span className="text-sm font-medium text-white/90">¿Incluir mantenimiento profundo a Tarjeta Gráfica (GPU)?</span>
                        </div>
                        <button
                          onClick={() => setIncludeGpu(!includeGpu)}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${includeGpu ? "bg-orange-500" : "bg-white/20"}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${includeGpu ? "translate-x-7" : "translate-x-1"}`} />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end mt-8">
                      <button
                        onClick={() => setStep(3)}
                        disabled={!platform}
                        className="px-6 py-2.5 rounded-lg bg-orange-500 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
                      >
                        Siguiente paso
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && intent && platform && (
                  <div className="space-y-6 animate-in fade-in">
                    {intent === "reparacion" && (
                      <div className="space-y-3">
                        <h4 className="text-white/70 text-sm uppercase tracking-wider mb-4">Seleccione el equipo para diagnóstico:</h4>
                        {catalog.service_catalog.reparacion.diagnosticos
                          .filter((d) => d.platform === platform)
                          .map((diag) => (
                            <button
                              key={diag.id}
                              onClick={() => setMainServiceId(diag.id)}
                              className={`w-full flex justify-between items-center p-4 rounded-xl border transition ${mainServiceId === diag.id ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                            >
                              <span className="font-medium text-left">{diag.name}</span>
                              <span className="text-orange-300 font-semibold">{formatCurrency(diag.diagnosis_price)}</span>
                            </button>
                          ))}
                      </div>
                    )}

                    {intent === "mantenimiento" && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-white/70 text-sm uppercase tracking-wider mb-4">Seleccione la categoría:</h4>
                          {catalog.service_catalog.mantenimiento[platform].map((svc) => (
                            <button
                              key={svc.id}
                              onClick={() => { setMainServiceId(svc.id); setMainAddons([]); }}
                              className={`w-full flex justify-between items-center p-4 rounded-xl border transition ${mainServiceId === svc.id ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                            >
                              <span className="font-medium text-left text-sm md:text-base">{svc.name}</span>
                              <span className="text-orange-300 font-semibold">{formatCurrency(svc.base_price)}</span>
                            </button>
                          ))}
                        </div>

                        {mainServiceId && catalog.service_catalog.mantenimiento[platform].find(s => s.id === mainServiceId)?.addons && (
                          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.01]">
                            <h5 className="text-xs uppercase tracking-widest text-orange-400 mb-3">Recomendaciones de Laboratorio</h5>
                            <div className="space-y-2">
                              {Object.entries(catalog.service_catalog.mantenimiento[platform].find(s => s.id === mainServiceId)!.addons!).map(([key, price]) => {
                                const isChecked = mainAddons.includes(key);
                                const isDisabled = price === null;
                                return (
                                  <label key={key} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${isDisabled ? "opacity-50 cursor-not-allowed border-white/5" : isChecked ? "border-orange-500/50 bg-orange-500/10" : "border-white/10 hover:border-white/30"}`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isChecked ? "bg-orange-500 border-orange-500" : "border-white/30"}`}>
                                        {isChecked && <Check size={14} className="text-black" />}
                                      </div>
                                      <span className="text-sm font-medium">{getAddonLabel(key)}</span>
                                    </div>
                                    <span className="text-orange-300 text-sm font-semibold">{isDisabled ? "No disponible" : `+ ${formatCurrency(price)}`}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {platform === "desktops" && includeGpu && (
                          <div className="pt-4 border-t border-white/10 space-y-3">
                            <h4 className="text-white/70 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Cpu size={16}/> Especifique la Tarjeta Gráfica:
                            </h4>
                            {catalog.service_catalog.mantenimiento.gpus.map((gpu) => (
                              <button
                                key={gpu.id}
                                onClick={() => setGpuServiceId(gpu.id)}
                                className={`w-full flex justify-between items-center p-4 rounded-xl border transition ${gpuServiceId === gpu.id ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
                              >
                                <span className="font-medium text-left text-sm md:text-base">{gpu.name}</span>
                                <span className="text-orange-300 font-semibold">+{formatCurrency(gpu.base_price)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT TICKET PANEL - Cart / Receipt */}
          <aside className="rounded-2xl border border-white/10 bg-[#080808] p-5 md:p-6 h-fit sticky top-24 shadow-2xl flex flex-col">
            <div ref={ticketRef} className="bg-white text-black p-5 rounded-xl shadow-inner font-mono text-sm">
              {/* Ticket header */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <div className="font-bold text-lg tracking-wider">QuickFix.pe</div>
                <div className="text-xs text-gray-600">Talambo 135, San Miguel, 15087</div>
                <div className="text-xs text-gray-600">+51 940-755-119</div>
                {orderNumber && (
                  <div className="text-xs text-gray-500 mt-1">Orden #{orderNumber}</div>
                )}
                <div className="text-xs text-gray-500">{dateTimeStr}</div>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-3">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 italic py-6">Carrito vacío</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-dotted border-gray-200 py-1">
                      <div className="flex-1">
                        <span className="text-xs">1</span>
                        <span className="ml-2">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                          aria-label="Eliminar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Admin extra items */}
              {isAdmin && manualPartValue > 0 && manualPartName.trim() && (
                <div className="flex justify-between border-b border-dotted border-gray-200 py-1">
                  <span>Repuesto: {manualPartName.trim()}</span>
                  <span className="font-semibold">{formatCurrency(manualPartValue)}</span>
                </div>
              )}

              {/* Totals */}
              {cart.length > 0 && (
                <>
                  <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(discountValue)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-1 mt-1">
                      <span>Total</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Footer / policies */}
                  <div className="mt-4 text-[10px] text-gray-500 border-t border-dashed border-gray-300 pt-3 text-center leading-relaxed">
                    <p>Este ticket es una cotización estimada.</p>
                    <p>Los precios pueden variar según diagnóstico final.</p>
                    <p>Para consultas, llámanos al +51 940-755-119.</p>
                    <p className="mt-1">Gracias por confiar en QuickFix.pe</p>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={addToCart}
                disabled={!isSelectionValid}
                className="w-full h-12 rounded-xl bg-orange-500 text-black font-bold uppercase tracking-wide hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Agregar
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSendWhatsApp}
                  disabled={finalTotal === 0 || cart.length === 0}
                  className="h-12 rounded-xl bg-[#25D366] text-black font-bold uppercase tracking-wide hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={finalTotal === 0 || cart.length === 0 || isDownloadingPdf}
                  className="h-12 rounded-xl border border-white/10 text-white/70 font-semibold hover:bg-white/5 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadingPdf ? "Generando..." : "PDF"}
                </button>
              </div>
            </div>

            {/* Admin lock */}
            <button onClick={() => setPinModalOpen(true)} className="mt-4 text-white/20 hover:text-orange-400 transition self-end" aria-label="Admin">
              <Lock size={16} />
            </button>
          </aside>
        </div>
      </div>

      {/* Admin PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <h4 className="text-xl font-bold text-white mb-2">Acceso Restringido</h4>
            <p className="text-sm text-white/50 mb-6">Laboratorio Técnico. Ingrese PIN de autorización para modificar tarifas.</p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
              placeholder="••••"
              className="w-full h-12 rounded-xl border border-white/10 bg-black px-4 text-white text-center tracking-[0.5em] text-lg focus:border-orange-500 outline-none transition"
              autoFocus
            />
            {pinError && <p className="text-red-400 text-xs mt-2 text-center">{pinError}</p>}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => { setPinModalOpen(false); setPinInput(""); }} className="h-11 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition">
                Cancelar
              </button>
              <button onClick={handlePinSubmit} className="h-11 rounded-xl bg-orange-500 text-black font-bold hover:brightness-110 transition">
                Validar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuoteSection;