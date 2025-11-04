require('dotenv').config(); 
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
const { seedDatabase } = require('./seed.js');


const typeDefs = require('./typeDefs.js');
const resolvers = require('./resolvers.js');


const MONGODB_URI = process.env.MONGODB_URI;


const server = new ApolloServer({
  typeDefs,
  resolvers,
});


async function startServer() {
  try {
    
    if (!MONGODB_URI) {
      throw new Error("No se encontró la MONGODB_URI en el archivo .env. Revisa tu archivo .env");
    }

    await mongoose.connect(MONGODB_URI);
    console.log('🚀 Conectado a MongoDB');

    await seedDatabase();

    
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      
    });
    
    console.log(`🚀 Servidor backend listo en ${url}`);

  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();