"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || "Invalid credentials. Please try again.");
      } else {
        toast.success("Welcome back, Administrator");
        router.push("/admin");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4 font-display">
      <Link href="/" className="mb-6 group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden bg-background">
          <div className="h-2 bg-primary" />
          <CardHeader className="pt-10 pb-6 px-10 text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl mx-auto flex items-center justify-center text-primary mb-5 border border-primary/10">
              <ShieldCheck size={32} />
            </div>
            <CardTitle className="text-2xl font-black text-foreground tracking-tight">Staff Portal</CardTitle>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Access the clinical management dashboard.</p>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="admin@palawanacupuncture.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 rounded-xl bg-muted/30 border-transparent focus:bg-background focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-4 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Access Dashboard"}
                <ChevronRight size={18} />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Powered by</p>
              <div className="flex items-center justify-center gap-0 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100">
                <span className="text-slate-900 font-bold text-xs">PetroCore</span>
                <span className="text-red-600 font-black text-xs">X</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
