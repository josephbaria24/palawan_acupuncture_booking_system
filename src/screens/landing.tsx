"use client";

import React from "react";
import Image from "next/image";
import { PublicLayout } from "@/components/layout/public-layout";
import Link from "next/link";
import { ArrowRight, Leaf, Clock, Star } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CardSwap, { Card } from "@/components/ui/card-swap";

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
  const [isMobile, setIsMobile] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.28]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const hash = window.location.hash?.replace(/^#/, "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    return () => window.removeEventListener('resize', handleResize);
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
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{ scale: heroImageScale }}
            >
              <Image
                src="/images/hero.jpg"
                alt="Palawan Acupuncture Healing"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 95vw, 1400px"
                priority
              />
            </motion.div>
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
                    <Link
                      href="/articles"
                      className="px-6 py-3.5 lg:px-8 lg:py-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 text-white font-semibold text-base lg:text-lg hover:bg-white/25 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Read articles
                    </Link>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center py-2 px-4 rounded-full bg-white/15 backdrop-blur-xl text-white/90 font-semibold text-xs border border-white/20 shadow-sm">
                      Same-day booking available
                    </span>
                    <span className="inline-flex items-center py-2 px-4 rounded-full bg-white/15 backdrop-blur-xl text-white/90 font-semibold text-xs border border-white/20 shadow-sm">
                      PITAHC Certified Practitioner
                    </span>
                  </div>
                </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Content */}
            <div className="text-center lg:text-left max-w-2xl lg:max-w-xl mx-auto lg:mx-0">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-[1.1]"
              >
                Begin Your Journey to Better Health
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed"
              >
                Your treatment is designed to improve how you feel today and
                support long-term balance. Experience the healing power of traditional acupuncture.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-10 flex items-center justify-center lg:justify-start gap-4"
              >
                <span className="text-sm font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                  Trusted Care
                </span>
                <span className="text-sm font-medium text-muted-foreground italic">
                  PITAHC Certified
                </span>
              </motion.div>
            </div>

            {/* Right: Interactive Stack */}
            <div className="relative flex justify-center lg:justify-end min-h-[450px] sm:min-h-[500px] lg:min-h-[700px] w-full sm:overflow-visible">
              <div className="relative w-full h-full flex items-center justify-center lg:justify-end lg:pr-12 mt-12 sm:mt-0">
                <CardSwap
                  width={isMobile ? "min(80vw, 290px)" : 420}
                  height={isMobile ? "min(110vw, 420px)" : 580}
                  cardDistance={isMobile ? 25 : 45}
                  verticalDistance={isMobile ? 35 : 55}
                  delay={4500}
                >
                  {benefits.map((benefit, index) => (
                    <Card
                      key={benefit.title}
                      customClass="bg-card border-border shadow-2xl !p-0 overflow-hidden !rounded-[2rem] sm:!rounded-[2.5rem]"
                    >
                      <div className="flex flex-col h-full p-5 sm:p-8">
                        <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-background border border-border/70 mb-4 sm:mb-6 shrink-0 relative">
                          <Image
                            src={`/images/${benefit.image}`}
                            alt={benefit.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 80vw, 420px"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">
                            {benefit.title}
                          </h3>
                          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
                            {benefit.description}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/40 flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary/50">
                            Palawan Acupuncture
                          </span>
                          <div className="size-6 sm:size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Leaf size={12} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </div>
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
              <div className="h-fit rounded-[2rem] overflow-hidden border border-border/70 shadow-2xl shadow-primary/10 relative">
                <Image
                  src="/images/feelsgood.png"
                  alt="Expert acupuncture care"
                  width={960}
                  height={720}
                  className="w-full h-auto block"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
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
                Our PITAHC Certified Practitioner combine traditional techniques with
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
