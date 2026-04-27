"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Instagram, Facebook, Phone, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import CardNav, { CardNavItem } from "@/components/ui/card-nav";
import Link from "next/link";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const lastScrollY = useRef(0);

  const items = useMemo<CardNavItem[]>(
    () => [
      {
        label: "About Us",
        bgColor: "#613e2e", // Primary brown
        textColor: "#ffffff",
        links: [
          { label: "Our Benefits", href: "/#benefits", ariaLabel: "View Benefits" },
          { label: "Why Choose Us", href: "/#why", ariaLabel: "Why Choose Us" },
          { label: "Articles", href: "/articles", ariaLabel: "Acupuncture articles" },
        ],
      },
      {
        label: "Patients",
        bgColor: "#ba9670", // Secondary tan
        textColor: "#ffffff",
        links: [
          { label: "Book Appointment", href: "/book", ariaLabel: "Book Now" },
          { label: "Track Status", href: "/track", ariaLabel: "Track Appointment" },
        ],
      },
      {
        label: "Connect",
        bgColor: "#f3f4f6", // Light gray
        textColor: "#1f2937", // Dark gray
        links: [
          { label: "Facebook", href: "https://facebook.com/palawanacupuncture", ariaLabel: "Facebook" },
          { label: "Instagram", href: "https://instagram.com/palawanacupuncture", ariaLabel: "Instagram" },
          { label: "Staff Portal", href: "/admin", ariaLabel: "Admin Login" },
        ],
      },
    ],
    [],
  );

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
          "fixed top-0 inset-x-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isNavVisible ? "translate-y-0" : "-translate-y-32",
        ].join(" ")}
      >
        <CardNav
            logo="/images/logo.png"
            logoAlt="Palawan Acupuncture Logo"
            items={items}
            baseColor="rgba(255, 255, 255, 0.95)"
            menuColor="#1f2937"
            buttonBgColor="#613e2e"
            buttonTextColor="#ffffff"
            onCtaClick={() => router.push("/book")}
            className="backdrop-blur-xl shadow-2xl"
        />
      </header>

      <main className="flex-1 pt-24">
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
