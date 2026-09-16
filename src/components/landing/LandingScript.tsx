"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
    if (menuValue) {
      const WHATSAPP = "34644090462";
      const waLink = (text: string) =>
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

      const BASE_PRICE = 50;
      const MENU_TIER_THRESHOLD = 30;
      const MENU_BASE = 20;
      const MENU_DISCOUNT = 18;
      const REVIEW_TIER_THRESHOLD = 5;
      const REVIEW_BASE = 30;
      const REVIEW_DISCOUNT = 25;

      const state = { menu: 6, reviews: 1, maint: false };

      const reviewValue = document.getElementById("reviewValue");
      const totalAmount = document.getElementById("totalAmount");
      const maintToggle = document.getElementById("maintToggle");
      const maintLine = document.getElementById(
        "maintLine",
      ) as HTMLElement | null;
      const calcWa = document.getElementById(
        "calc-wa",
      ) as HTMLAnchorElement | null;

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

      const render = (animate: boolean) => {
        if (menuValue) menuValue.textContent = String(state.menu);
        if (reviewValue) reviewValue.textContent = String(state.reviews);
        maintToggle?.setAttribute(
          "aria-pressed",
          state.maint ? "true" : "false",
        );
        if (maintLine) maintLine.style.display = state.maint ? "flex" : "none";

        const menuCost = tierPrice(
          state.menu,
          MENU_BASE,
          MENU_DISCOUNT,
          MENU_TIER_THRESHOLD,
        );
        const reviewCost = tierPrice(
          state.reviews,
          REVIEW_BASE,
          REVIEW_DISCOUNT,
          REVIEW_TIER_THRESHOLD,
        );
        const total = BASE_PRICE + menuCost + reviewCost;
        if (totalAmount) totalAmount.textContent = `${total}€`;
        if (animate) bump();

        const lines = [
          "Hola, quiero pedir presupuesto para mi carta digital Cartoca:",
          `- ${state.menu} tarjeta(s) NFC de menú`,
          `- ${state.reviews} tarjeta(s) NFC de reseñas`,
          `- Acceso a la plataforma: ${state.maint ? "sí (desde 25€/mes, según funciones)" : "no"}`,
          `Pago único estimado: ${total}€`,
        ];
        if (calcWa) calcWa.href = waLink(lines.join("\n"));
      };

      const bind = (id: string, fn: () => void) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("click", fn);
        cleanups.push(() => el.removeEventListener("click", fn));
      };

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
      bind("maintToggle", () => {
        state.maint = !state.maint;
        render(true);
      });

      render(false);
    }

    return () => {
      io?.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
