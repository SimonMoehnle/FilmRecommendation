import { getRecommendedMovies } from "../services/recommendationService.js";
import { requireAnyRole } from "../middleware/roles.js";

export default async function recommendationRoutes(fastify) {
  fastify.get("/recommendations", { preHandler: requireAnyRole(["USER"]) }, async (request, reply) => {
    const userId = request.user.userId;
    try {
      const movies = await getRecommendedMovies(userId);
      return reply.send({ recommended: movies });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: "Fehler beim Abrufen von Empfehlungen",
        details: error.message
      });
    }
  });
}
