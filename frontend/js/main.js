// frontend/js/main.js
import { api } from "./api_real.js";
import { store } from "./storage.js";

/* Menú superior (solo las dos entradas) */
const ROUTES = [
  ["Iniciar sesión", "b02_login"],
  ["Catálogo", "b04_catalogo"]
];

const nav = document.getElementById("nav");
nav.innerHTML = ROUTES
  .map(([t,id])=>`<button class="btn neon neon-cyan" data-id="${id}">${t}</button>`)
  .join("");
nav.addEventListener("click",(e)=>{
  const b=e.target.closest("button[data-id]");
  if(!b) return;
  location.hash=b.dataset.id;
});

/* Categorías y búsqueda */
const catbar = document.getElementById("catbar");
const qGlobal = document.getElementById("qGlobal");
const qBtn    = document.getElementById("qBtn");

let activeCat = null;
async function buildCatbar() {
  const cats = await api.get("/categories");
  if (!activeCat) activeCat = cats[0]?.id || null;
  catbar.innerHTML = cats.map(c=>`<button class="cat ${+c.id===+activeCat?'active':''}" data-id="${c.id}">${c.name}</button>`).join("");
}
catbar.addEventListener("click",(e)=>{
  const b=e.target.closest(".cat[data-id]"); if(!b) return;
  activeCat = +b.dataset.id;
  document.querySelectorAll(".cat").forEach(x=>x.classList.toggle("active", +x.dataset.id===activeCat));
  // Ir al catálogo y desplazar a la sección
  location.hash = `b04_catalogo&goto=${activeCat}`;
});
function runSearch(){
  const q = encodeURIComponent(qGlobal.value||"");
  location.hash = `b04_catalogo&q=${q}`;
}
qGlobal.addEventListener("keydown",(e)=>{ if(e.key==="Enter") runSearch(); });
qBtn.addEventListener("click", runSearch);

/* Drawer Carrito */

(function wireCart(){
  const drawer = document.getElementById("drawer");
  const openBtn = document.getElementById("btnCart");
  const closeBtn = document.getElementById("closeDrawer");

  openBtn.onclick = async () => {
    drawer.classList.add("open");
    await store.refreshCart();
  };
  closeBtn.onclick = () => drawer.classList.remove("open");

  // Vaciar
  document.getElementById("clearCart").onclick = async () => {
    await api.post("/cart/clear", {});
    store.refreshCart();
  };

  // Ir a checkout: cierra drawer y navega
  document.getElementById("goCheckout").onclick = () => {
    drawer.classList.remove("open");
    setTimeout(() => { location.hash = "b11_checkout"; }, 120);
  };
})();
/* Router */
async function render(){
  const app=document.getElementById("app");
  const base=(location.hash.replace("#","")||"b04_catalogo").split("&")[0];
  try{
    const mod = await import(`./views/${base}.js`);
    await mod.default(app);
  }catch(err){
    console.error(err);
    app.innerHTML = `<section class="card"><h2>Error</h2><p class="muted">No se encontró la vista <code>${base}.js</code></p></section>`;
  }
  updateMiniCart();
}
window.addEventListener("hashchange", render);

/* init */
await buildCatbar();
await render();

async function getLastOrder() {
  // intenta API /orders/last y si no, usa localStorage
  try {
    const r = await api.get("/orders/last");
    if (r && r.id) return r;
  } catch {}
  const id = +(localStorage.getItem("last_order_id") || 0);
  return id ? await api.get(`/orders/${id}`) : null;
}

async function updateOrderBadge() {
  const text = document.getElementById("orderText");
  const dot  = document.getElementById("orderDot");
  const o = await getLastOrder();

  if (!o) {
    text.textContent = "Pedido";
    dot.classList.remove("st-prep","st-route","st-done");
    return;
  }

  // normaliza estados
  const s = (o.status || o.estado || "").toLowerCase();
  let label = "En preparación";
  dot.classList.remove("st-prep","st-route","st-done");
  if (s.includes("camino")) { label = "En camino"; dot.classList.add("st-route"); }
  else if (s.includes("entregado") || s.includes("complet")) { label = "Entregado"; dot.classList.add("st-done"); }
  else { dot.classList.add("st-prep"); }

  text.textContent = label;
}

/* botón abre vista de estado */
document.getElementById("btnOrder").onclick = () => {
  location.hash = "b12_estado_pedido";
};

/* llama al iniciar y cada cambio de hash */
updateOrderBadge();
window.addEventListener("hashchange", updateOrderBadge);
/* opcional: refresco periódico */
setInterval(updateOrderBadge, 15000);
const btnOrder = document.getElementById("btnOrder");
if (btnOrder) {
  btnOrder.onclick = () => { location.hash = "b12_estado_pedido"; };
}
const orderBtn = document.getElementById("btnOrder");
if (orderBtn) {
  orderBtn.onclick = () => { location.hash = "b12_estado_pedido"; };
}