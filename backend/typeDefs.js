const typeDefs = `#graphql

  # --- TUS TIPOS DE DATOS ---
  # (Basados en tus modelos de Mongoose)

  type Category {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    category_id: ID!
    name: String!
    price: Float!
    description: String
    image: String
    category: Category # Podemos "popular" la categoría
  }

  # Para el carrito y los items del pedido
  type CartItem {
    product_id: ID!
    qty: Int!
    product: Product # Detalle del producto en el carrito
    subtotal: Float
  }

  type Order {
    id: ID!
    code: String!
    user_id: ID
    total: Float!
    status: String!
    created_at: String!
    items: [CartItem] 
  }

  type User {
    id: ID!
    email: String!
    name: String!
  }

  # Respuesta estándar para auth
  type AuthPayload {
    ok: Boolean!
    msg: String
    user: User
    # token: String # En un futuro, aquí devolverías un JWT
  }

  # --- QUERIES (Consultas "GET") ---
  # Lo que el frontend puede "pedir"
  type Query {
    categories: [Category]
    products(category: ID, q: String): [Product]
    product(id: ID!): Product
    cart(userId: ID!): [CartItem]
    order(id: ID!): Order
    lastOrder(userId: ID!): Order
    paymentConfig: Boolean # Para b14_config_pago_rt.js
  }

  # --- MUTATIONS (Acciones "POST/DELETE") ---
  # Lo que el frontend puede "hacer"
  type Mutation {
    # Auth (b01, b02, b03)
    register(name: String!, email: String!, pass: String!): AuthPayload
    login(email: String!, pass: String!): AuthPayload
    recover(email: String!): AuthPayload

    # Cart (b06, b10, storage.js)
    addToCart(userId: ID!, productId: ID!, qty: Int): Boolean
    decFromCart(userId: ID!, productId: ID!): Boolean
    clearCart(userId: ID!): Boolean

    # Order (b13)
    createOrder(userId: ID!): Order

    # Admin (b14) - Lo simplificaremos por ahora
  }
`;

module.exports = typeDefs;