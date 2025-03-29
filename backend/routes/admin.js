import { registerAdmin } from "../services/adminService.js";
import { blockUser } from "../services/userService.js"; // Importiere blockUser, falls es verwendet wird
import { requireAnyRole } from "../services/authMiddleware.js"; // Importiere requireAnyRole

export default async function adminRoutes(fastify, options) {
  // Route zur Admin-Registrierung
  fastify.post(
    "/admin/register",
    async (request, reply) => {
      const { name, email, password } = request.body;

      if (!name || !email || !password) {
        return reply.status(400).send({
          error: "Name, E-Mail und Passwort sind erforderlich.",
        });
      }

      try {
        const result = await registerAdmin(name, email, password);

        if (result.error) {
          return reply.status(400).send({ error: result.error });
        }

        return reply.status(201).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Fehler bei der Admin-Registrierung",
          details: error.message,
        });
      }
    }
  );

  // Route zum Blockieren/Entsperren von Usern
  fastify.patch(
    "/admin/users/:userId/block",
    { preHandler: requireAnyRole(["ADMIN"]) }, // Sicherstellen, dass requireAnyRole korrekt importiert ist
    async (request, reply) => {
      const { userId } = request.params;
      const { block } = request.body; // boolean: true oder false

      try {
        const result = await blockUser(userId, block);
        return reply.send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Fehler beim Blockieren/Entsperren" });
      }
    }
  );
}
