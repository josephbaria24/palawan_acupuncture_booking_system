import { ReactNode } from "react";
import { Link } from "wouter";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl font-display font-bold text-foreground group">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src="/images/logo.png" alt="Palawan Acupuncture Logo" className="w-full h-full object-contain" />
            </div>
            Palawan <span className="text-primary font-light text-sm md:text-2xl">Acupuncture</span>
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/admin" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
              Staff Login
            </Link>
            <Link href="/book" className="px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-foreground text-background text-xs md:text-base font-medium hover:bg-primary hover:text-white transition-colors shadow-lg shadow-black/5 hover:shadow-primary/20">
              Book Session
            </Link>
          </div>
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

      <footer className="bg-muted py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <p className="text-muted-foreground text-center">© {new Date().getFullYear()} Palawan Acupuncture Clinic. All rights reserved.</p>

          <div className="flex items-center justify-center gap-1 py-2 px-4 rounded-xl text-xs font-semibold">
            <span className="text-muted-foreground">Developed by</span>
            <span className="text-slate-700">PetroCore</span>
            <span className="text-red-600 font-black">X</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
