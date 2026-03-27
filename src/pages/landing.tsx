import { PublicLayout } from "@/components/layout/public-layout";
import { Link } from "wouter";
import { ArrowRight, Leaf, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    title: "Relief from Nausea & Vomiting",
    description: "Acupuncture effectively reduces side effects from treatments, significantly improving quality of life.",
    image: "stress-relief.png",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Alleviation of Pain & Neuropathy",
    description: "Experience relief from chronic pain and manage neuropathy symptoms through targeted traditional techniques.",
    image: "man.png",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Improvement of Digestion",
    description: "Enhance your digestive health and relieve treatment-related issues with holistic abdominal care.",
    image: "stomach.png",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Enhanced Emotional Well-Being",
    description: "Promote deep relaxation, reduce anxiety, and improve your overall mood for better emotional balance.",
    image: "mental-health.png",
    color: "bg-rose-500/10 text-rose-600",
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-secondary/30 to-background/50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                Traditional Healing in Palawan
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 text-balance">
                Restore balance to your <span className="text-secondary">body & mind.</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 lg:mb-10 max-w-2xl mx-auto lg:mx-0">
                Experience traditional healing combined with modern convenience. Book your session effortlessly and start your journey to better health today.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/book" className="px-6 py-3.5 lg:px-8 lg:py-4 rounded-2xl bg-primary text-white font-semibold text-base lg:text-lg hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                  Book Appointment <ArrowRight size={18} />
                </Link>
                <Link href="/admin" className="px-6 py-3.5 lg:px-8 lg:py-4 rounded-2xl bg-card text-foreground font-semibold text-base lg:text-lg border-2 border-border hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 flex items-center justify-center">
                  Staff Portal
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/50 relative group">
              <img
                src={`${import.meta.env.BASE_URL}images/hero.jpg `}
                alt="Palawan Acupuncture Healing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Premium Floating Card 1: Certified */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 z-20 bg-white/80 backdrop-blur-xl p-3.5 md:p-5 rounded-2xl md:rounded-3xl border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-3 md:gap-4 group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 overflow-hidden p-1.5">
                <img
                  src={`${import.meta.env.BASE_URL}images/badge.png`}
                  alt="Certified"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-[10px] md:text-xs tracking-wider uppercase">Certified</p>
                <p className="text-[9px] md:text-xs text-muted-foreground font-medium">Licensed Practitioners</p>
              </div>
            </motion.div>

            {/* Premium Floating Card 2: Rating */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -top-6 -right-6 md:-top-10 md:-right-10 z-20 bg-white/80 backdrop-blur-xl p-3.5 md:p-5 rounded-2xl md:rounded-3xl border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-3 md:gap-4 group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Star size={20} className="md:size-6" fill="currentColor" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-[10px] md:text-xs tracking-wider uppercase">4.9/5 Rating</p>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={8} className="text-amber-500 fill-current md:size-2" />
                  ))}
                  <span className="text-[8px] md:text-[10px] text-muted-foreground font-medium ml-1">(500+ Patients)</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-6 origin-right transform translate-y-32" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 lg:mb-6">
                Therapeutic <span className="text-primary border-b-4 border-primary/20">Benefits</span>
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground">
                Our treatments are designed to address both specific symptoms and overall constitutional health, providing comprehensive care for your journey to wellness.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group relative p-6 lg:p-8 rounded-[2rem] bg-background border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col"
              >
                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-2`}>
                  <img
                    src={`${import.meta.env.BASE_URL}images/${benefit.image}`}
                    alt={benefit.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-3 lg:mb-4 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed flex-grow text-sm lg:text-base">
                  {benefit.description}
                </p>

                <div className="mt-8 pt-6 border-t border-border flex items-center text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight size={16} className="ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Re-using Features as Why Choose Us */}
      <section className="py-16 lg:py-24 bg-card border-y border-border relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Why choose Palawan Acupuncture?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 lg:p-8 rounded-3xl bg-background border border-border hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-6">
                <Leaf size={24} className="lg:size-7" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-3">Holistic Approach</h3>
              <p className="text-sm lg:text-base text-muted-foreground">We treat the root cause, not just the symptoms, ensuring long-lasting relief and wellness.</p>
            </div>

            <div className="p-6 lg:p-8 rounded-3xl bg-background border border-border hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-6">
                <Clock size={24} className="lg:size-7" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-3">Smart Queue System</h3>
              <p className="text-sm lg:text-base text-muted-foreground">Fully booked? Join our digital waitlist and get notified instantly if a slot opens up.</p>
            </div>

            <div className="p-6 lg:p-8 rounded-3xl bg-background border border-border hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-6 overflow-hidden p-2">
                <img
                  src={`${import.meta.env.BASE_URL}images/calendar.png`}
                  alt="Easy Check-in"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-3">Easy Check-in</h3>
              <p className="text-sm lg:text-base text-muted-foreground">Use our QR code system to quickly view schedule details and secure your spot on-site.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
