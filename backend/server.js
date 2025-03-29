import Fastify from "fastify";
import cors from "@fastify/cors";
import userRoutes from "./routes/users.js"; // Importierte Routen
import movieRoutes from "./routes/movies.js";
import ratingRoutes from "./routes/ratings.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import jwt from "@fastify/jwt";
import dotenv from "dotenv"; //lädt .env Datei
import adminRoutes from "./routes/admin.js";
import favoriteRoutes from "./routes/favorites.js";
dotenv.config(); //lädt .env Datei

const fastify = Fastify({ logger: true });

// ✅ CORS aktivieren und nur Zugriff von Frontend auf Port 4000 erlauben

fastify.register(cors, {
  origin: ["http://localhost:3000", "http://localhost:7474"], // Erlaubt Frontend auf Port 3000
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

fastify.register(jwt, {
    secret: process.env.JWT_SECRET
});


// ✅ User-Routen registrieren
fastify.register(userRoutes);
fastify.register(movieRoutes);
fastify.register(ratingRoutes);
fastify.register(recommendationRoutes);
fastify.register(adminRoutes)
fastify.register(favoriteRoutes);

// ✅ Server starten
const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: "0.0.0.0" });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
