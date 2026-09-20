"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import QRCode from "qrcode";

// Antes esto vivía en landing-script.js, cargado con un <script> dentro del
// layout compartido de (marketing). El problema: ese layout no se vuelve a
// montar al navegar entre páginas de la landing con <Link> (Next.js hace la
// transición sin recargar), así que el <script> solo se ejecutaba una vez,
// en la primera carga -- cualquier página a la que se llegara navegando
// (en vez de recargando/escribiendo la URL) se quedaba con el scroll
// reveal, las pestañas de producto y la calculadora sin inicializar.
//
// Convertido en un componente que usa usePathname(): su useEffect se
// vuelve a ejecutar en cada cambio de ruta, así que cada página nueva
// queda correctamente inicializada, se llegue a ella como sea.
export default function LandingScript() {
  const pathname = usePathname();

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const cleanups: (() => void)[] = [];

    // Scroll reveal — seguro en cualquier página, no hace nada si no hay .reveal.
    try {
      const revealEls = document.querySelectorAll(".reveal");
      if (revealEls.length) {
        if ("IntersectionObserver" in window) {
          io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("in");
                  io?.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
          );
          revealEls.forEach((el) => io!.observe(el));
        } else {
          revealEls.forEach((el) => el.classList.add("in"));
        }
      }
    } catch {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("in"));
    }

    // Pestañas de la demo — solo presentes en /producto.
    const tabBtns = document.querySelectorAll<HTMLElement>(".tab-btn");
    tabBtns.forEach((btn) => {
      const handler = () => {
        const target = btn.getAttribute("data-tab");
        tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
        document.querySelectorAll(".tab-panel-text").forEach((p) => {
          p.classList.toggle("active", p.getAttribute("data-panel") === target);
        });
        document.querySelectorAll(".tap-stage").forEach((p) => {
          p.classList.toggle("active", p.getAttribute("data-panel") === target);
        });
      };
      btn.addEventListener("click", handler);
      cleanups.push(() => btn.removeEventListener("click", handler));
    });

    // Calculadora — solo presente en /precios. Precios reales de Cartoca.
    const menuValue = document.getElementById("menuValue");
    const planButtons = document.querySelectorAll<HTMLButtonElement>(".plan-select");
    if (menuValue || planButtons.length) {
      const WHATSAPP = "34644090462";
      const waLink = (text: string) =>
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

      type PlanId = "admin" | "qr" | "nfc";
      const PLANS: Record<
        PlanId,
        { label: string; price: number; incluyeNfc: boolean; incluyeDigitalizacion: boolean }
      > = {
        admin: { label: "Solo plataforma", price: 25, incluyeNfc: false, incluyeDigitalizacion: false },
        qr: { label: "Digitalización + QR", price: 30, incluyeNfc: false, incluyeDigitalizacion: true },
        nfc: { label: "Digitalización + NFC", price: 30, incluyeNfc: true, incluyeDigitalizacion: true },
      };

      const ENTRADA_FEE = 50;
      const MENU_TIER_THRESHOLD = 30;
      const MENU_BASE = 20;
      const MENU_DISCOUNT = 18;
      const REVIEW_TIER_THRESHOLD = 5;
      const REVIEW_BASE = 30;
      const REVIEW_DISCOUNT = 25;

      const state = { plan: "qr" as PlanId, menu: 6, reviews: 1, name: "" };

      const reviewValue = document.getElementById("reviewValue");
      const totalAmount = document.getElementById("totalAmount");
      const totalLabel = document.getElementById("totalLabel");
      const nfcExtras = document.getElementById("nfcExtras") as HTMLElement | null;
      const entradaSub = document.getElementById("entradaSub") as HTMLElement | null;
      const nfcSub = document.getElementById("nfcSub") as HTMLElement | null;
      const nfcAmount = document.getElementById("nfcAmount");
      const calcWa = document.getElementById(
        "calc-wa",
      ) as HTMLAnchorElement | null;
      const restoName = document.getElementById(
        "restoName",
      ) as HTMLInputElement | null;
      const qrUrlEl = document.getElementById("precioQrUrl");
      const qrCanvas = document.getElementById(
        "precioQrCanvas",
      ) as HTMLCanvasElement | null;

      const slugify = (input: string) =>
        input
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const tierPrice = (
        qty: number,
        base: number,
        discounted: number,
        threshold: number,
      ) => {
        if (qty <= 0) return 0;
        const price = qty >= threshold ? discounted : base;
        return qty * price;
      };

      const bump = () => {
        totalAmount?.classList.add("bump");
        setTimeout(() => totalAmount?.classList.remove("bump"), 220);
      };

      const renderQr = () => {
        const slug = slugify(state.name) || "tu-restaurante";
        if (qrUrlEl) qrUrlEl.textContent = `cartoca.es/${slug}`;
        if (qrCanvas) {
          QRCode.toCanvas(qrCanvas, `https://cartoca.es/${slug}`, {
            width: 104,
            margin: 1,
            color: { dark: "#101b2d", light: "#ffffff" },
          }).catch(() => {});
        }
      };

      const render = (animate: boolean) => {
        const plan = PLANS[state.plan];

        planButtons.forEach((btn) => {
          const active = btn.dataset.plan === state.plan;
          btn.classList.toggle("active", active);
          btn.setAttribute("aria-pressed", active ? "true" : "false");
        });

        if (nfcExtras) nfcExtras.style.display = plan.incluyeNfc ? "block" : "none";
        if (menuValue) menuValue.textContent = String(state.menu);
        if (reviewValue) reviewValue.textContent = String(state.reviews);

        if (totalLabel) totalLabel.textContent = plan.label;
        if (totalAmount) totalAmount.textContent = `${plan.price}€/mes`;
        if (animate) bump();

        const menuCost = plan.incluyeNfc
          ? tierPrice(state.menu, MENU_BASE, MENU_DISCOUNT, MENU_TIER_THRESHOLD)
          : 0;
        const reviewCost = plan.incluyeNfc
          ? tierPrice(state.reviews, REVIEW_BASE, REVIEW_DISCOUNT, REVIEW_TIER_THRESHOLD)
          : 0;
        const nfcTotal = menuCost + reviewCost;
        const entrada = plan.incluyeDigitalizacion ? ENTRADA_FEE : 0;

        if (entradaSub) entradaSub.style.display = entrada > 0 ? "flex" : "none";
        if (nfcSub) nfcSub.style.display = plan.incluyeNfc && nfcTotal > 0 ? "flex" : "none";
        if (nfcAmount) nfcAmount.textContent = `${nfcTotal}€ pago único`;

        const nombre = state.name.trim() || "(sin nombre todavía)";
        const lines = [
          "Hola, quiero pedir presupuesto para mi carta digital Cartoca:",
          `- Restaurante: ${nombre}`,
          `- Plan: ${plan.label} (${plan.price}€/mes)`,
        ];
        if (entrada > 0) {
          lines.push(`- Entrada (digitalización): ${entrada}€ pago único`);
        }
        if (plan.incluyeNfc) {
          lines.push(`- ${state.menu} tarjeta(s) NFC de menú`);
          lines.push(`- ${state.reviews} tarjeta(s) NFC de reseñas de Google`);
          lines.push(`- Tarjetas NFC: ${nfcTotal}€ pago único`);
        }
        if (calcWa) calcWa.href = waLink(lines.join("\n"));
      };

      const bind = (id: string, fn: () => void) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("click", fn);
        cleanups.push(() => el.removeEventListener("click", fn));
      };

      planButtons.forEach((btn) => {
        const handler = () => {
          const planId = btn.dataset.plan as PlanId | undefined;
          if (!planId || !(planId in PLANS)) return;
          state.plan = planId;
          render(true);
        };
        btn.addEventListener("click", handler);
        cleanups.push(() => btn.removeEventListener("click", handler));
      });

      bind("menuMinus", () => {
        state.menu = Math.max(0, state.menu - 1);
        render(true);
      });
      bind("menuPlus", () => {
        state.menu = Math.min(80, state.menu + 1);
        render(true);
      });
      bind("reviewMinus", () => {
        state.reviews = Math.max(0, state.reviews - 1);
        render(true);
      });
      bind("reviewPlus", () => {
        state.reviews = Math.min(30, state.reviews + 1);
        render(true);
      });

      if (restoName) {
        const handler = () => {
          state.name = restoName.value;
          renderQr();
        };
        restoName.addEventListener("input", handler);
        cleanups.push(() => restoName.removeEventListener("input", handler));
      }

      renderQr();
      render(false);
    }

    return () => {
      io?.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
