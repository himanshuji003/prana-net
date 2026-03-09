import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedCTA } from "./AnimatedCTA";
import { cn } from "@/lib/utils";

export const GlassNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "/#system-flow" },
    { name: "Super Tree",   href: "/#super-tree" },
    { name: "Dashboards",   href: "/#dashboards" },
    { name: "Impact",       href: "/#impact" },
  ];

  const portalLinks = [
    { name: "Citizen",  path: "/citizen",  accent: "#3DBFAD" },
    { name: "Official", path: "/official", accent: "#D4A84B" },
    { name: "Officer",  path: "/officer",  accent: "#4CAF72" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any }}
      className={cn(
        "fixed top-0 z-50 w-full h-[72px] flex items-center justify-between px-8 md:px-12 transition-all duration-300",
        scrolled
          ? "bg-forest-primary/90 backdrop-blur-xl border-b border-border-forest"
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-1 group shrink-0">
        <span className="font-display text-[22px] italic text-cream group-hover:text-lime transition-colors duration-200">PRANA</span>
        <span className="h-1.5 w-1.5 rounded-full bg-lime mx-0.5 mt-1 group-hover:scale-125 transition-transform" />
        <span className="font-display text-[22px] italic text-cream group-hover:text-lime transition-colors duration-200">NET</span>
      </Link>

      {/* Center nav — only on landing */}
      {isLanding && (
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href}
              className="font-sans text-sm font-medium text-muted transition-colors hover:text-cream relative group">
              {link.name}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-lime group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </div>
      )}

      {/* Right side — portals or back */}
      <div className="flex items-center gap-3 shrink-0">
        {isLanding ? (
          <>
            <div className="hidden md:flex items-center gap-2">
              {portalLinks.map((p) => (
                <Link key={p.path} to={p.path}>
                  <button className="h-8 px-4 font-sans text-xs font-semibold uppercase tracking-[0.1em] border border-border-forest-light text-muted hover:border-cream hover:text-cream transition-all duration-150 rounded-sm">
                    {p.name}
                  </button>
                </Link>
              ))}
            </div>
            <Link to="/citizen">
              <AnimatedCTA variant="primary" size="sm">Enter Platform →</AnimatedCTA>
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {/* Breadcrumb — current portal label */}
            <div className="hidden sm:flex items-center gap-2 font-sans text-xs text-muted uppercase tracking-wider">
              <div className="h-px w-5 bg-border-forest-light" />
              {location.pathname.startsWith("/citizen") ? "Citizen Portal" : location.pathname.startsWith("/official") ? "Official Command" : "Field Officer"}
            </div>
            <Link to="/">
              <button className="h-8 px-4 font-sans text-xs font-semibold uppercase tracking-[0.1em] border border-border-forest-light text-muted hover:border-cream hover:text-cream transition-all duration-150 rounded-sm">
                ← Home
              </button>
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};
