import { store } from "../storage.js";

export default async function render(el) {
  el.innerHTML = `
    <section class="card">
      <h2>Carrito</h2>
      <p>Usa el botón 🛒 de la barra superior para abrir el carrito (drawer) y editar cantidades.</p>
    </section>
  `;
  store.refreshCart();
}
