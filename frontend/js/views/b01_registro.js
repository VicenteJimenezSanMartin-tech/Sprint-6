import { api } from "../api_local.js";

export default async function render(el){
  el.innerHTML = `
    <section class="card grid cols-2">
      <div class="grid">
        <h2>Registro de usuario</h2>
        <input id="r_name" placeholder="Nombre" />
        <input id="r_email" type="email" placeholder="Email" />
        <input id="r_pass" type="password" placeholder="Contraseña (min 6)" />
        <button class="btn primary neon neon-green" id="r_ok">Crear cuenta</button>
        <p class="muted" id="r_msg"></p>
      </div>
    </section>
  `;
  const msg = (t)=> el.querySelector("#r_msg").textContent=t;
  el.querySelector("#r_ok").onclick = async ()=>{
    const body = { name:el.querySelector("#r_name").value.trim(), email:el.querySelector("#r_email").value.trim(), pass:el.querySelector("#r_pass").value };
    if(!body.name||!body.email||body.pass.length<6) return msg("Datos inválidos");
    const r = await api.post("/auth/register", body);
    msg(r.ok ? "Cuenta creada ✔" : (r.msg||"Error"));
  };
}