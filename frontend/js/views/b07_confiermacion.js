export default async function render(el) {
  el.innerHTML = `
    <section class="card">
      <h2>Confirmación</h2>
      <p>Tu pedido fue recibido. Revisa Recibo (B-15) o Estado (B-12).</p>
    </section>
  `;
}
