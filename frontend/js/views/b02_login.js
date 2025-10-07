import { api } from "../api_local.js";

export default async function render(el){
  el.innerHTML = `
    <section class="card grid cols-2">
      <div class="grid">
        <h2>Iniciar sesión</h2>
        <input id="l_email" type="email" placeholder="Email" />
        <input id="l_pass" type="password" placeholder="Contraseña" />
        <button class="btn primary neon neon-green" id="l_ok">Entrar</button>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn neon neon-cyan" id="go_reg">Registro de usuario</button>
          <button class="btn neon neon-cyan" id="go_rec">Recuperar contraseña</button>
        </div>
        <p class="muted" id="l_msg"></p>
      </div>
    </section>
  `;
  el.querySelector("#go_reg").onclick=()=>location.hash="b01_registro";
  el.querySelector("#go_rec").onclick=()=>location.hash="b03_recuperar";
  el.querySelector("#l_ok").onclick = async ()=>{
    const r = await api.post("/auth/login",{ email: el.querySelector("#l_email").value.trim(), pass: el.querySelector("#l_pass").value });
    el.querySelector("#l_msg").textContent = r.ok ? `Hola, ${r.user.name}` : (r.msg||"Error");
  };
}