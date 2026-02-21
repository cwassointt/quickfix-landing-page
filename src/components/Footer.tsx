const Footer = () => {
  return (
    <footer className="bg-dark-section border-t border-surface-dark-foreground/10 py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-heading font-bold text-lg">
          Quick<span className="text-primary">Fix</span>
        </p>
        <p className="text-sm text-surface-dark-foreground/50">
          © {new Date().getFullYear()} QuickFix. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
