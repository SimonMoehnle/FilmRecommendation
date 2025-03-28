import { getUserCFRecommendations } from "../services/recommendationService.js";
import { requireAnyRole } from "../services/authMiddleware.js";

export default async function recommendationRoutes(fastify, options) {
  fastify.get(
    "/users/me/recommendations/usercf",
    { preHandler: requireAnyRole(["USER", "ADMIN"]) },
    async (request, reply) => {
      const userId = request.user.userId;

      try {
        const recommendations = await getUserCFRecommendations(userId);
        return reply.send({ recommendations });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Fehler beim Erzeugen der Empfehlungen",
          details: error.message,
        });
      }
    }
  );
}
