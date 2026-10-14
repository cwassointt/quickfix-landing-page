const NotFound = () => (
  <main className="grid min-h-[100svh] place-items-center bg-[#050505] px-5 text-center">
    <div>
      <h1 className="text-6xl font-bold tracking-[-0.04em] text-white md:text-8xl">404</h1>
      <p className="mt-4 text-xl text-white/80">Esta página no existe.</p>
      <a href="/" className="mt-8 inline-flex rounded-full bg-primary px-8 py-4 text-lg font-medium text-black">
        Volver al inicio
      </a>
    </div>
  </main>
);

export default NotFound;
