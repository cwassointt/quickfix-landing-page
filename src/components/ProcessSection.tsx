import { Droplets, SprayCan, Shield, Sparkles, Flame, Thermometer, Wind, Layers, FlaskConical } from "lucide-react";

// Helper to get image path (assuming Vite/Webpack public folder structure or imports)
const getMaterialImage = (filename: string) => `../src/images/materials/${filename}`;

const steps = [
	{
		icon: <Droplets className="w-7 h-7" />,
		title: "Lavado Químico",
		desc: "Limpieza profunda con soluciones especializadas que eliminan toda impureza sin dañar los componentes.",
	},
	{
		icon: <SprayCan className="w-7 h-7" />,
		title: "Descontaminado",
		desc: "Proceso de descontaminación completa que elimina residuos microscópicos y oxidación.",
	},
	{
		icon: <Shield className="w-7 h-7" />,
		title: "Pasta / Metal Líquido",
		desc: "Re-aplicación profesional de pasta térmica premium o metal líquido para máximo rendimiento.",
	},
	{
		icon: <Sparkles className="w-7 h-7" />,
		title: "Encerado Mate",
		desc: "Acabado protector con encerado mate que deja tu equipo con aspecto de fábrica.",
	},
];

const materials = [
	{
		icon: <Flame className="w-5 h-5" />,
		category: "Metal Líquido",
        img: "GRIZZLY.png",
		items: [
			{ name: "Thermalright Silver King", spec: "79 w/mK" },
			{ name: "Thermal Grizzly Ultra High Performance", spec: "73 w/mK" },
		],
	},
	{
		icon: <Thermometer className="w-5 h-5" />,
		category: "Masilla Térmica",
        img: "UTP8.png",
		items: [
			{ name: "UTP-8 Upsiren", spec: "14.8 w/mK" },
		],
	},
	{
		icon: <Thermometer className="w-5 h-5" />,
		category: "Pasta Térmica",
        img: "TF8.png",
		items: [
			{ name: "Thermalright TF8", spec: "13.8 w/mK" },
			{ name: "Arctic MX4", spec: "8 w/mK" },
		],
	},
	{
		icon: <Layers className="w-5 h-5" />,
		category: "Pads Térmicos",
        img: "ODDYSEY.png",
		items: [
			{ name: "Thermalright Extreme Odyssey II", spec: "14.8 w/mK" },
		],
	},
	{
		icon: <Droplets className="w-5 h-5" />,
		category: "Lavado",
        img: "VISTONY.png",
		items: [
			{ name: "Vistony Limpiador de Contactos", spec: null },
		],
	},
	{
		icon: <FlaskConical className="w-5 h-5" />,
		category: "Descontaminado",
        img: "950.png",
		items: [
			{ name: "Mechanic 950 Cleaning Agent", spec: null },
			{ name: "Arctic MX Cleaner", spec: null },
		],
	},
	{
		icon: <Wind className="w-5 h-5" />,
		category: "Encerado",
        img: "B4QUICKFIX.png",
		items: [
			{ name: "QuickFix B4 Premium Matte", spec: null },
		],
	},
];

const ProcessSection = () => {
	return (
		<section id="proceso" className="py-24 bg-[#050505] overflow-hidden relative">
            {/* Background Texture/Glow for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

			<div className="container mx-auto px-6 relative z-10">

				{/* ── Steps ── */}
				<div className="flex flex-col items-center mb-16 text-center">
                    {/* Updated to match simple text style found in Services & Materials sections */}
					<span className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
						Nuestro Proceso
					</span>
					<h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
						Diferenciadores Técnicos
					</h2>
					<p className="mt-4 text-white/40 max-w-2xl font-light">
						Cada equipo pasa por nuestro proceso completo de 4 pasos para un resultado impecable.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, i) => (
						<div key={step.title} className="text-center group p-4 rounded-2xl hover:bg-white/5 transition-colors duration-500">
							<div className="relative mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-orange-500/10">
								{step.icon}
								<span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-surface-dark border-2 border-primary text-primary text-xs font-heading font-bold flex items-center justify-center shadow-md z-10 group-hover:bg-white group-hover:text-orange-600 transition-colors">
									{i + 1}
								</span>
							</div>
							<h3 className="font-heading font-semibold text-xl mb-3 text-white">
								{step.title}
							</h3>
							<p className="text-sm text-surface-dark-foreground/60 leading-relaxed group-hover:text-surface-dark-foreground/80 transition-colors">
								{step.desc}
							</p>
						</div>
					))}
				</div>

				{/* ── Materials (Redesigned) ── */}
				<div className="mt-32">

					{/* Section header */}
					<div className="flex flex-col items-center mb-16 text-center">
						<span className="text-orange-500 font-medium text-sm tracking-widest uppercase inline-block mb-3">
							Materiales Premium
						</span>
						<h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
							Insumos de Alta Gama
						</h3>
                        <p className="mt-4 text-white/40 max-w-2xl font-light">
                            Selección rigurosa de compuestos térmicos y químicos de grado industrial para garantizar la máxima eficiencia de tu hardware.
                        </p>
					</div>

                    {/* Auto-sliding Carousel with Premium Cards */}
                    <div className="relative w-full overflow-hidden py-10 mask-gradient-x">
                        {/* Gradient Masks for smooth fade */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />

                        <div className="flex w-max animate-scroll hover:pause-scroll will-change-transform">
                            {/* Duplicate list for infinite effect */}
                            {[...materials, ...materials].map((mat, index) => (
                                <div
                                    key={`${mat.category}-${index}`}
                                    className="relative group w-[300px] h-[480px] mx-5 bg-[#0A0A0A] rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-[#FF6600]"
                                >
                                    {/* Glassmorphism Hover Effect Border (Redundant if main border is used, simplifying for cleaner implementation) */}
                                    {/* Subtle Layout Background Glow on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />

                                    {/* 1. Icon Technical Heading */}
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex flex-col">
                                             <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>Categoría</span>
                                             <h4 className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>{mat.category}</h4>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center text-orange-500 shadow-md border border-white/5 transition-all duration-300 group-hover:bg-[#FF6600] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,102,0,0.4)]">
                                            {mat.icon}
                                        </div>
                                    </div>

                                    {/* 2. Product Visualization - Uniform Aspect Ratio Container */}
                                    {/* Added mb-5 for the requested 20px visual separation */}
                                    <div className="relative aspect-video w-full flex items-center justify-center p-4 mb-5 bg-gradient-to-b from-[#111] to-[#0A0A0A] rounded-2xl border border-white/5 group-hover:border-white/10 transition-all duration-300 overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <img
                                            src={getMaterialImage(mat.img)}
                                            alt={mat.category}
                                            className="relative z-10 max-w-[85%] max-h-[85%] w-auto h-auto object-contain filter drop-shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500 ease-out"
                                        />
                                    </div>

                                    {/* 3. Specs List - Aligned Top */}
                                    <div className="flex flex-col gap-3 relative z-10 flex-1 overflow-y-auto no-scrollbar">
                                        {mat.items.map((item, idx) => (
                                            <div key={idx} className="flex flex-col pb-3 border-b border-dashed border-white/5 last:border-0">
                                                <span className="text-sm font-medium text-white/80 leading-snug group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}>
                                                    {item.name}
                                                </span>
                                                {item.spec && (
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <div className="h-1 w-1 bg-orange-500 rounded-full" />
                                                        <span
                                                            className="text-xs text-orange-500 font-bold font-mono tracking-wide"
                                                            style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
                                                        >
                                                            {item.spec}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Decorative Tech Elements */}
                                    <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/10 pointer-events-none">
                                        PRT-{String(index).padStart(2, '0')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

					{/* Bottom note */}
					<p
						className="text-center text-sm text-surface-dark-foreground/60 mt-6 tracking-[0.05em] font-medium max-w-lg mx-auto"
						style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
					>
						Todos los materiales son de grado profesional y seleccionados por su rendimiento térmico superior.
					</p>
				</div>

			</div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 60s linear infinite; 
                }
                .hover\\:pause-scroll:hover {
                    animation-play-state: paused;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
		</section>
	);
};

export default ProcessSection;
