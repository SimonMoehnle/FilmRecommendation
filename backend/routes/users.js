import { getAllUsers, registerUser, deleteUser } from "../services/userService.js"; // ✅ Import der Service-Funktionen

export default async function userRoutes(fastify, options) {
    
    fastify.get("/users", async (request, reply) => {
        try {
            const users = await getAllUsers(); 
            return reply.send({ users });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: "Database error", details: error.message });
        }
    });

    fastify.post("/register/user", async (request, reply) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return reply.status(400).send({ error: "Name, E-Mail und Passwort sind erforderlich!" });
        }

        try {
            const result = await registerUser(name, email, password);
            if (result.error) {
                return reply.status(400).send(result);
            }
            return reply.status(201).send(result);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: "Interner Serverfehler", details: error.message });
        }
    });

    fastify.delete("/delete/user/:userId", async (request, reply) => {
        const { userId } = request.params; // 🛠 `userId` aus der URL holen
        
        try {
            const result = await deleteUser(userId);
            if (result.error) {
                return reply.status(404).send(result); // Falls User nicht existiert
            }
            return reply.status(200).send(result); // Erfolgreich gelöscht
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: "Database error", details: error.message });
        }
    });
}

