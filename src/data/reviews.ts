// Reseñas elegidas de Google Maps, acortadas para la web sin cambiar su sentido.

export type Review = { author: string; stars: number; device?: string; text: string };

export const reviews: Review[] = [
  {
    author: "Jak Steve Molina C.",
    stars: 5,
    device: "ASUS ROG",
    text: "Me solucionaron todo el problema en exactamente 1 hora. Lo que más destaco fue su transparencia total: el técnico me grabó videos y me mandó fotos detalladas paso a paso mientras hacía el mantenimiento. Un trabajo impecable, rápido y 100% honesto.",
  },
  {
    author: "James Maysundo",
    stars: 5,
    device: "PC gamer",
    text: "Soy re celoso con mi rig, pero con los años el tiempo ya no me alcanza. Así fue como conocí a Gianluca, y la verdad es que en él confío ciegamente: profesional, detallista, amable y siempre con la mejor actitud.",
  },
  {
    author: "Augusto Marcelino Quispe Aguero",
    stars: 5,
    device: "Lenovo Legion 5 Pro",
    text: "Llevé mi laptop gamer para hacerle mantenimiento de cambio de pasta térmica y thermal pads y la verdad quedé muy contento con el resultado. Me atendieron muy bien, me explicaron todo y el equipo quedó funcionando excelente.",
  },
  {
    author: "Leonardo Pérez",
    stars: 5,
    text: "Atención personalizada impecable, mucha paciencia a la hora de explicar la duda que tengas o el problema que tenga tu equipo. Siempre te recomienda mejoras o cuidados para evitar que te vuelva a pasar.",
  },
  {
    author: "Juan Antonio León",
    stars: 5,
    text: "¡Un tipazo! Excelente servicio; mi laptop quedó como nueva después del mantenimiento con metal líquido. Totalmente recomendado.",
  },
  {
    author: "C.",
    stars: 5,
    device: "ASUS ZenBook Pro Duo",
    text: "Gianluca me visitó en el horario que pactamos y le hizo mantenimiento a mi notebook. Muy buena explicación del proceso y uso de buenos componentes.",
  },
  {
    author: "Bryan Dale",
    stars: 5,
    text: "¡Gran servicio! Muy ordenado, transparente y brinda la información necesaria para que te quedes tranquilo con lo que necesites.",
  },
  {
    author: "Andrés Ángeles",
    stars: 5,
    text: "Un crack Gianluca, servicio rápido y económico. ¡Asesor tecnológico de cabecera!",
  },
];
