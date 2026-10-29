/** Foto de perfil de quien dejó la reseña; mientras no haya foto, sus iniciales. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const ReviewAvatar = ({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) =>
  photo ? (
    <img src={photo} alt="" width={size} height={size} loading="lazy" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-white/[0.1] text-sm font-medium text-white/80"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );

export default ReviewAvatar;
