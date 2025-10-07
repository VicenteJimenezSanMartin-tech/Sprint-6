function getAddrs() { return JSON.parse(localStorage.getItem("tn_addresses") || "[]"); }
function setAddrs(a) { localStorage.setItem("tn_addresses", JSON.stringify(a)); }

export default async function render(el) {
  el.innerHTML = `
    <section class="card grid cols-2">
      <div class="grid">
        <h2>Direcciones</h2>
        <input id="nombre" placeholder="Nombre (ej: Casa, Trabajo)">
        <input id="calle" placeholder="Calle y número">
        <input id="comuna" placeholder="Comuna / Ciudad">
        <input id="detalle" placeholder="Depto / Indicaciones (opcional)">
        <button class="btn primary" id="guardar">Guardar</button>
      </div>
      <div>
        <h3 class="mt-0">Mis direcciones</h3>
        <div id="lista"></div>
      </div>
    </section>
  `;

  const lista = el.querySelector("#lista");

  function renderList() {
    const arr = getAddrs();
    lista.innerHTML = arr.length ? arr.map((d, i) => `
      <div class="card" style="margin-bottom:8px">
        <b>${d.nombre}</b>
        <div class="muted">${d.calle}</div>
        <div class="muted">${d.comuna}</div>
        ${d.detalle ? `<div class="muted">${d.detalle}</div>` : ""}
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="btn" data-usar="${i}">Usar en checkout</button>
          <button class="btn" data-del="${i}">Eliminar</button>
        </div>
      </div>
    `).join("") : `<p class="muted">Aún no tienes direcciones guardadas.</p>`;
  }
  renderList();

  el.querySelector("#guardar").onclick = () => {
    const d = {
      nombre: el.querySelector("#nombre").value.trim(),
      calle:  el.querySelector("#calle").value.trim(),
      comuna: el.querySelector("#comuna").value.trim(),
      detalle:el.querySelector("#detalle").value.trim()
    };
    if (!d.nombre || !d.calle || !d.comuna) return alert("Completa nombre, calle y comuna.");
    const arr = getAddrs(); arr.push(d); setAddrs(arr);
    el.querySelector("#nombre").value = "";
    el.querySelector("#calle").value  = "";
    el.querySelector("#comuna").value = "";
    el.querySelector("#detalle").value= "";
    renderList();
  };

  lista.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-del],button[data-usar]");
    if (!b) return;
    const idx = +(b.dataset.del || b.dataset.usar);
    const arr = getAddrs();
    if (b.dataset.del) {
      arr.splice(idx, 1); setAddrs(arr); renderList();
    } else {
      localStorage.setItem("tn_checkout_address", JSON.stringify(arr[idx]));
      alert("Dirección seleccionada. Ve a B-11 Checkout.");
      location.hash = "b11_checkout";
    }
  });
}
