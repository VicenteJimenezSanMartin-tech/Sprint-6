import { api } from "../api_local.js";

export default async function render(el){
  el.innerHTML = `
    <section class="card grid cols-2">
      <div class="grid">
        <h2>Recuperar contraseña</h2>
        <input id="f_email" type="email" placeholder="Email" />
        <button class="btn primary neon neon-green" id="f_ok">Enviar enlace</button>
        <p class="muted" id="f_msg"></p>
      </div>
    </section>
  `;
  el.querySelector("#f_ok").onclick = async ()=>{
    const r = await api.post("/auth/recover",{ email: el.querySelector("#f_email").value.trim() });
    el.querySelector("#f_msg").textContent = r.msg;
  };
}