// frontend/js/views/b04_catalogo.js
import { api } from "../api_local.js";
import { store } from "../storage.js";

export default async function render(el){
  const qs   = new URLSearchParams(location.hash.split("&").slice(1).join("&"));
  const goto = +(qs.get("goto") || 0);
  const q    = (qs.get("q") || "").toLowerCase();

  // contenedor
  el.innerHTML = `<section id="all-sections"></section>`;
  const host = el.querySelector("#all-sections");

  // Traer categorías y productos (en paralelo)
  const cats = await api.get("/categories");
  const proms = cats.map(c => api.get(`/products?category=${c.id}`));
  const lists = await Promise.all(proms);

  // Render de TODAS las secciones apiladas
  host.innerHTML = cats.map((c, i) => {
    const items = lists[i]
      .filter(p => !q || p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q));

    if (items.length === 0) return ""; // oculta secciones sin resultados

    return `
      <div class="section" id="cat-${c.id}">
        <h2 class="section-title">${c.name}</h2>
        <div class="menu">
          ${items.map(p => `
            <div class="card">
              <img src="${p.image||'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format'}" alt="${p.name}">
              <h3 class="mb-0">${p.name}</h3>
              <div class="muted">$${p.price.toLocaleString("es-CL")}</div>
              <div class="grid">
                <button class="btn" data-detail="${p.id}">Detalle</button>
                <button class="btn primary neon neon-green" data-add="${p.id}">Agregar</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  // Listeners
  host.querySelectorAll("[data-detail]").forEach(btn =>
    btn.addEventListener("click", () => location.hash = `b06_detalle&id=${btn.dataset.detail}`)
  );
  host.querySelectorAll("[data-add]").forEach(btn =>
    btn.addEventListener("click", async () => {
      await api.post("/cart", { productId: +btn.dataset.add, qty: 1 });
      store.refreshCart();
    })
  );

  // Desplazar si llegó con goto
  if (goto) {
    const sec = document.getElementById(`cat-${goto}`);
    if (sec) setTimeout(() => sec.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
}
