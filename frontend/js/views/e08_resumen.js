import { api } from "../api_local.js";

export default async function render(el) {
  el.innerHTML = `
    <section class="card">
      <h2>Resumen del carrito</h2>
      <div id="list"></div>
      <div class="right" style="margin-top:10px">
        <h3>Total: <span id="tot">$0</span></h3>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn" id="vaciar">Vaciar</button>
          <button class="btn primary" id="continuar">Continuar al checkout</button>
        </div>
      </div>
    </section>
  `;

  const list = el.querySelector("#list");
  const tot  = el.querySelector("#tot");

  async function load() {
    const c = await api.get("/cart");
    list.innerHTML = (c.items || []).map(i => `
      <div class="row">
        <div style="font-weight:600">${i.name}</div>
        <div class="qty">
          <button class="btn" data-dec="${i.product_id}">-</button>
          <span>${i.qty}</span>
          <button class="btn" data-inc="${i.product_id}">+</button>
        </div>
        <div class="right">$${i.subtotal.toLocaleString("es-CL")}</div>
      </div>
    `).join("") || `<p class="muted">Tu carrito está vacío.</p>`;
    tot.textContent = "$" + (c.total || 0).toLocaleString("es-CL");
  }

  list.addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-inc],button[data-dec]");
    if (!b) return;
    const id = +(b.dataset.inc || b.dataset.dec);
    if (b.dataset.inc) await api.post("/cart", { productId: id, qty: 1 });
    else await api.del(`/cart/${id}`);
    load();
  });

  el.querySelector("#vaciar").onclick = async () => { await api.post("/cart/clear", {}); load(); };
  el.querySelector("#continuar").onclick = () => location.hash = "b11_checkout";

  load();
}
