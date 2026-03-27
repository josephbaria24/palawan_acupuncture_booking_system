import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CalendarDays,
  UserPlus,
  Settings,
  LogOut,
  Activity,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const PetroCoreXBranding = () => (
  <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[10px] font-bold shadow-2xl">
    <span className="text-slate-400">Developed by</span>
    <span className="text-slate-900 tracking-tight">PetroCore</span>
    <span className="text-red-600 font-black">X</span>
  </div>
);

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/schedules", label: "Schedules", icon: CalendarDays },
    { href: "/admin/assign", label: "Assign Client", icon: UserPlus },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-muted/30 flex relative font-display antialiased text-foreground">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transform transition-transform duration-500 ease-in-out
        md:relative md:translate-x-0 md:w-64
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-display font-bold text-foreground group">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src="/images/logo.png" alt="Palawan Acupuncture Logo" className="w-full h-full object-contain" />
            </div>
            Palawan<span className="text-primary">.</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-muted-foreground hover:bg-secondary rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <item.icon size={18} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 space-y-4 border-t border-border">
          {user && (
            <div className="px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Signed in as</p>
              <p className="text-xs font-bold text-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          <div className="pt-2">
            <PetroCoreXBranding />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none group"
            >
              <motion.span
                animate={isSidebarOpen ? { rotate: 45, y: 7, x: 2 } : { rotate: 0, y: 0, x: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-foreground rounded-full"
              />
              <motion.span
                animate={isSidebarOpen ? { opacity: 0, x: 10, scale: 0 } : { opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="w-6 h-0.5 bg-foreground rounded-full"
              />
              <motion.span
                animate={isSidebarOpen ? { rotate: -45, y: -7, x: 2 } : { rotate: 0, y: 0, x: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-foreground rounded-full"
              />
              {/* Wind bits */}
              {!isSidebarOpen && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    animate={{ x: [-20, 40], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                    className="absolute top-1/2 left-0 w-4 h-[1px] bg-primary/30"
                  />
                </div>
              )}
            </button>
            <Link href="/admin" className="font-display font-bold flex items-center gap-2 text-lg">
              Palawan<span className="text-primary">.</span>
            </Link>
          </div>

          <div className="flex gap-1">
            <Link href="/admin/schedules" className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
              <CalendarDays size={18} />
            </Link>
            <Link href="/admin/assign" className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
              <UserPlus size={18} />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
