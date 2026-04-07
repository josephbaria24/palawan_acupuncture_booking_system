import { PublicLayout } from "@/components/layout/public-layout";
import Link from "next/link";
import { ArrowRight, Leaf, Clock, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const benefits = [
  {
    title: "Relief from Nausea & Vomiting",
    description:
      "Acupuncture effectively reduces side effects from treatments, significantly improving quality of life.",
    image: "stress-relief.png",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Alleviation of Pain & Neuropathy",
    description:
      "Experience relief from chronic pain and manage neuropathy symptoms through targeted traditional techniques.",
    image: "man.png",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Improvement of Digestion",
    description:
      "Enhance your digestive health and relieve treatment-related issues with holistic abdominal care.",
    image: "stomach.png",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Enhanced Emotional Well-Being",
    description:
      "Promote deep relaxation, reduce anxiety, and improve your overall mood for better emotional balance.",
    image: "mental-health.png",
    color: "bg-rose-500/10 text-rose-600",
  },
];

export default function LandingScreen() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.28]);

  useEffect(() => {
    const hash = window.location.hash?.replace(/^#/, "");
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-32"
      >
        <div className="w-[95vw] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/50 shadow-2xl shadow-primary/10 bg-background min-h-[500px] lg:min-h-[650px] flex items-center"
          >
            <motion.img
              src="/images/hero.jpg"
              alt="Palawan Acupuncture Healing"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ scale: heroImageScale }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-black/20 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            <div className="relative z-20 p-6 sm:p-10 lg:p-14 pb-32 sm:pb-40 w-full">
              <div className="flex flex-col items-start lg:items-center text-left lg:text-center gap-8">
                <div className="flex flex-col items-start lg:items-center max-w-2xl">
                  <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-white/15 backdrop-blur-xl text-white font-semibold text-sm border border-white/20 shadow-sm mb-5">
                    Traditional Healing in Palawan
                  </span>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.06] text-balance">
                    Restore balance to your{" "}
                    <span className="bg-gradient-to-r from-secondary to-amber-400 bg-clip-text text-transparent">
                      body & mind
                    </span>
                    .
                  </h1>

                  <p className="text-base md:text-lg lg:text-xl text-white/80 mt-5 font-medium tracking-tight">
                    Where ancient wisdom meets modern healing.
                  </p>

                  <div className="mt-8 w-full flex flex-col sm:flex-row gap-3 sm:justify-center">
                    <Link
                      href="/book"
                      className="px-6 py-3.5 lg:px-8 lg:py-4 rounded-2xl bg-primary text-white font-semibold text-base lg:text-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      Book Appointment <ArrowRight size={18} />
                    </Link>
                    {/* <Link
                      href="/admin"
                      className="px-6 py-3.5 lg:px-8 lg:py-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 text-white font-semibold text-base lg:text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                    >
                      Staff Portal
                    </Link> */}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center py-2 px-4 rounded-full bg-white/15 backdrop-blur-xl text-white/90 font-semibold text-xs border border-white/20 shadow-sm">
                      Same-day booking available
                    </span>
                    <span className="inline-flex items-center py-2 px-4 rounded-full bg-white/15 backdrop-blur-xl text-white/90 font-semibold text-xs border border-white/20 shadow-sm">
                      Licensed practitioners
                    </span>
                  </div>
                </div>

                {/* Rating moved to bottom curve */}
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(94%,580px)] bg-background rounded-t-[2.5rem] z-30 px-6 py-4 sm:py-5 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-foreground font-display font-black text-3xl sm:text-4xl leading-none tracking-tighter">
                    4.9
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-amber-400 fill-current"
                        />
                      ))}
                    </div>
                    <div className="text-[12px] text-muted-foreground font-bold mt-1 tracking-tight">
                      500+ patients (approx.)
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end border-l border-border/50 pl-6">
                  <div className="text-foreground text-xs font-bold uppercase tracking-wider">
                    Trusted care
                  </div>
                  <div className="text-muted-foreground text-[11px] font-medium mt-0.5">
                    Book in minutes, track anytime
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-16 lg:py-24 relative overflow-hidden scroll-mt-28"
      >
        <div className="absolute inset-0 bg-primary/5 -skew-y-6 origin-right transform translate-y-32" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-18">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4"
            >
              Begin Your Journey to Better Health
            </motion.h2>
            <p className="text-base lg:text-lg text-muted-foreground">
              Your treatment is designed to improve how you feel today and
              support long-term balance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group relative bg-card border border-border rounded-[1.75rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="p-5">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-background border border-border/70">
                    <img
                      src={`/images/${benefit.image}`}
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="mt-5 text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed text-sm lg:text-base">
                    {benefit.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center size-9 rounded-2xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/20">
                      <Leaf className="size-4" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      Acupuncture care
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Re-using Features as Why Choose Us */}
      <section
        id="why"
        className="py-16 lg:py-24 bg-card border-y border-border relative z-20 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
              Empowering Health Through Expert Care
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative h-fit self-center">
              <div className="h-fit rounded-[2rem] overflow-hidden border border-border/70 shadow-2xl shadow-primary/10">
                <img
                  src="/images/feelsgood.png"
                  alt="Expert acupuncture care"
                  className="w-full h-auto block"
                />
              </div>

              <div className="absolute -bottom-8 -right-4 md:-right-10 md:bottom-0 lg:-bottom-6 lg:-right-6">
                <div className="rounded-[1.75rem] overflow-hidden border border-border/70 bg-background shadow-xl shadow-black/10 w-[260px] max-w-[70vw]">
                  <img
                    src={`/images/${benefits[2]?.image ?? "stomach.png"}`}
                    alt="Holistic support"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute -top-5 -left-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 px-4 py-3 shadow-sm hidden sm:block">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Leaf className="size-5" />
                  <span className="text-sm">Root-cause focused</span>
                </div>
              </div>
            </div>

            <div className="max-w-xl mx-auto lg:mx-0">
              <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                While acupuncture can help with symptoms, our goal is deeper:
                address the root cause so you can feel better and stay balanced.
                Our licensed practitioners combine traditional techniques with
                modern booking for a calm, supportive experience.
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-3xl bg-background/70 border border-border p-5">
                  <div className="flex items-center gap-3">
                    <span className="size-11 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary border border-secondary/40">
                      <Leaf className="size-5" />
                    </span>
                    <div>
                      <div className="font-display font-bold text-foreground">
                        Holistic approach
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Long-lasting relief & wellness
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-background/70 border border-border p-5">
                  <div className="flex items-center gap-3">
                    <span className="size-11 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary border border-secondary/40">
                      <Clock className="size-5" />
                    </span>
                    <div>
                      <div className="font-display font-bold text-foreground">
                        Smart queue
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Get notified if a slot opens
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/#benefits"
                  className="px-6 py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  Learn More <ArrowRight size={18} />
                </Link>
                <Link
                  href="/book"
                  className="px-6 py-3.5 rounded-2xl bg-white/50 backdrop-blur-xl border border-border font-semibold text-foreground hover:bg-white/60 transition-colors flex items-center justify-center"
                >
                  Office Hours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

