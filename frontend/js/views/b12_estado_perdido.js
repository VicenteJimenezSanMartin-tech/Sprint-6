import { api } from "../api_local.js";

export default async function render(el){
  async function getLast(){
    try { const r = await api.get("/orders/last"); if (r && r.id) return r; } catch {}
    const id = +(localStorage.getItem("last_order_id")||0);
    return id ? await api.get(`/orders/${id}`) : null;
  }

  const o = await getLast();
  if (!o){
    el.innerHTML = `<section class="card"><h2>Estado del pedido</h2><p class="muted">Aún no tienes pedidos.</p></section>`;
    return;
  }

  const s = (o.status||"en_preparacion").toLowerCase();
  const step = s.includes("entregado") ? 3 : s.includes("camino") ? 2 : 1;

  el.innerHTML = `
    <section class="card">
      <h2>Estado del pedido</h2>
      <p class="muted">Orden: <b>${o.code||o.id}</b> • Total: <b>$${(o.total||0).toLocaleString("es-CL")}</b></p>

      <div class="tracker">
        <div class="t-step ${step>=1?'on':''}"><span class="t-dot"></span><span>En preparación</span></div>
        <div class="t-line ${step>=2?'on':''}"></div>
        <div class="t-step ${step>=2?'on':''}"><span class="t-dot"></span><span>En camino</span></div>
        <div class="t-line ${step>=3?'on':''}"></div>
        <div class="t-step ${step>=3?'on':''}"><span class="t-dot"></span><span>Entregado</span></div>
      </div>

      <div style="margin-top:12px"><button class="btn" id="back">Volver</button></div>
    </section>
  `;
  document.getElementById("back").onclick = ()=> history.back();
}