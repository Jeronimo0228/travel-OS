import Script from "next/script";
import { landingMarkup } from "./landingMarkup";
import "./landing.css";

/** Página pública de Travel OS (raíz para visitantes sin sesión). */
export function LandingPage() {
  return (
    <>
      <div className="lp" dangerouslySetInnerHTML={{ __html: landingMarkup }} />
      <Script src="/landing/landing.js" strategy="afterInteractive" />
    </>
  );
}
