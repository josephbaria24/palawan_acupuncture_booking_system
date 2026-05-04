"use client";

import { Toaster } from "sileo";
import "sileo/styles.css";

/**
 * Global Sileo viewport: top-center, dark theme, near-black morph fill.
 * @see https://sileo.aaryan.design/
 */
export function SileoToaster() {
  return (
    <Toaster
      position="top-center"
      theme="dark"
      offset={{ top: "0.75rem" }}
      options={{
        fill: "#0a0a0a",
        styles: {
          title: "text-white/95",
          description: "text-white/75",
        },
      }}
    />
  );
}
