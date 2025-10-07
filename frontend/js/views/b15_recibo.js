import { api } from "../api_local.js";

export default async function render(el) {
  const id = +localStorage.getItem("last_order_id");
  const r  = id ? await api.get(`/orders/${id}`) : null;

  el.innerHTML = `
    <section class="card">
      <h2>Recibo</h2>
      ${
        r
          ? `<pre>Orden: ${r.code}
Estado: ${r.status}
Total: $${r.total.toLocaleString("es-CL")}
Fecha: ${r.created_at}</pre>
<button class="btn" id="print">Imprimir / PDF</button>`
          : '<p class="muted">No hay orden reciente</p>'
      }
    </section>
  `;

  const btn = el.querySelector("#print");
  if (btn) btn.onclick = () => window.print();
}
