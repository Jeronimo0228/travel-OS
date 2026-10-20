import type { Metadata } from "next";
import { TravelerPortal } from "@/components/portal/TravelerPortal";

export const metadata: Metadata = {
  title: "Mi viaje · TravelOS",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return <TravelerPortal />;
}
