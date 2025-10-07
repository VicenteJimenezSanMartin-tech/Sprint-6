import { api } from "../api_local.js";

export default async function render(el) {
  const cfg = await api.get("/config/payments");

  el.innerHTML = `
    <section class="card grid cols-2">
      <div>
        <h2>Admin • Pagos</h2>
        <label>
          <input id="on" type="checkbox" ${cfg.on ? "checked" : ""} />
          Habilitar pagos
        </label>
      </div>
      <div class="card muted">Given admin • When toggle • Then afecta B-13</div>
    </section>
  `;

  el.querySelector("#on").onchange = async (e) => {
    await api.post("/config/payments", { on: e.target.checked });
  };
}
