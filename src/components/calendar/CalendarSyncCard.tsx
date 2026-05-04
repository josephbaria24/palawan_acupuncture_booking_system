"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Smartphone, 
  Globe, 
  Check, 
  ArrowRight, 
  Plus, 
  Info,
  CalendarDays,
  CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

interface CalendarSyncCardProps {
  email: string;
  referenceCode?: string;
  isConfirmed: boolean;
}

export function CalendarSyncCard({ email, referenceCode, isConfirmed }: CalendarSyncCardProps) {
  const [activeTab, setActiveTab] = useState<"google" | "apple">("google");
  const [isSyncing, setIsSyncing] = useState(false);

  const feedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar?email=${encodeURIComponent(email)}`;
  const appleCalendarUrl = feedUrl.replace("https://", "webcal://").replace("http://", "webcal://");

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      // In a real app, we would use Supabase OAuth with specific scopes
      // For now, we provide the "Instant Add" and inform about "Auto-Sync"
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.events',
          redirectTo: `${window.location.origin}/track/${referenceCode}?sync=google`
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      toast.error("Failed to connect Google Calendar: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Calendar URL copied! You can add this as a 'New Calendar from URL' in Google or Outlook.");
  };

  if (!isConfirmed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-50 pointer-events-none" />
      
      <div className="glass-card rounded-[2.5rem] border border-primary/20 p-8 md:p-10 shadow-xl shadow-primary/5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h3 className="text-2xl font-display font-black tracking-tight">Sync your Calendar</h3>
            <p className="text-muted-foreground text-sm font-medium">Never miss your healing session. Auto-sync to your favorite device.</p>
          </div>
          
          <div className="flex bg-secondary/30 p-1 rounded-2xl w-fit border border-secondary/40">
            <button
              onClick={() => setActiveTab("google")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "google" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setActiveTab("apple")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "apple" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              iOS / Apple
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "google" ? (
            <motion.div
              key="google"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-white/40 border border-white/60 rounded-3xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center shrink-0 border border-[#4285F4]/20 shadow-sm">
                    <Globe size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base">Google Calendar Integration</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Connect your Google account to automatically add all confirmed and future acupuncture sessions to your calendar.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={handleGoogleSync}
                    disabled={isSyncing}
                    className="h-12 rounded-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold gap-2 shadow-lg shadow-[#4285F4]/20"
                  >
                    {isSyncing ? "Connecting..." : "Connect Google Account"}
                    <Plus size={18} />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => copyToClipboard(feedUrl)}
                    className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 font-bold gap-2"
                  >
                    Copy Sync URL
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-100 text-[10px] font-bold text-amber-800">
                <Info size={14} className="shrink-0" />
                <span>Tip: Copying the Sync URL allows you to add this as a 'Subscription' which updates automatically.</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="apple"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/40 border border-white/60 rounded-3xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Smartphone size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base">Apple / iOS Calendar Sync</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Subscribe to your acupuncture appointments on your iPhone, iPad, or Mac. New sessions will appear automatically.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    asChild
                    className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg shadow-black/10"
                  >
                    <a href={appleCalendarUrl}>
                      Subscribe on Device
                      <CalendarDays size={18} />
                    </a>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => copyToClipboard(feedUrl)}
                    className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 font-bold gap-2"
                  >
                    Copy Feed Link
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-[10px] font-bold text-blue-800">
                <Check size={14} className="shrink-0" />
                <span>One-time setup: Subscribing keeps your calendar in sync with all future bookings.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
