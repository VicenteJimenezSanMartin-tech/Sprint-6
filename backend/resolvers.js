const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// Un helper para simular el "CURRENT_USER_ID" de tu api_local.js
// En una app real, obtendrías esto de un token (JWT).
const getDemoUser = async (userId) => {
  if (userId) return User.findById(userId);
  
  // Busca el usuario demo
  let demoUser = await User.findOne({ email: "demo@tokyo.local" });
  
  // Si no existe, lo crea
  if (!demoUser) {
    console.log("Creando usuario demo...");
    demoUser = await User.create({ 
      email: "demo@tokyo.local", 
      name: "Demo User", 
      pass: "demo" // ¡En producción, esto debe ser "hasheado"!
    });
  }
  return demoUser;
}

// --- RESOLVERS ---
const resolvers = {
  Query: {
    // Devuelve todas las categorías
    categories: async () => await Category.find(),
    
    // Devuelve productos, con filtros opcionales
    products: async (_, { category, q }) => {
      const filter = {};
      if (category) filter.category_id = category;
      if (q) {
        // Búsqueda "case-insensitive" por nombre o descripción
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }
      return Product.find(filter); // No populamos aquí para velocidad
    },
    
    // Devuelve un solo producto por ID
    product: async (_, { id }) => await Product.findById(id),
    
    // Devuelve el carrito del usuario
    cart: async (_, { userId }) => {
      // Usamos .populate() para traer los datos de los productos
      const user = await getDemoUser(userId);
      if (!user) return [];

      await user.populate('cart.product_id');
      
      // Mapeamos al formato que espera el frontend (con subtotal)
      return user.cart.map(item => ({
        product_id: item.product_id._id,
        qty: item.qty,
        product: item.product_id, 
        subtotal: (item.product_id.price || 0) * item.qty
      }));
    },
    
    order: async (_, { id }) => await Order.findById(id),
    lastOrder: async (_, { userId }) => await Order.findOne({ user_id: userId }).sort({ created_at: -1 }),
    
    
    paymentConfig: () => true,
  },

  Mutation: {
    
    register: async (_, { name, email, pass }) => {
      const exists = await User.findOne({ email });
      if (exists) return { ok: false, msg: "Email ya existe" };
      const user = await User.create({ name, email, pass });
      return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
    },
    login: async (_, { email, pass }) => {
      const user = await User.findOne({ email, pass });
      if (!user) return { ok: false, msg: "Credenciales inválidas" };
      return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
    },
    recover: async (_, { email }) => {
      const user = await User.findOne({ email });
      return { ok: !!user, msg: user ? "Enlace enviado (simulado)" : "Email no encontrado" };
    },

    
    addToCart: async (_, { userId, productId, qty = 1 }) => {
      const user = await getDemoUser(userId);
      const itemIndex = user.cart.findIndex(item => String(item.product_id) === String(productId));
      
      if (itemIndex > -1) {
        
        user.cart[itemIndex].qty += qty;
      } else {
        
        user.cart.push({ product_id: productId, qty });
      }
      await user.save();
      return true;
    },
    decFromCart: async (_, { userId, productId }) => {
      const user = await getDemoUser(userId);
      const itemIndex = user.cart.findIndex(item => String(item.product_id) === String(productId));

      if (itemIndex > -1) {
        user.cart[itemIndex].qty -= 1;
        
        if (user.cart[itemIndex].qty <= 0) {
          user.cart.splice(itemIndex, 1);
        }
      }
      await user.save();
      return true;
    },
    clearCart: async (_, { userId }) => {
      const user = await getDemoUser(userId);
      user.cart = [];
      await user.save();
      return true;
    },

    
    createOrder: async (_, { userId }) => {
      const user = await getDemoUser(userId).populate('cart.product_id');
      if (user.cart.length === 0) throw new Error("Carrito vacío");

      
      let total = 0;
      const orderItems = user.cart.map(item => {
        const price = item.product_id.price;
        total += price * item.qty;
        return {
          product_id: item.product_id._id,
          name: item.product_id.name,
          price: price,
          qty: item.qty
        };
      });

      const order = await Order.create({
        user_id: user._id,
        code: "TN-" + Date.now().toString().slice(-6), 
        total: total,
        status: "en_preparacion",
        items: orderItems
      });

      
      user.cart = [];
      await user.save();

      return order;
    }
  },


  Product: {
    category: (parent) => Category.findById(parent.category_id),
  }
};

module.exports = resolvers;