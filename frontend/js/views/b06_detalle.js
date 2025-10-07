import { api } from "../api_local.js";
import { store } from "../storage.js";

export default async function render(el){
  const qs = new URLSearchParams(location.hash.split("&").slice(1).join("&"));
  const id = +qs.get("id");

  const p = await api.get(`/products/${id}`);

  el.innerHTML = `
    <section class="card grid cols-2">
      <img src="${p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format'}" alt="${p.name}" style="width:100%;border-radius:12px;object-fit:cover;max-height:520px">
      <div class="grid">
        <h2>${p.name}</h2>
        <p class="muted">${p.description || ""}</p>
        <h3>$${p.price.toLocaleString("es-CL")}</h3>
        <div style="display:flex;gap:8px;align-items:center">
          <label>Cantidad
            <input id="qty" type="number" value="1" min="1" style="width:90px">
          </label>
          <button id="add" class="btn primary neon neon-green">Agregar</button>
          <button id="back" class="btn">Volver</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("add").onclick = async ()=>{
    const qty = Math.max(1, +document.getElementById("qty").value || 1);
    await api.post("/cart", { productId: p.id, qty });
    await store.refreshCart();
  };
  document.getElementById("back").onclick = ()=> history.back();
}