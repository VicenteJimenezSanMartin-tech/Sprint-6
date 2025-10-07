export default async function render(el){
  const sel = JSON.parse(localStorage.getItem("tn_checkout_address")||"null");
  el.innerHTML = `
    <section class="card grid cols-2">
      <div class="grid">
        <h2>Checkout</h2>
        <input id="c_name" placeholder="Nombre" value="${sel?.nombre||""}" />
        <input id="c_addr" placeholder="Dirección" value="${sel?`${sel.calle||""} ${sel.comuna||""}`:""}" />
        <select id="c_type"><option>Delivery</option><option>Retiro</option></select>
        <button class="btn primary neon neon-pink" id="goPay">Confirmar y pagar</button>
        <p class="muted">Gestiona direcciones en “Direcciones”.</p>
      </div>
    </section>
  `;
  document.getElementById("goPay").onclick = ()=>{ location.hash = "b13_pago"; };
}