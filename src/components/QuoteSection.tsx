import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeInfo,
  ChevronDown,
  Cpu,
  Gamepad2,
  Laptop,
  Lock,
  Monitor,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

type QuoteMode = "mantenimiento" | "reparacion";
type MaintenanceCategoryKey = "laptops_oficina" | "laptops_gamer" | "pc_torres" | "gpus" | "consolas";
type DiagnosisCategoryKey = "laptops" | "desktops" | "gpus" | "consoles";
type AddonKey = string;

type CartLine = {
  id: string;
  groupId: string;
  label: string;
  price: number;
  kind: "service" | "addon" | "diagnosis";
};

const LIQUID_KEYS = ["liquid_metal", "liquid_metal_1_chip", "liquid_metal_2_chips"] as const;

const ADDON_LABELS: Record<string, string> = {
  thermal_pads: "Pads térmicos / Masilla premium",
  liquid_metal: "Metal líquido",
  liquid_metal_1_chip: "Metal líquido x1 chip",
  liquid_metal_2_chips: "Metal líquido x2 chips",
  pads_vrm: "Pads térmicos para VRM",
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

type Html2PdfWorker = {
  set: (options: Record<string, unknown>) => Html2PdfWorker;
  from: (element: HTMLElement) => Html2PdfWorker;
  save: () => Promise<unknown>;
};

type Html2PdfFactory = () => Html2PdfWorker;

const loadHtml2Pdf = async () => {
  type Html2PdfWindow = Window & { html2pdf?: Html2PdfFactory };
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

const quoteFontStyle = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" } as const;

const QuoteSection = () => {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [mode, setMode] = useState<QuoteMode>("mantenimiento");
  const [openMaintenanceCategory, setOpenMaintenanceCategory] = useState<MaintenanceCategoryKey>("laptops_oficina");
  const [openDiagnosisCategory, setOpenDiagnosisCategory] = useState<DiagnosisCategoryKey>("laptops");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<AddonKey[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [manualPartName, setManualPartName] = useState("");
  const [manualPartPrice, setManualPartPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/service-catalog.json")
      .then((res) => {
        if (!res.ok) throw new Error("catalog-error");
        return res.json();
      })
      .then(setCatalog)
      .catch(() => setCatalogError("No se pudo cargar el catálogo de servicios."));
  }, []);

  useEffect(() => {
    if (cart.length > 0 && !orderNumber) {
      const now = new Date();
      const random = Math.floor(100 + Math.random() * 900);
      setOrderNumber(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${random}`);
    }
  }, [cart.length, orderNumber]);

  const maintenanceCatalog = catalog?.service_catalog.mantenimiento;
  const diagnosisCatalog = useMemo(() => catalog?.service_catalog.reparacion.diagnosticos ?? [], [catalog]);

  const maintenanceCategories = useMemo(
    () => [
      {
        key: "laptops_oficina" as const,
        title: "Laptops de Oficina",
        description: "Equipos empresariales y de productividad.",
        icon: Laptop,
        items: maintenanceCatalog?.laptops.filter((item) => item.id.includes("oficina")) ?? [],
      },
      {
        key: "laptops_gamer" as const,
        title: "Laptops Gamer",
        description: "Gama media y alta con control térmico premium.",
        icon: Sparkles,
        items: maintenanceCatalog?.laptops.filter((item) => item.id.includes("gamer")) ?? [],
      },
      {
        key: "pc_torres" as const,
        title: "PC Torres",
        description: "Torre compacta, mid-tower y full-tower.",
        icon: Monitor,
        items: maintenanceCatalog?.desktops ?? [],
      },
      {
        key: "gpus" as const,
        title: "Tarjetas Gráficas (GPU)",
        description: "Mantenimiento y limpieza térmica dedicada.",
        icon: Cpu,
        items: maintenanceCatalog?.gpus ?? [],
      },
      {
        key: "consolas" as const,
        title: "Consolas",
        description: "PS4, PS5 y equipos de juego de alto uso.",
        icon: Gamepad2,
        items: maintenanceCatalog?.consoles ?? [],
      },
    ],
    [maintenanceCatalog]
  );

  const diagnosisCategories = useMemo(
    () => [
      {
        key: "laptops" as const,
        title: "Laptops",
        description: "Diagnóstico técnico y evaluación electrónica.",
        icon: Laptop,
        items: diagnosisCatalog.filter((item) => item.platform === "laptops"),
      },
      {
        key: "desktops" as const,
        title: "PC Torres",
        description: "Placa madre, fuente y componentes de escritorio.",
        icon: Monitor,
        items: diagnosisCatalog.filter((item) => item.platform === "desktops"),
      },
      {
        key: "gpus" as const,
        title: "GPU",
        description: "Tarjetas de video dedicadas y revisión por componente.",
        icon: Cpu,
        items: diagnosisCatalog.filter((item) => item.platform === "gpus"),
      },
      {
        key: "consoles" as const,
        title: "Consolas",
        description: "PS4, PS5 y consolas de alto desgaste.",
        icon: Gamepad2,
        items: diagnosisCatalog.filter((item) => item.platform === "consoles"),
      },
    ],
    [diagnosisCatalog]
  );

  const selectedMaintenanceService = useMemo(() => {
    if (!maintenanceCatalog || !selectedServiceId) return null;
    const allServices = [
      ...maintenanceCatalog.laptops,
      ...maintenanceCatalog.desktops,
      ...maintenanceCatalog.gpus,
      ...maintenanceCatalog.consoles,
    ];
    return allServices.find((item) => item.id === selectedServiceId) ?? null;
  }, [maintenanceCatalog, selectedServiceId]);

  const selectedDiagnosis = useMemo(
    () => diagnosisCatalog.find((item) => item.id === selectedDiagnosisId) ?? null,
    [diagnosisCatalog, selectedDiagnosisId]
  );

  const currentServiceAddons = selectedMaintenanceService?.addons ?? null;

  useEffect(() => {
    if (!currentServiceAddons) {
      setSelectedAddons([]);
      return;
    }

    setSelectedAddons((prev) =>
      prev.filter((addon) => Object.prototype.hasOwnProperty.call(currentServiceAddons, addon) && currentServiceAddons[addon] !== null)
    );
  }, [currentServiceAddons]);

  const toggleAddon = (addon: string) => {
    const price = currentServiceAddons?.[addon];
    if (typeof price !== "number") return;

    setSelectedAddons((prev) => {
      if (LIQUID_KEYS.includes(addon as (typeof LIQUID_KEYS)[number])) {
        const next = prev.filter((item) => !LIQUID_KEYS.includes(item as (typeof LIQUID_KEYS)[number]));
        return prev.includes(addon) ? next : [...next, addon];
      }

      return prev.includes(addon) ? prev.filter((item) => item !== addon) : [...prev, addon];
    });
  };

  const clearSelection = () => {
    setSelectedServiceId(null);
    setSelectedDiagnosisId(null);
    setSelectedAddons([]);
  };

  const handleModeChange = (nextMode: QuoteMode) => {
    setMode(nextMode);
    clearSelection();
  };

  const handlePinSubmit = () => {
    if (pinInput.trim() === "1024") {
      setIsAdmin(true);
      setPinModalOpen(false);
      setPinInput("");
      setPinError("");
      return;
    }
    setPinError("PIN incorrecto");
  };

  const addCurrentSelection = () => {
    const groupId = `${Date.now()}`;

    if (mode === "mantenimiento" && selectedMaintenanceService) {
      const lines: CartLine[] = [
        {
          id: `${groupId}-service`,
          groupId,
          label: selectedMaintenanceService.name,
          price: selectedMaintenanceService.base_price,
          kind: "service",
        },
        ...selectedAddons
          .map((addon): CartLine | null => {
            const price = selectedMaintenanceService.addons?.[addon];
            if (typeof price !== "number") return null;

            return {
              id: `${groupId}-${addon}`,
              groupId,
              label: getAddonLabel(addon),
              price,
              kind: "addon",
            };
          })
          .filter((item): item is CartLine => item !== null),
      ];

      setCart((prev) => [...prev, ...lines]);
      clearSelection();
      return;
    }

    if (mode === "reparacion" && selectedDiagnosis) {
      setCart((prev) => [
        ...prev,
        {
          id: `${groupId}-diagnosis`,
          groupId,
          label: selectedDiagnosis.name,
          price: selectedDiagnosis.diagnosis_price,
          kind: "diagnosis",
        },
      ]);
      clearSelection();
    }
  };

  const removeGroup = (groupId: string) => {
    setCart((prev) => prev.filter((item) => item.groupId !== groupId));
  };

  const groupedCart = useMemo(() => {
    const groups = new Map<string, CartLine[]>();
    cart.forEach((item) => {
      const existing = groups.get(item.groupId) ?? [];
      existing.push(item);
      groups.set(item.groupId, existing);
    });
    return Array.from(groups.values());
  }, [cart]);

  const manualPartValue = isAdmin ? parsePositiveNumber(manualPartPrice) : 0;
  const discountValue = isAdmin ? parsePositiveNumber(discount) : 0;
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0) + manualPartValue;
  const finalTotal = Math.max(subtotal - discountValue, 0);
  const hasTicketItems = cart.length > 0;

  const buildWhatsAppMessage = (items: CartLine[]) => {
    const lines = [
      "Hola QuickFix.pe, deseo cotizar el siguiente servicio:",
      "",
      "🧾 *Resumen de Cotización*",
    ];

    items.forEach((item) => {
      lines.push(`• ${item.label}: ${formatCurrency(item.price)}`);
    });

    if (manualPartValue > 0 && manualPartName.trim()) {
      lines.push(`• Repuesto manual (${manualPartName.trim()}): ${formatCurrency(manualPartValue)}`);
    }

    if (discountValue > 0) {
      lines.push(`• Descuento aplicado: -${formatCurrency(discountValue)}`);
    }

    lines.push("");
    lines.push(`*Total estimado:* ${formatCurrency(finalTotal)}`);
    lines.push("📍 QuickFix.pe | +51 940 755 119");

    return lines.join("\n");
  };

  const handleSendWhatsApp = () => {
    if (!hasTicketItems) return;
    const url = `https://wa.me/51940755119?text=${encodeURIComponent(buildWhatsAppMessage(cart))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadPdf = async () => {
    if (!ticketRef.current || !hasTicketItems) return;
    try {
      setIsDownloadingPdf(true);
      const html2pdf = await loadHtml2Pdf();
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: "cotizacion-quickfix.pdf",
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

  const selectedSummary =
    mode === "mantenimiento"
      ? selectedMaintenanceService
        ? selectedMaintenanceService.name
        : "Selecciona un servicio para ver el resumen"
      : selectedDiagnosis
        ? selectedDiagnosis.name
        : "Selecciona un diagnóstico para ver el resumen";

  const selectedPrice =
    mode === "mantenimiento"
      ? selectedMaintenanceService?.base_price ?? 0
      : selectedDiagnosis?.diagnosis_price ?? 0;

  const selectedAddonsPrice =
    mode === "mantenimiento"
      ? selectedAddons.reduce((sum, addon) => {
          const price = currentServiceAddons?.[addon];
          return typeof price === "number" ? sum + price : sum;
        }, 0)
      : 0;

  const previewTotal = selectedPrice + selectedAddonsPrice;
  const canAddToTicket = mode === "mantenimiento" ? !!selectedMaintenanceService : !!selectedDiagnosis;
  const currentTime = new Date().toLocaleString("es-PE", { hour12: false });

  const renderAddonButton = (key: string, price: number | null) => {
    const isLiquid = LIQUID_KEYS.includes(key as (typeof LIQUID_KEYS)[number]);
    const isSelected = selectedAddons.includes(key);
    const disabled = price === null;

    return (
      <button
        key={key}
        type="button"
        onClick={() => toggleAddon(key)}
        disabled={disabled}
        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
          disabled
            ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
            : isSelected
              ? "border-orange-500/60 bg-orange-500/10 shadow-[0_0_0_1px_rgba(249,115,22,0.16)]"
              : "border-white/10 bg-black/20 hover:border-orange-500/40 hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              isSelected ? "border-orange-500 bg-orange-500 text-black" : "border-white/25"
            }`}
          >
            {isSelected ? <span className="h-2 w-2 rounded-full bg-black" /> : <span className="h-2 w-2 rounded-full bg-transparent" />}
          </span>
          <div>
            <div className="text-sm font-medium text-white/90">{getAddonLabel(key)}</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">{isLiquid ? "Opción de metal líquido" : "Complemento opcional"}</div>
          </div>
        </div>
        <div className="text-sm font-semibold text-orange-300">{price === null ? "No disponible" : `+ ${formatCurrency(price)}`}</div>
      </button>
    );
  };

  return (
    <section id="cotizador" className="bg-[#050505] py-24 text-white sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-orange-400/80">Laboratorio técnico QuickFix</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Cotizador dinámico e interactivo</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Elige el servicio en un flujo claro, revisa el ticket al instante y envía tu cotización por WhatsApp o PDF.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_90px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-400">
                  <ReceiptText size={18} />
                  <span className="text-xs font-medium uppercase tracking-[0.35em]">Catálogo interactivo</span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Diseñado para identificar el servicio en segundos</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  Selecciona una categoría, activa tus complementos y añade la cotización al ticket con un solo clic.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("mantenimiento")}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    mode === "mantenimiento"
                      ? "border-orange-500 bg-orange-500/15 text-orange-300"
                      : "border-white/10 bg-black/30 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  Mantenimiento
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("reparacion")}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    mode === "reparacion"
                      ? "border-orange-500 bg-orange-500/15 text-orange-300"
                      : "border-white/10 bg-black/30 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  Diagnóstico
                </button>
              </div>
            </div>

            {catalogError ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-red-500/30 bg-red-500/5 p-8 text-center text-red-300">
                {catalogError}
              </div>
            ) : !catalog ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-white/40">
                Cargando catálogo de servicios...
              </div>
            ) : mode === "mantenimiento" ? (
              <div className="mt-6">
                <Accordion type="single" collapsible value={openMaintenanceCategory} onValueChange={(value) => setOpenMaintenanceCategory((value as MaintenanceCategoryKey) || "laptops_oficina")}>
                  {maintenanceCategories.map((category) => {
                    const Icon = category.icon;
                    const isOpen = openMaintenanceCategory === category.key;
                    return (
                      <AccordionItem key={category.key} value={category.key} className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090909] px-4 sm:px-5">
                        <AccordionTrigger className="group py-5 no-underline hover:no-underline">
                          <div className="flex w-full items-center justify-between gap-4 text-left">
                            <div className="flex items-center gap-4">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${isOpen ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-white/10 bg-white/[0.03] text-white/70"}`}>
                                <Icon size={22} />
                              </div>
                              <div>
                                <div className="text-base font-semibold text-white sm:text-lg">{category.title}</div>
                                <div className="mt-1 text-sm text-white/50">{category.description}</div>
                              </div>
                            </div>
                            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/40 sm:flex">
                              <ChevronDown size={14} />
                              {category.items.length} opciones
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pb-5 pt-0">
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                            {category.items.map((item) => {
                              const selected = selectedServiceId === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedServiceId(item.id);
                                    setSelectedDiagnosisId(null);
                                    setSelectedAddons([]);
                                  }}
                                  className={`flex h-full flex-col justify-between rounded-2xl border p-4 text-left transition ${
                                    selected
                                      ? "border-orange-500/60 bg-orange-500/10 shadow-[0_0_0_1px_rgba(249,115,22,0.16)]"
                                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
                                  }`}
                                >
                                  <div>
                                    <div className="text-sm font-semibold leading-6 text-white">{item.name}</div>
                                    <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/35">
                                      <ShieldCheck size={12} />
                                      Servicio base
                                    </div>
                                  </div>
                                  <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/35">Precio base</span>
                                    <span className="text-base font-semibold text-orange-300">{formatCurrency(item.base_price)}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {selectedMaintenanceService && (
                            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/35 p-4 sm:p-5">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-orange-400/80">
                                    <Sparkles size={14} />
                                    Complementos disponibles
                                  </div>
                                  <h4 className="mt-2 text-lg font-semibold text-white">{selectedMaintenanceService.name}</h4>
                                </div>
                                <div className="text-sm text-white/45">
                                  Base: <span className="font-semibold text-white">{formatCurrency(selectedMaintenanceService.base_price)}</span>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3">
                                {selectedMaintenanceService.addons && Object.keys(selectedMaintenanceService.addons).length > 0 ? (
                                  Object.entries(selectedMaintenanceService.addons).map(([key, price]) => renderAddonButton(key, price))
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                                    Este servicio no requiere complementos adicionales.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ) : (
              <div className="mt-6">
                <Accordion type="single" collapsible value={openDiagnosisCategory} onValueChange={(value) => setOpenDiagnosisCategory((value as DiagnosisCategoryKey) || "laptops") }>
                  {diagnosisCategories.map((category) => {
                    const Icon = category.icon;
                    const isOpen = openDiagnosisCategory === category.key;
                    return (
                      <AccordionItem key={category.key} value={category.key} className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090909] px-4 sm:px-5">
                        <AccordionTrigger className="group py-5 no-underline hover:no-underline">
                          <div className="flex w-full items-center justify-between gap-4 text-left">
                            <div className="flex items-center gap-4">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${isOpen ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-white/10 bg-white/[0.03] text-white/70"}`}>
                                <Icon size={22} />
                              </div>
                              <div>
                                <div className="text-base font-semibold text-white sm:text-lg">{category.title}</div>
                                <div className="mt-1 text-sm text-white/50">{category.description}</div>
                              </div>
                            </div>
                            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/40 sm:flex">
                              <ChevronDown size={14} />
                              {category.items.length} opciones
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pt-0">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {category.items.map((item) => {
                              const selected = selectedDiagnosisId === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDiagnosisId(item.id);
                                    setSelectedServiceId(null);
                                    setSelectedAddons([]);
                                  }}
                                  className={`flex h-full flex-col justify-between rounded-2xl border p-4 text-left transition ${
                                    selected
                                      ? "border-orange-500/60 bg-orange-500/10 shadow-[0_0_0_1px_rgba(249,115,22,0.16)]"
                                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
                                  }`}
                                >
                                  <div>
                                    <div className="text-sm font-semibold leading-6 text-white">{item.name}</div>
                                    <div className="mt-2 text-sm leading-6 text-white/50">{item.preview_text}</div>
                                  </div>
                                  <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/35">Diagnóstico</span>
                                    <span className="text-base font-semibold text-orange-300">{formatCurrency(item.diagnosis_price)}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/40 p-4 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/35">
                    <BadgeInfo size={14} />
                    Selección actual
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedSummary}</p>
                  <p className="mt-1 text-sm text-white/50">
                    {mode === "mantenimiento" && selectedAddons.length > 0
                      ? `${selectedAddons.length} complemento(s) seleccionado(s)`
                      : "Listo para agregar al ticket cuando confirmes tu elección."}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                  >
                    <X size={16} />
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={addCurrentSelection}
                    disabled={!canAddToTicket}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Agregar al ticket
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/45">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Modo: {mode === "mantenimiento" ? "Mantenimiento" : "Diagnóstico"}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Total previo: {formatCurrency(previewTotal)}</span>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[1.75rem] border border-white/10 bg-[#070707] p-4 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6 xl:sticky xl:top-24">
            <div
              ref={ticketRef}
              className="rounded-[1.5rem] border border-zinc-200 bg-[#fffdf8] p-4 text-zinc-900 shadow-[0_12px_40px_rgba(0,0,0,0.14)] sm:p-5"
              style={quoteFontStyle}
            >
              <div className="border-b border-dashed border-zinc-300 pb-3 text-center">
                <div className="text-[11px] uppercase tracking-[0.45em] text-zinc-500">QuickFix.pe</div>
                <div className="mt-2 text-xl font-bold tracking-[0.18em] text-zinc-950">TICKET DE COTIZACIÓN</div>
                <div className="mt-1 text-[11px] text-zinc-500">Talambo 135, San Miguel · +51 940 755 119</div>
                {orderNumber && <div className="mt-2 text-[11px] text-zinc-500">Orden #{orderNumber}</div>}
                <div className="text-[11px] text-zinc-500">{currentTime}</div>
              </div>

              <div className="mt-4 space-y-3">
                {groupedCart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
                    Selecciona un servicio para empezar
                  </div>
                ) : (
                  groupedCart.map((group) => {
                    const mainLine = group.find((item) => item.kind === "service" || item.kind === "diagnosis") ?? group[0];
                    return (
                      <div key={mainLine.groupId} className="rounded-2xl border border-zinc-200 bg-white px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">
                              {mainLine.kind === "diagnosis" ? "Diagnóstico" : "Servicio"}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-zinc-950">{mainLine.label}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGroup(mainLine.groupId)}
                            className="rounded-full border border-zinc-200 p-1.5 text-zinc-400 transition hover:border-red-300 hover:text-red-600"
                            aria-label="Eliminar bloque"
                            title="Eliminar bloque"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-3 space-y-1 border-t border-dashed border-zinc-200 pt-3 text-[13px]">
                          {group.map((item) => (
                            <div key={item.id} className={`flex items-start justify-between gap-3 ${item.kind === "addon" ? "pl-3 text-zinc-600" : "text-zinc-900"}`}>
                              <span className={item.kind === "addon" ? "before:mr-1 before:content-['•']" : ""}>{item.label}</span>
                              <span className={item.price < 0 ? "text-red-600" : "font-semibold"}>{item.price < 0 ? `-${formatCurrency(Math.abs(item.price))}` : formatCurrency(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {isAdmin && (
                <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
                    <Lock size={12} />
                    Panel administrador
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] uppercase tracking-[0.28em] text-zinc-500">Agregar repuesto manual</label>
                    <input
                      type="text"
                      value={manualPartName}
                      onChange={(e) => setManualPartName(e.target.value)}
                      placeholder="Nombre del repuesto"
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={manualPartPrice}
                      onChange={(e) => setManualPartPrice(e.target.value)}
                      placeholder="Precio"
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] uppercase tracking-[0.28em] text-zinc-500">Aplicar descuento</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="Monto a restar"
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400"
                    />
                  </div>
                </div>
              )}

              {hasTicketItems && (
                <div className="mt-4 space-y-2 border-t border-dashed border-zinc-300 pt-3 text-[13px]">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {manualPartValue > 0 && manualPartName.trim() && (
                    <div className="flex items-center justify-between text-zinc-600">
                      <span>Repuesto manual</span>
                      <span>{formatCurrency(manualPartValue)}</span>
                    </div>
                  )}
                  {discountValue > 0 && (
                    <div className="flex items-center justify-between text-red-600">
                      <span>Descuento</span>
                      <span>-{formatCurrency(discountValue)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-zinc-300 pt-2 text-base font-bold text-zinc-950">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-dashed border-zinc-300 pt-3 text-center text-[10px] leading-5 text-zinc-500">
                <p>Gracias por confiar en QuickFix.pe</p>
                <p>La cotización es referencial y puede variar luego de diagnóstico físico.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={!hasTicketItems}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wrench size={18} />
                Enviar cotización por WhatsApp
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!hasTicketItems || isDownloadingPdf}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={18} />
                {isDownloadingPdf ? "Generando PDF..." : "Descargar PDF"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPinModalOpen(true)}
              className="mt-4 ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/20 transition hover:text-orange-400"
              aria-label="Abrir panel de administrador"
              title="Abrir panel de administrador"
            >
              <Lock size={14} />
              Admin
            </button>
          </aside>
        </div>
      </div>

      {pinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <h4 className="text-2xl font-semibold text-white">Acceso oculto</h4>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Ingresa el PIN para habilitar campos de ajuste manual en el ticket.
            </p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError("");
              }}
              placeholder="••••"
              className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-center text-lg tracking-[0.45em] text-white outline-none transition focus:border-orange-500"
              autoFocus
            />
            {pinError && <p className="mt-2 text-center text-xs text-red-400">{pinError}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPinModalOpen(false);
                  setPinInput("");
                  setPinError("");
                }}
                className="h-11 rounded-2xl border border-white/10 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePinSubmit}
                className="h-11 rounded-2xl bg-orange-500 text-sm font-semibold text-black transition hover:brightness-110"
              >
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


