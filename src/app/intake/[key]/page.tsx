"use client";

import { useParams, useSearchParams } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { ClientIntakeForms } from "@/components/admin/ClientIntakeForms";
import { motion } from "framer-motion";
import { ClipboardList, Leaf } from "lucide-react";

export default function PublicIntakePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientKey = params.key as string;

  const clientName = searchParams.get("name") || "Patient";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-2 md:px-4 py-6 md:py-16 space-y-6 md:space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <ClipboardList size={14} /> Intake Forms
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter">
            Patient Intake: {clientName}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
            Please fill out the forms below to help us prepare for your acupuncture session. 
            Your information is encrypted and stored securely.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ClientIntakeForms
            isActive={true}
            clientKey={clientKey}
            clientName={clientName}
            phone={phone}
            email={email}
            isPublic={true}
          />
        </motion.div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-xs font-medium pt-8">
          <Leaf size={14} />
          <span>Powered by Palawan Acupuncture Booking System</span>
        </div>
      </div>
    </PublicLayout>
  );
}
