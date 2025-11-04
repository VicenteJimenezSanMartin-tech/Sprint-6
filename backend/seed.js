// backend/seed.js
const Category = require('./models/Category');
const Product = require('./models/Product');

// Función para añadir productos
async function addProduct(category, name, price, description = "", image = "") {
  await Product.create({
    category_id: category._id, // Usamos el ID de la categoría
    name,
    price,
    description,
    image
  });
}

// Esta es la función principal que siembra la base de datos
async function seedDatabase() {
  try {
    // 1. Revisa si ya hay categorías
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('La base de datos ya está poblada. No se hará nada.');
      return; // No hagas nada si ya hay datos
    }

    console.log('Base de datos vacía. Poblando con datos de prueba...');

    // 2. Crea las Categorías
    const c1 = await Category.create({ name: "Tablas Para Compartir" });
    const c2 = await Category.create({ name: "Combos" });
    const c3 = await Category.create({ name: "Entradas" });
    const c4 = await Category.create({ name: "Hanamaki Rolls" });
    const c5 = await Category.create({ name: "Uramaki Rolls" });

    // 3. Crea los Productos
    
    // Tablas Para Compartir
    await addProduct(c1, "Sushi Sashimi Deluxe (43p)", 52900, "Sashimi mixto + battera unagi + arcoíris");
    await addProduct(c1, "Sushi para Dos (31p)", 28900, "Selección para 2 personas");
    await addProduct(c1, "Sushi para Cuatro (74p)", 58900, "Ideal para 4 comensales");
    await addProduct(c1, "Tabla Familiar (100p)", 87900, "Nuestra tabla más pedida para la familia");
    await addProduct(c1, "Tabla Vegetariana (40p)", 41900, "Rolls y nigiris vegetarianos");

    // Combos
    await addProduct(c2, "Combo Uno", 17900, "Uramaki camarón tempura x8 + gyozas");
    await addProduct(c2, "Combo Dos", 23800, "Hanamaki salmón x8 + uramaki palta x8");
    await addProduct(c2, "Combo Tres", 35900, "Mix de rolls + gyozas + bebidas");
    await addProduct(c2, "Combo Pollo Teriyaki", 21900, "Pollo teriyaki + arroz + ensalada wakame");
    await addProduct(c2, "Combo Yakisoba", 20900, "Fideos salteados estilo japonés + gyosas");

    // Entradas
    await addProduct(c3, "Gyozas de Cerdo (6u)", 4900, "Clásicas gyozas al vapor/sartén");
    await addProduct(c3, "Gyozas de Pollo (6u)", 4900, "Relleno de pollo con verduras");
    await addProduct(c3, "Bao de Cerdo", 3900, "Panecillo al vapor con cerdo desmechado");
    await addProduct(c3, "Tataki de Atún", 11900, "Lomos sellados con sésamo y ponzu");
    await addProduct(c3, "Ebi Furai (6u)", 6900, "Camarones empanizados crocantes");
    await addProduct(c3, "Wantán Frito (8u)", 5900, "Relleno de carne y verduras");

    // Hanamaki Rolls (envueltos por fuera)
    await addProduct(c4, "Hanamaki Salmón", 12900, "Roll envuelto en salmón");
    await addProduct(c4, "Hanamaki Palta", 8500, "Roll envuelto en palta cremosa");
    await addProduct(c4, "Hanamaki Camarón", 12900, "Roll envuelto en camarón");
    await addProduct(c4, "Hanamaki Atún", 11900, "Roll envuelto en atún");
    await addProduct(c4, "Hanamaki Philadelphia", 12900, "Con queso crema y salmón");
    await addProduct(c4, "Hanamaki Teriyaki", 10900, "Pollo teriyaki y palta");

    // Uramaki Rolls
    await addProduct(c5, "Uramaki Sésamo", 6900, "Clásico con sésamo tostado");
    await addProduct(c5, "California Roll", 7900, "Kanikama, palta y pepino");
    await addProduct(c5, "Tempura Camarón", 8900, "Camarón tempura y salsa especial");
    await addProduct(c5, "Ebi Palta", 7900, "Camarón cocido y palta");
    await addProduct(c5, "Spicy Tuna", 8900, "Atún picante con cebollín");
    await addProduct(c5, "Dragon Roll", 9900, "Anguila/karesansui con palta por fuera");

    console.log('¡Base de datos poblada con éxito!');

  } catch (error) {
    console.error("Error poblando la base de datos:", error);
  }
}

// Exportamos la función para que index.js pueda usarla
module.exports = { seedDatabase };