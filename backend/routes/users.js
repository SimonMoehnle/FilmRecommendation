import { getAllUsers, registerUser, deleteUser } from "../services/userService.js"; // Import der Service-Funktionen

export default async function userRoutes(fastify, options) {
    // GET /users – Alle Nutzer abrufen
    fastify.get("/users", async (request, reply) => {
        try {
            const users = await getAllUsers(); 
            return reply.send({ users });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: "Datenbankfehler", details: error.message });
        }
    });

    // POST /register/user – Neuen Nutzer registrieren
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

    // DELETE /delete/user/:userId – Nutzer löschen
    fastify.delete("/delete/user/:userId", async (request, reply) => {
        const { userId } = request.params;
        try {
            const result = await deleteUser(userId);
            if (result.error) {
                return reply.status(404).send(result);
            }
            return reply.status(200).send(result);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: "Datenbankfehler", details: error.message });
        }
    });

    // GET /profile/:userId – Benutzerprofil anzeigen (inkl. Bewertungen)
    fastify.get("/profile/:userId", async (request, reply) => {
        const { userId } = request.params;
        try {
        const profile = await getUserProfile(userId);
        return reply.send(profile);
        } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Fehler beim Laden des Benutzerprofils",
            details: error.message
        });
        }
    });
  
}
