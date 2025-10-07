import { api } from "./api_local.js";

/**
 * Utilidades de UI: badge del carrito, render del drawer, etc.
 */
export const store = {
  setBadge(n) {
    const el = document.getElementById("badge");
    if (el) el.textContent = String(n);
  },

  async refreshCart() {
    const c = await api.get("/cart");

    // Render filas
    const rowsEl = document.getElementById("rows");
    if (rowsEl) {
      rowsEl.innerHTML = (c.items || []).map(i => `
        <div class="row">
          <div>${i.name}</div>
          <div class="qty">
            <button class="btn" onclick="window.dec(${i.product_id})">-</button>
            <span>${i.qty}</span>
            <button class="btn" onclick="window.inc(${i.product_id})">+</button>
          </div>
          <div>$${i.subtotal.toLocaleString("es-CL")}</div>
        </div>
      `).join("");
    }

    // Suma total
    const sumEl = document.getElementById("sum");
    if (sumEl) sumEl.textContent = "$" + (c.total || 0).toLocaleString("es-CL");

    // Badge cantidad
    const totalQty = (c.items || []).reduce((a, b) => a + b.qty, 0);
    this.setBadge(totalQty);
  }
};

// Helpers para botones del drawer
window.inc = async (id) => { await api.post("/cart", { productId: id, qty: 1 }); store.refreshCart(); };
window.dec = async (id) => { await api.del(`/cart/${id}`); store.refreshCart(); };
