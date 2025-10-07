import { api } from "../api_local.js";

export default async function render(el){
  const cfg = await api.get("/config/payments");

  el.innerHTML = `
    <section class="card grid cols-2">
      <div class="grid">
        <h2>Pagar</h2>
        ${cfg.on ? '<div class="muted">Pagos habilitados</div>' : '<div class="muted">Pagos DESHABILITADOS</div>'}
        <input id="t_name" placeholder="Titular" />

        <input id="t_num" placeholder="Tarjeta 16 dígitos" inputmode="numeric" />
        <input id="t_exp" placeholder="MM/AA" inputmode="numeric" />
        <input id="t_cvv" placeholder="CVV" inputmode="numeric" />

        <button id="pay" class="btn primary neon neon-pink ${cfg.on ? 'pulse' : ''}" ${cfg.on ? '' : 'disabled'}>Pagar</button>
        <p class="muted" id="p_msg"></p>
      </div>
    </section>
  `;

  const $ = (s)=> el.querySelector(s);
  const msg = (t)=> $("#p_msg").textContent = t;

  // ---- Autoformato amigable ----
  $("#t_num").addEventListener("input", (e)=>{
    const d = e.target.value.replace(/\D/g,"").slice(0,19);
    e.target.value = d.replace(/(.{4})/g,"$1 ").trim();
  });
  $("#t_exp").addEventListener("input", (e)=>{
    const d = e.target.value.replace(/\D/g,"").slice(0,4);
    if (d.length <= 2) e.target.value = d;
    else e.target.value = d.slice(0,2) + "/" + d.slice(2);
  });
  $("#t_cvv").addEventListener("input", (e)=>{
    e.target.value = e.target.value.replace(/\D/g,"").slice(0,4);
  });

  // ---- Click pagar (validación flexible para demo) ----
  $("#pay").onclick = async ()=>{
    if (!cfg.on) return;

    const num = ($("#t_num").value||"").replace(/\D/g,"");     // acepta 12–19 dígitos
    const exp = ($("#t_exp").value||"").replace(/\s/g,"");     // acepta "MM/AA" o "MMAA"
    const cvv = ($("#t_cvv").value||"").replace(/\D/g,"");     // 3–4 dígitos

    if (num.length < 12){
      msg("Ingresa un número de tarjeta válido (mín. 12 dígitos)");
      return;
    }
    if (!/^\d{2}\/?\d{2}$/.test(exp)){
      msg("Formato de fecha inválido. Usa MM/AA");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)){
      msg("CVV inválido (3–4 dígitos)");
      return;
    }

    msg("Procesando pago…");
    try{
      const order = await api.post("/orders", { status:"en_preparacion" });
      localStorage.setItem("last_order_id", order.id);
      location.hash = "b15_recibo";
    }catch(e){
      console.error(e);
      msg("Error al pagar");
    }
  };
}