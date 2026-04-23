"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Smartphone, 
  Globe, 
  Check, 
  Plus, 
  Info,
  CalendarDays,
  Copy,
  ExternalLink,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useCalendarSettings } from "@/hooks/use-acupuncture";

export function AdminCalendarSyncDialog() {
  const [activeTab, setActiveTab] = useState<"google" | "apple">("google");
  const { data: settings, isLoading: isSettingsLoading } = useCalendarSettings();
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const feedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar?admin=true`;
  const appleCalendarUrl = feedUrl.replace("https://", "webcal://").replace("http://", "webcal://");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Clinic Calendar URL copied!");
  };

  const handleRealTimeConnect = () => {
    window.location.href = "/api/auth/google/login";
  };

  const handleGoogleConnect = () => {
    // Generate a clean webcal URL with a cache-buster timestamp
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const timestamp = new Date().getTime();
    const cleanUrl = `${baseUrl}/api/calendar?admin=true&t=${timestamp}`.replace(/^https?:\/\//, "webcal://");
    
    // We only encode once. Google Calendar's render engine will handle the rest.
    const googleAddUrl = `https://www.google.com/calendar/render?cid=${encodeURIComponent(cleanUrl)}`;
    window.open(googleAddUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-border/60 hover:bg-secondary/40 font-bold px-6 gap-2">
          <Calendar size={18} className="text-primary" />
          Calendar Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[1.5rem] sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-5 sm:p-10">
          <DialogHeader className="mb-6 sm:mb-8">
            <DialogTitle className="text-xl sm:text-2xl font-display font-black tracking-tight">Clinic Schedule Sync</DialogTitle>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">Sync all clinic sessions to your personal or staff calendar.</p>
          </DialogHeader>

          <div className="flex bg-secondary/30 p-1 rounded-2xl w-full border border-secondary/40 mb-6 sm:mb-8">
            <button
              onClick={() => setActiveTab("google")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "google" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Google Calendar
            </button>
            <button
              onClick={() => setActiveTab("apple")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "apple" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Apple / iOS
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "google" ? (
              <motion.div
                key="google"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center shrink-0 border border-[#4285F4]/20 shadow-sm">
                      <svg viewBox="0 0 24 24" className="size-6 fill-current">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm sm:text-base">Direct Account Sync</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-medium">
                        Automatically push clinic schedules to your primary Google Calendar in real-time.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {settings?.google_refresh_token ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Sync Active</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Instantly pushing all slots</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          onClick={handleRealTimeConnect}
                        >
                          Reconnect
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleRealTimeConnect}
                        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20"
                      >
                        <ExternalLink size={18} />
                        Connect Real-Time Sync
                      </Button>
                    )}

                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">or use read-only feed</span>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={handleGoogleConnect}
                        className="h-12 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold gap-2 shadow-md flex-1"
                      >
                        <svg viewBox="0 0 24 24" className="size-4">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>

                      <Button 
                        asChild
                        variant="outline"
                        className="h-12 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold gap-2 flex-1"
                      >
                        <a href={feedUrl} download="clinic-schedule.ics">
                          <Download size={16} />
                          Download
                        </a>
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">or use manual URL</span>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 p-2.5 rounded-xl bg-secondary/20 border border-border/40 text-[9px] font-mono truncate text-muted-foreground flex items-center">
                        {feedUrl}
                      </div>
                      <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(feedUrl)}
                        className="rounded-xl border border-border/40 hover:bg-secondary/20 shrink-0"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {isLocalhost && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-3 rounded-xl bg-red-50 border border-red-100 text-[10px] text-red-700 font-medium leading-relaxed"
                      >
                        <p className="font-bold mb-1 flex items-center gap-1.5 text-red-800 uppercase tracking-wider">
                          <Info size={14} /> Connection Blocked
                        </p>
                        Google Calendar cannot see your "localhost". This button will work once you **Deploy** your site. For now, use the **Download** button to import your schedule.
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3 px-4 py-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-[11px] font-medium text-amber-800 leading-relaxed">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Local Testing Note:</p>
                    <p>Google Calendar cannot see "localhost". Use **Download** to import the file manually, or use a tool like Ngrok to provide a public URL.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="apple"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-base">Apple / iOS Calendar</p>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        Instantly subscribe to the clinic schedule on your iPhone, iPad, or Mac. Stay updated on the go.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    asChild
                    className="w-full h-11 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg shadow-black/10"
                  >
                    <a href={appleCalendarUrl}>
                      <ExternalLink size={18} />
                      Open in Calendar App
                    </a>
                  </Button>
                </div>

                <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-[11px] font-medium text-blue-800">
                  <Check size={16} className="shrink-0" />
                  <span>One-tap setup: Keeps your native calendar in sync with the clinic.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
