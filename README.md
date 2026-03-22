# QuickFix — Premium Hardware Maintenance

**Live:** [https://quickfix.pe/](https://quickfix.pe/)  
**Repository:** [https://github.com/cwassointt/quickfix-landing/tree/develop](https://github.com/cwassointt/quickfix-landing/tree/develop)

---

## Overview

QuickFix is the official web platform for a specialized high-end hardware maintenance center located in San Miguel, Lima. The platform is designed with a minimalist dark-mode aesthetic, reflecting the precision and technical rigor behind our core laboratory processes: Chemical Cleaning, Decontamination, and Liquid Metal application.

---

## Features

- **High-End UI/UX** — Dark Mode interface with Vivid Orange (`#FF6600`) accents, WF Visual Sans typography, and fully responsive layout.
- **Interactive Service Catalog** — Service cards with micro-interactions, hover glow effects, and detail modals for each service.
- **Industrial Supplies Showcase** — Transparent materials section with precise thermal conductivity specs (e.g. UTP-8 Upsiren at 14.8 W/mK, Thermalright Silver King).
- **Conversion-Focused Design** — Floating WhatsApp button for instant appointment scheduling with 24/7 availability.
- **Ambient Animations** — Subtle motion effects that reinforce the high-tech identity of the brand.
- **FAQ Dialog** — Accessible frequently asked questions dialog reachable from the navigation bar.

---

## Tech Stack

| Technology     | Purpose                                          |
|----------------|--------------------------------------------------|
| Vite           | Fast frontend build tool                         |
| TypeScript     | Static typing for maintainable, robust code      |
| React          | Core UI library                                  |
| shadcn/ui      | Accessible and composable UI components          |
| Tailwind CSS   | Utility-first CSS framework for precise styling  |
| Vitest         | Unit testing framework                           |

---

## Getting Started

**Prerequisites:** Node.js and npm must be installed.

```sh
# Clone the repository
git clone https://github.com/cwassointt/quickfix-landing.git

# Navigate into the project
cd quickfix-landing

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`.

---

## Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start local development server     |
| `npm run build`   | Build for production               |
| `npm run test`    | Run unit tests                     |

---

## Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, FAQDialog, etc.)
├── pages/            # Page-level components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── test/             # Test setup and specs
```

---

## Contact

For service inquiries or appointment scheduling, contact us via WhatsApp: [+51 940 755 119](https://wa.me/51940755119)
