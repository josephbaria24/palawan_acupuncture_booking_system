"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Menu, X, Instagram, Facebook, Phone, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { label: string; href: string };

const normalizePath = (p: string) => p.replace(/\/+$/, "") || "/";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const lastScrollY = useRef(0);

  const items = useMemo<NavItem[]>(
    () => [
      { label: "Home", href: "/" },
      { label: "Benefits", href: "/#benefits" },
      { label: "Why us", href: "/#why" },
      { label: "Track", href: "/track" },
    ],
    [],
  );

  const activePath = normalizePath(pathname);

  const onNavClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href.startsWith("/#")) return;

      const hash = href.split("#")[1];
      if (!hash) return;

      e.preventDefault();
      setIsOpen(false);

      if (normalizePath(pathname) !== "/") {
        router.push(href);
        return;
      }

      window.history.pushState(null, "", href);

      const el = document.getElementById(hash);
      if (!el) return;

      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      if (y < 24) {
        setIsNavVisible(true);
        lastScrollY.current = y;
        return;
      }

      if (y > lastScrollY.current + 4) {
        setIsNavVisible(false);
        setIsOpen(false);
      } else if (y < lastScrollY.current - 4) {
        setIsNavVisible(true);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className={[
          "sticky top-3 z-50 transition-transform duration-300 ease-out",
          isNavVisible ? "translate-y-0" : "-translate-y-28",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 md:h-[76px] rounded-2xl md:rounded-3xl glass-card bg-white/60 border-white/60 shadow-[0_18px_50px_-22px_rgba(97,63,46,0.35)]">
            <div className="h-full px-3 md:px-5 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 md:gap-3 select-none group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl overflow-hidden bg-white/40 border border-white/50 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform">
                  <img
                    src="/images/logo.png"
                    alt="Palawan Acupuncture"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-sm md:text-base font-display font-extrabold tracking-tight text-foreground">
                    Palawan{" "}
                    <span className="text-primary font-semibold">Acupuncture</span>
                  </div>
                  <div className="hidden md:block text-[11px] text-muted-foreground font-medium">
                    Holistic healing, modern booking
                  </div>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {items.map((item) => {
                  const isActive =
                    normalizePath(item.href.split("#")[0] ?? "/") === activePath;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick(item.href)}
                      className={[
                        "px-3 py-2 rounded-xl text-sm font-display font-semibold tracking-tight transition-colors",
                        "hover:bg-white/50 hover:text-foreground",
                        isActive
                          ? "bg-white/55 text-foreground"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/45 transition-colors"
                >
                  Login
                </Link>

                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-primary text-white text-xs md:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Book Now <ArrowRight className="size-4" />
                </Link>

                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center size-10 rounded-xl bg-white/45 border border-white/50 text-foreground hover:bg-white/60 transition-colors"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                  onClick={() => setIsOpen((v) => !v)}
                >
                  {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
              </div>
            </div>
          </div>

          {isOpen ? (
            <div className="md:hidden mt-3 rounded-2xl glass-card bg-white/65 border-white/60 overflow-hidden">
              <div className="p-2">
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      onNavClick(item.href)(e);
                      if (!item.href.startsWith("/#")) setIsOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-display font-semibold tracking-tight text-foreground hover:bg-white/50 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </a>
                ))}

                <div className="mt-2 pt-2 border-t border-white/40">
                  <Link
                    href="/admin"
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Staff login</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-card py-16 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Branding & Contact */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                  <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="font-display font-black text-xl tracking-tight">
                  Palawan<span className="text-primary"> Acupuncture</span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Traditional acupuncture healing in the heart of Palawan. Where ancient wisdom meets modern healing.
              </p>
              <div className="flex flex-col gap-3">
                <a href="tel:09524406339" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={14} />
                  </div>
                  0952 440 6339
                </a>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Clock size={14} className="text-primary" />
                Opening Hours
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-foreground">Wednesday to Sunday</span>
                  <span className="text-sm text-muted-foreground font-medium">9:00 AM — 7:00 PM</span>
                </div>
                <div className="pt-2">
                  <span className="inline-flex py-1 px-3 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                    Closed Mon & Tue
                  </span>
                </div>
              </div>
            </div>

            {/* Social & Connect */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Connect With Us</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/palawanacupuncture"
                  target="_blank"
                  className="size-11 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://www.instagram.com/palawanacupuncture?fbclid=IwY2xjawRAMVVleHRuA2FlbQIxMABicmlkETFHcEk2WE5NMXNVa0phVXloc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHuKguucX2ihEu-iva19qXdBPbr_UkHLEwjs6nrcpyjA-xHwLzcWWf7JgdKZA_aem_OETPd7UOEwy005wDxBv-nQ"
                  target="_blank"
                  className="size-11 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Follow us for health tips and clinic updates.
              </p>
            </div>

            {/* Location */}
            <div className="space-y-6 text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                Located At
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bgy. Tagburos, Puerto Princesa City,<br />
                Palawan, Philippines, 5300
              </p>
            </div>
          </div>

          <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            <p className="text-[11px] text-muted-foreground font-medium tracking-tight">
              © {new Date().getFullYear()} Palawan Acupuncture Clinic. All rights reserved. PITAHC Certified Practitioner.
            </p>

            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/40 py-2 px-4 rounded-2xl border border-white/60 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Developed by</span>
              <div className="flex items-center gap-1 group">
                <span className="text-xs font-black text-slate-800  transition-colors group-hover:text-primary">PetroCore</span>
                <span className="text-xs font-black text-red-600 transition-transform group-hover:scale-125">X</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
