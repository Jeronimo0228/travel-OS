// Recorrido visual de Travel OS en producción (cuenta demo pública de solo lectura).
import { chromium, webkit, devices } from "playwright";
import fs from "node:fs";
const WEB = "https://travel-os.pdpcomunica.com";
const OUT = "/w/travelos-shots";
const log = [];

async function run(browserType, name, ctxOpts) {
  const browser = await browserType.launch();
  const ctx = await browser.newContext({ ...ctxOpts, locale: "es-CO" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 160)}`));
  const shot = (f) => page.screenshot({ path: `${OUT}/${name}-${f}.png` });

  await page.goto(WEB + "/", { waitUntil: "networkidle" });
  await shot("00-landing");
  await page.locator("#demoLogin").scrollIntoViewIfNeeded();
  await page.click("#demoLogin");
  await page.waitForFunction(() => localStorage.getItem("travelos.session.user"), null, { timeout: 20000 });
  log.push(`[${name}] login demo por la landing OK`);
  for (const [path, file] of [["/", "01-dashboard"], ["/crm", "02-crm"], ["/cotizador", "03-cotizador"], ["/viajes", "04-viajes"], ["/agentes", "05-agentes"], ["/ayuda", "06-manual"], ["/privacidad", "07-privacidad"]]) {
    await page.goto(WEB + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const h = await page.locator("h1,h2").first().textContent().catch(() => "?");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    log.push(`[${name}] ${path} → ${page.url().replace(WEB, "")} | ${String(h).trim().slice(0, 50)} | overflowX=${overflow}`);
    await shot(file);
  }
  // Asistente
  await page.goto(WEB + "/crm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Abrir asistente IA/ }).click();
  await page.getByRole("button", { name: "¿Tengo seguimientos vencidos?" }).click();
  await page.waitForFunction(() => !document.body.innerText.includes("Pensando…"), null, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(500);
  const panel = await page.locator("#ai-assistant-panel").innerText();
  log.push(`[${name}] asistente: ${panel.replace(/\s+/g, " ").slice(0, 260)}`);
  await shot("08-asistente");
  // Cotizador: botón WhatsApp visible si hay cotizaciones
  await page.goto(WEB + "/cotizador", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const wa = page.getByRole("link", { name: /Enviar por WhatsApp/ });
  log.push(`[${name}] cotizador WhatsApp visible=${await wa.isVisible().catch(() => false)} href=${(await wa.getAttribute("href").catch(() => ""))?.slice(0, 40)}`);
  // Buscador superior
  if (name === "desktop") {
    await page.fill("#topbar-search", "Ana");
    await page.press("#topbar-search", "Enter");
    await page.waitForURL(/\/crm\?q=Ana/, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    log.push(`[${name}] búsqueda superior → ${page.url().replace(WEB, "")} valor CRM="${await page.inputValue("#crm-search").catch(() => "?")}"`);
  }
  log.push(`[${name}] errores: ${errors.length ? errors.join(" || ") : "ninguno"}`);
  await browser.close();
}

await run(chromium, "desktop", { viewport: { width: 1440, height: 900 } });
await run(webkit, "iphone", devices["iPhone 14"]);
fs.writeFileSync("/w/travelos.txt", log.join("\n") + "\n");
console.log(log.join("\n"));
