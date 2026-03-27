import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { RiLockLine, RiMailLine, RiEyeLine, RiEyeOffLine, RiArrowLeftLine } from "@remixicon/react";
import { Link } from "wouter";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "Redirecting to dashboard...",
      });
      setLocation("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-secondary/20 flex items-center justify-center p-4 font-display antialiased">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <RiArrowLeftLine size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/5 p-10 relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[4rem]" />

          {/* Logo & Header */}
          <div className="text-center mb-10 relative">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border-2 border-white"
            >
              <img src="/images/logo.png" alt="Palawan Acupuncture" className="w-full h-full object-contain bg-card p-2" />
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Staff Portal
            </h1>
            <p className="text-sm text-muted-foreground font-medium mt-2">
              Sign in to manage your clinic
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Email Address
              </label>
              <div className="relative">
                <RiMailLine size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@palawanacupuncture.com"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-sm placeholder:text-muted-foreground/40"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Password
              </label>
              <div className="relative">
                <RiLockLine size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-14 py-4 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-sm placeholder:text-muted-foreground/40"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors p-1"
                >
                  {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4.5 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <RiLockLine size={18} />
                  Sign In to Dashboard
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Palawan Acupuncture &bull; Staff Only
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/50">
            Developed by <span className="text-foreground/50 tracking-tight">PetroCore</span><span className="text-red-500 font-black">X</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
