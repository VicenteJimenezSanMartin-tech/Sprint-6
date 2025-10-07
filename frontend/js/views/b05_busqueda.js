import { api } from "../api_local.js";

export default async function render(el) {
  const cats = await api.get("/categories");

  el.innerHTML = `
    <section class="card grid cols-2">
      <input id="q" placeholder="Buscar (ej: sushi)" />
      <select id="cat">
        ${cats.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
      </select>
      <div id="res" class="menu" style="grid-column:1/-1"></div>
    </section>
  `;

  const q   = el.querySelector("#q");
  const cat = el.querySelector("#cat");
  const res = el.querySelector("#res");

  async function run() {
    const list = await api.get(`/products?category=${cat.value}&q=${encodeURIComponent(q.value)}`);
    res.innerHTML = list.map(x => `
      <div class="card">
        <b>${x.name}</b>
        <div class="muted">$${x.price.toLocaleString("es-CL")}</div>
      </div>
    `).join("");
  }

  q.oninput = run;
  cat.onchange = run;
  run();
}
