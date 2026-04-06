"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function TrackPage() {
  const [refCode, setRefCode] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (refCode.trim().length >= 6) {
      router.push(`/track/${refCode.trim().toUpperCase()}`);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <div className="w-full max-w-xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
              <Search size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground">
                Track your session
              </h1>
              <p className="text-muted-foreground text-lg">
                Enter your booking reference code (e.g. PA-XXXXXX) to view your status.
              </p>
            </div>

            <form onSubmit={handleSearch} className="mt-10 relative">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <ShieldCheck className="text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={24} />
                </div>
                <Input
                  type="text"
                  placeholder="PA-XXXXXX"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  className="h-16 pl-14 pr-32 rounded-2xl text-xl font-bold tracking-widest bg-white/60 backdrop-blur-xl border-border/50 focus-visible:ring-primary/20 shadow-xl shadow-black/[0.02]"
                />
                <Button 
                  type="submit"
                  disabled={refCode.trim().length < 6}
                  className="absolute right-2 top-2 h-12 px-6 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  Track <ArrowRight size={16} />
                </Button>
              </div>
            </form>

            <div className="pt-8 flex items-center justify-center gap-8 border-t border-border/20 mt-12">
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Check Status</p>
                <p className="text-xs font-semibold">Real-time updates</p>
              </div>
              <div className="w-px h-8 bg-border/40" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Manage</p>
                <p className="text-xs font-semibold">Cancel or reschedule</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
