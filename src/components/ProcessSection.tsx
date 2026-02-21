import { Droplets, SprayCan, Shield, Sparkles, Flame, Thermometer, Wind, Layers, FlaskConical } from "lucide-react";

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
		items: [
			{ name: "Thermalright Silver King", spec: "79 w/mK" },
			{ name: "Thermal Grizzly Ultra High Performance", spec: "73 w/mK" },
		],
	},
	{
		icon: <Thermometer className="w-5 h-5" />,
		category: "Masilla Térmica",
		items: [
			{ name: "UTP-8 Upsiren", spec: "14.8 w/mK" },
		],
	},
	{
		icon: <Thermometer className="w-5 h-5" />,
		category: "Pasta Térmica",
		items: [
			{ name: "Thermalright TF8", spec: "14 w/mK" },
			{ name: "Arctic MX4", spec: "8 w/mK" },
		],
	},
	{
		icon: <Layers className="w-5 h-5" />,
		category: "Pads Térmicos",
		items: [
			{ name: "Thermalright Extreme Odyssey II", spec: "15 w/mK" },
		],
	},
	{
		icon: <Droplets className="w-5 h-5" />,
		category: "Lavado",
		items: [
			{ name: "Vistony Limpiador de Contactos", spec: null },
		],
	},
	{
		icon: <FlaskConical className="w-5 h-5" />,
		category: "Descontaminado",
		items: [
			{ name: "Mechanic 950 Cleaning Agent", spec: null },
			{ name: "Arctic MX Cleaner", spec: null },
		],
	},
	{
		icon: <Wind className="w-5 h-5" />,
		category: "Encerado",
		items: [
			{ name: "QuickFix B4 Premium Matte", spec: null },
		],
	},
];

const ProcessSection = () => {
	return (
		<section id="proceso" className="py-20 bg-dark-section">
			<div className="container mx-auto px-6">

				{/* ── Steps ── */}
				<div className="text-center mb-16">
					<span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
						Nuestro Proceso
					</span>
					<h2 className="text-3xl md:text-4xl font-heading font-bold mt-3">
						Diferenciadores Técnicos
					</h2>
					<p className="mt-4 text-surface-dark-foreground/60 max-w-lg mx-auto">
						Cada equipo pasa por nuestro proceso completo de 4 pasos para un resultado impecable.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, i) => (
						<div key={step.title} className="text-center group">
							<div className="relative mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
								{step.icon}
								<span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-heading font-bold flex items-center justify-center">
									{i + 1}
								</span>
							</div>
							<h3 className="font-heading font-semibold text-lg mb-2">
								{step.title}
							</h3>
							<p className="text-sm text-surface-dark-foreground/60 leading-relaxed">
								{step.desc}
							</p>
						</div>
					))}
				</div>

				{/* ── Materials ── */}
				<div className="mt-24">

					{/* Section header */}
					<div className="flex items-center gap-6 mb-10">
						<div className="flex-1 h-px bg-white/8" />
						<div className="text-center">
							<span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
								Materiales
							</span>
							<h3 className="text-2xl md:text-3xl font-heading font-bold mt-1">
								Solo usamos lo mejor
							</h3>
						</div>
						<div className="flex-1 h-px bg-white/8" />
					</div>

					{/* Materials grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
						{materials.map((mat) => (
							<div
								key={mat.category}
								className="group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-primary/30 rounded-xl p-4 transition-all duration-300"
							>
								{/* Icon */}
								<div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary mb-3 transition-colors duration-300">
									{mat.icon}
								</div>

								{/* Category */}
								<p
									className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-2"
									style={{ fontFamily: "'Inter', sans-serif" }}
								>
									{mat.category}
								</p>

								{/* Items */}
								<div className="space-y-1.5">
									{mat.items.map((item) => (
										<div key={item.name}>
											<p
												className="text-xs text-white/75 font-medium leading-tight"
												style={{ fontFamily: "'Inter', sans-serif" }}
											>
												{item.name}
											</p>
											{item.spec && (
												<p
													className="text-[10px] text-orange-500/80 font-bold mt-0.5"
													style={{ fontFamily: "'Inter', sans-serif" }}
												>
													{item.spec}
												</p>
											)}
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					{/* Bottom note */}
					<p
						className="text-center text-sm text-surface-dark-foreground/60 mt-6 tracking-wide max-w-lg mx-auto"
						style={{ fontFamily: "'Inter', sans-serif" }}
					>
						Todos los materiales son de grado profesional y seleccionados por su rendimiento térmico superior.
					</p>
				</div>

			</div>
		</section>
	);
};

export default ProcessSection;
