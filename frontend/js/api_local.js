/*** API local usando IndexedDB (sin backend). */
const DB_NAME = "tokyoDB";
const DB_VER  = 4;
const CURRENT_USER_ID = 1;

/* ---------- Helpers IndexedDB ---------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;

      // borrar stores anteriores y crear desde cero
      Array.from(db.objectStoreNames || []).forEach(n => db.deleteObjectStore(n));

      db.createObjectStore("users",       { keyPath: "id", autoIncrement: true });
      db.createObjectStore("categories",  { keyPath: "id", autoIncrement: true });
      db.createObjectStore("products",    { keyPath: "id", autoIncrement: true });
      db.createObjectStore("cart_items",  { keyPath: ["user_id","product_id"] });
      db.createObjectStore("orders",      { keyPath: "id", autoIncrement: true });
      db.createObjectStore("config",      { keyPath: "k" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
const tx    = (db, stores, mode="readonly") => db.transaction(stores, mode);
const getAll= (s) => new Promise((res, rej) => { const q = s.getAll(); q.onsuccess = () => res(q.result||[]); q.onerror = () => rej(q.error); });
const get   = (s) => (k) => new Promise((res, rej) => { const q = s.get(k); q.onsuccess = () => res(q.result||null); q.onerror = () => rej(q.error); });
const put   = (s) => (v) => new Promise((res, rej) => { const q = s.put(v); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
const del   = (s) => (k) => new Promise((res, rej) => { const q = s.delete(k); q.onsuccess = () => res(true); q.onerror = () => rej(q.error); });

/* ---------- Seed inicial ---------- */
async function ensureSeed() {
  const db = await openDB();
  const t = tx(db, ["categories","products","config","users"], "readwrite");
  const cats = await getAll(t.objectStore("categories"));
  if (cats.length === 0) {
    const insCat = (name) => put(t.objectStore("categories"))({ name }).then(id => ({ id, name }));
    const c1 = await insCat("Tablas Para Compartir");
    const c2 = await insCat("Combos");
    const c3 = await insCat("Entradas");
    const c4 = await insCat("Hanamaki Rolls");
    const c5 = await insCat("Uramaki Rolls");

    const ps = t.objectStore("products");
    const add = (category_id, name, price, description, image="") =>
      put(ps)({ category_id, name, price, description, image });

    // Tablas Para Compartir
    await add(c1.id, "Sushi Sashimi Deluxe (43p)", 52900, "Sashimi mixto + battera unagi + arcoíris");
    await add(c1.id, "Sushi para Dos (31p)",       28900, "Selección para 2 personas");
    await add(c1.id, "Sushi para Cuatro (74p)",    58900, "Ideal para 4 comensales");
    await add(c1.id, "Tabla Familiar (100p)",      87900, "Nuestra tabla más pedida para la familia");
    await add(c1.id, "Tabla Vegetariana (40p)",    41900, "Rolls y nigiris vegetarianos");

    // Combos
    await add(c2.id, "Combo Uno",                  17900, "Uramaki camarón tempura x8 + gyozas");
    await add(c2.id, "Combo Dos",                  23800, "Hanamaki salmón x8 + uramaki palta x8");
    await add(c2.id, "Combo Tres",                 35900, "Mix de rolls + gyozas + bebidas");
    await add(c2.id, "Combo Pollo Teriyaki",       21900, "Pollo teriyaki + arroz + ensalada wakame");
    await add(c2.id, "Combo Yakisoba",             20900, "Fideos salteados estilo japonés + gyosas");

    // Entradas
    await add(c3.id, "Gyozas de Cerdo (6u)",        4900, "Clásicas gyozas al vapor/sartén");
    await add(c3.id, "Gyozas de Pollo (6u)",        4900, "Relleno de pollo con verduras");
    await add(c3.id, "Bao de Cerdo",                3900, "Panecillo al vapor con cerdo desmechado");
    await add(c3.id, "Tataki de Atún",             11900, "Lomos sellados con sésamo y ponzu");
    await add(c3.id, "Ebi Furai (6u)",              6900, "Camarones empanizados crocantes");
    await add(c3.id, "Wantán Frito (8u)",           5900, "Relleno de carne y verduras");

    // Hanamaki Rolls (envueltos por fuera)
    await add(c4.id, "Hanamaki Salmón",            12900, "Roll envuelto en salmón");
    await add(c4.id, "Hanamaki Palta",              8500, "Roll envuelto en palta cremosa");
    await add(c4.id, "Hanamaki Camarón",           12900, "Roll envuelto en camarón");
    await add(c4.id, "Hanamaki Atún",              11900, "Roll envuelto en atún");
    await add(c4.id, "Hanamaki Philadelphia",      12900, "Con queso crema y salmón");
    await add(c4.id, "Hanamaki Teriyaki",          10900, "Pollo teriyaki y palta");

    // Uramaki Rolls
    await add(c5.id, "Uramaki Sésamo",              6900, "Clásico con sésamo tostado");
    await add(c5.id, "California Roll",             7900, "Kanikama, palta y pepino");
    await add(c5.id, "Tempura Camarón",             8900, "Camarón tempura y salsa especial");
    await add(c5.id, "Ebi Palta",                   7900, "Camarón cocido y palta");
    await add(c5.id, "Spicy Tuna",                  8900, "Atún picante con cebollín");
    await add(c5.id, "Dragon Roll",                 9900, "Anguila/karesansui con palta por fuera");

    await put(t.objectStore("config"))({ k: "payments_on", v: "true" });
    await put(t.objectStore("users"))({ id: 1, email: "demo@tokyo.local", name: "demo", pass: "demo" });
  }
  t.commit?.();
  db.close();
}

/* ---------- Consultas ---------- */
async function listCategories() {
  const db = await openDB();
  const out = await getAll(tx(db, ["categories"]).objectStore("categories"));
  db.close();
  return out;
}
async function listProducts({ category, q }) {
  const db = await openDB();
  let items = await getAll(tx(db, ["products"]).objectStore("products"));
  if (category) items = items.filter(p => String(p.category_id) === String(category));
  if (q) {
    const qq = String(q).toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(qq) ||
      (p.description || "").toLowerCase().includes(qq)
    );
  }
  db.close();
  return items;
}
async function getProduct(id) {
  const db = await openDB();
  const all = await getAll(tx(db, ["products"]).objectStore("products"));
  db.close();
  return all.find(p => Number(p.id) === Number(id)) || null;
}
async function getCart(user_id = CURRENT_USER_ID) {
  const db = await openDB();
  const t = tx(db, ["cart_items","products"]);
  const items = await getAll(t.objectStore("cart_items"));
  const mine  = items.filter(i => i.user_id === user_id);
  const prods = await getAll(t.objectStore("products"));

  const rows = mine.map(ci => {
    const p = prods.find(pp => Number(pp.id) === Number(ci.product_id));
    const subtotal = (p?.price || 0) * ci.qty;
    return { product_id: ci.product_id, name: p?.name || "(eliminado)", price: p?.price || 0, qty: ci.qty, subtotal };
  });
  const total = rows.reduce((a,b) => a + b.subtotal, 0);
  db.close();
  return { items: rows, total };
}
async function addToCart(productId, qty = 1, user_id = CURRENT_USER_ID) {
  const db = await openDB();
  const t  = tx(db, ["cart_items"], "readwrite");
  const s  = t.objectStore("cart_items");
  const key = [user_id, Number(productId)];
  const cur = await get(s)(key);
  const newQty = (cur?.qty || 0) + Number(qty);
  await put(s)({ user_id, product_id: Number(productId), qty: newQty });
  t.commit?.();
  db.close();
  return { ok: true };
}
async function decFromCart(productId, user_id = CURRENT_USER_ID) {
  const db = await openDB();
  const t  = tx(db, ["cart_items"], "readwrite");
  const s  = t.objectStore("cart_items");
  const key = [user_id, Number(productId)];
  const cur = await get(s)(key);
  if (!cur) { db.close(); return { ok: true }; }
  if (cur.qty > 1) await put(s)({ ...cur, qty: cur.qty - 1 });
  else await del(s)(key);
  t.commit?.(); db.close();
  return { ok: true };
}
async function clearCart(user_id = CURRENT_USER_ID) {
  const db = await openDB();
  const t  = tx(db, ["cart_items"], "readwrite");
  const s  = t.objectStore("cart_items");
  const all = await getAll(s);
  await Promise.all(all.filter(i => i.user_id === user_id).map(i => del(s)([user_id, i.product_id])));
  t.commit?.(); db.close();
  return { ok: true };
}
async function createOrder(user_id = CURRENT_USER_ID) {
  const cart = await getCart(user_id);
  const total = cart.total;
  const code = "TN-" + Date.now();
  const db = await openDB();
  const t  = tx(db, ["orders","cart_items"], "readwrite");
  const id = await put(t.objectStore("orders"))({
    code, user_id, total, status: "Pagado", created_at: new Date().toISOString()
  });
  const s = t.objectStore("cart_items");
  const all = await getAll(s);
  await Promise.all(all.filter(i => i.user_id === user_id).map(i => del(s)([user_id, i.product_id])));
  t.commit?.(); db.close();
  return { id, code, total, status: "Pagado" };
}
async function getOrder(id) {
  const db = await openDB();
  const o  = await get(tx(db, ["orders"]).objectStore("orders"))(Number(id));
  db.close();
  return o || null;
}
async function getPaymentsOn() {
  const db = await openDB();
  const row = await get(tx(db, ["config"]).objectStore("config"))("payments_on");
  db.close();
  return { on: row ? row.v !== "false" : true };
}
async function setPaymentsOn(on) {
  const db = await openDB();
  await put(tx(db, ["config"], "readwrite").objectStore("config"))({ k: "payments_on", v: String(!!on) });
  db.close();
  return { ok: true };
}
/* Auth */
async function register({ email, name, pass }) {
  const db = await openDB();
  const s  = tx(db, ["users"], "readwrite").objectStore("users");
  const all= await getAll(s);
  if (all.find(u => u.email === email)) { db.close(); return { ok: false, msg: "Email ya existe" }; }
  const id = await put(s)({ email, name: name || "", pass: pass || "" });
  db.close();
  return { ok: true, user: { id, email, name } };
}
async function login({ email, pass }) {
  const db = await openDB();
  const all= await getAll(tx(db, ["users"]).objectStore("users"));
  const u  = all.find(x => x.email === email && x.pass === pass);
  db.close();
  return u ? { ok: true, user: { id: u.id, email: u.email, name: u.name } } : { ok: false, msg: "Credenciales inválidas" };
}
async function recover({ email }) {
  const db = await openDB();
  const all= await getAll(tx(db, ["users"]).objectStore("users"));
  const u  = all.find(x => x.email === email);
  db.close();
  return { ok: !!u, msg: u ? "Enlace enviado (simulado)" : "Email no encontrado" };
}

/* ---------- Router  ---------- */
function parseQuery(qs) { const o = {}; new URLSearchParams(qs).forEach((v,k)=> o[k]=v); return o; }

export const api = {
  async get(path) {
    await ensureSeed();
    if (path === "/categories") return listCategories();
    if (path.startsWith("/products?")) { const q = parseQuery(path.split("?")[1]); return listProducts({ category: q.category, q: q.q }); }
    if (path.startsWith("/products/")) { const id = path.split("/")[2]; return getProduct(id); }
    if (path === "/cart") return getCart();
    if (path.startsWith("/orders/")) { const id = path.split("/")[2]; return getOrder(id); }
    if (path === "/config/payments") return getPaymentsOn();
    throw new Error("GET no implementado: " + path);
  },
  async post(path, body = {}) {
    await ensureSeed();
    if (path === "/cart") return addToCart(body.productId, body.qty || 1);
    if (path === "/cart/clear") return clearCart();
    if (path === "/orders") return createOrder();
    if (path === "/auth/register") return register(body);
    if (path === "/auth/login") return login(body);
    if (path === "/auth/recover") return recover(body);
    if (path === "/config/payments") return setPaymentsOn(!!body.on);
    throw new Error("POST no implementado: " + path);
  },
  async del(path) {
    await ensureSeed();
    if (path.startsWith("/cart/")) { const id = path.split("/")[2]; return decFromCart(Number(id)); }
    throw new Error("DELETE no implementado: " + path);
  }
};
