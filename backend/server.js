// server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import userRoutes from "./routes/users.js"; // Importierte Routen
import { driver, createSchema } from "./db.js"; // Import der DB-Anbindung

const fastify = Fastify({ logger: true });

// Dekoriere die Fastify-Instanz mit dem Neo4j-Driver,
// damit dieser in den Routen verfügbar ist.
fastify.decorate('neo4jDriver', driver);

// ✅ CORS aktivieren und nur Zugriff von Frontend auf Port 4000 erlauben
fastify.register(cors, {
    origin: "http://localhost:4000", // Nur Anfragen von Frontend auf Port 4000 erlauben
    methods: ["GET", "POST", "PUT", "DELETE"], // Erlaubte Methoden
    allowedHeaders: ["Content-Type", "Authorization"], // Erlaubte Header
    credentials: true, // Falls Cookies oder Authentifizierung genutzt werden
});

fastify.register(userRoutes);

const start = async () => {
    try {
        // Erstelle das konzeptionelle Schema in der lokalen Neo4j-Datenbank
        await createSchema();
        
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Server läuft auf Port 3000");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
