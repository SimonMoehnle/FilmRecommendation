import { getAllUsers, registerUser, deleteUser, updateUserProfile } from "../services/userService.js"; // Import der Service-Funktionen
import bcrypt from "bcryptjs";
import { getSession } from "../db.js";
import jwt from "jsonwebtoken";
import { requireAnyRole } from "../services/authMiddleware.js";


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

    // Route: Benutzerprofil aktualisieren
    fastify.put(
        "/users/me/update",
        {
          preHandler: requireAnyRole(["USER", "ADMIN"]),
        },
        async (request, reply) => {
          const userId = request.user.userId;
          const { name, email, password } = request.body;
      
          if (!name && !email && !password) {
            return reply.status(400).send({ error: "Mindestens ein Feld (Name, E-Mail oder Passwort) muss angegeben werden." });
          }
      
          try {
            const updatedUser = await updateUserProfile(userId, { name, email, password });
            return reply.status(200).send(updatedUser);
          } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
              error: "Profil konnte nicht aktualisiert werden.",
              details: error.message,
            });
        }
    });
      

    fastify.post("/login", async (request, reply) => {
      const { email, password } = request.body;
      const session = getSession();
    
      const result = await session.run("MATCH (u:User {email: $email}) RETURN u", { email });
    
      if (result.records.length === 0) {
        return reply.status(401).send({ error: "Ungültige Anmeldedaten" });
      }
    
      const user = result.records[0].get("u").properties;
    
      // ⛔ Check: ist der User gesperrt?
      if (user.isBlocked === true) {
        return reply.status(403).send({ error: "Dein Konto wurde gesperrt!" });
      }
    
      // ✅ Passwort prüfen
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return reply.status(401).send({ error: "Falsches Passwort" });
      }
    
      // 🔐 Token generieren
      const token = jwt.sign(
        {
          userId: user.userId?.low ?? user.userId,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    
      return reply.send({ message: "Login erfolgreich", token });
    });
}
