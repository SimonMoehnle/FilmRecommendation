import Fastify from "fastify";
import cors from "@fastify/cors";
import userRoutes from "./routes/users.js"; // Importierte Routen
import movieRoutes from "./routes/movies.js";
import ratingRoutes from "./routes/ratings.js";

const fastify = Fastify({ logger: true });

// ✅ CORS aktivieren und nur Zugriff von Frontend auf Port 4000 erlauben
fastify.register(cors, {
    origin: "http://localhost:4000", // Nur Anfragen von Frontend auf Port 4000 erlauben
    methods: ["GET", "POST", "PUT", "DELETE"], // Erlaubt diese Methoden
    allowedHeaders: ["Content-Type", "Authorization"], // Erlaubt bestimmte Header
    credentials: true, // Falls du Cookies oder Authentifizierung nutzt
});

// ✅ User-Routen registrieren
fastify.register(userRoutes);
fastify.register(movieRoutes);
fastify.register(ratingRoutes);

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
