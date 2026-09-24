"use client";

import dynamic from "next/dynamic";
import SchoolLoader from "@/components/SchoolLoader";

// Scena three.js nu poate fi randata pe server, deci o incarcam doar in browser.
const VRScene = dynamic(() => import("@/components/VRScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center rounded-xl bg-[#12102b]">
      <SchoolLoader label="Se pregateste scena" className="text-white" />
    </div>
  ),
});

export default VRScene;
