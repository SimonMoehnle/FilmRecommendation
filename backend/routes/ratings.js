// ratingRoutes.js
import { rateMovie, deleteRating } from "../services/ratingService.js";

export default async function ratingRoutes(fastify, options) {
  // Route: Film bewerten (oder Bewertung aktualisieren)
  fastify.post("/movies/:movieId/rate", async (request, reply) => {
    const { movieId } = request.params;
    const { userId, score, review } = request.body;
    
    // Basis-Validierung
    if (!userId || score === undefined) {
      return reply.status(400).send({ error: "userId und score sind erforderlich." });
    }
    if (score < 1 || score > 5) {
      return reply.status(400).send({ error: "Score muss zwischen 1 und 5 liegen." });
    }
    
    try {
      const result = await rateMovie(userId, movieId, score, review || "");
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: "Database error",
        details: error.message
      });
    }
  });

  // Route: Bewertung löschen
  fastify.delete("/movies/:movieId/rate", async (request, reply) => {
    const { movieId } = request.params;
    const { userId } = request.body;
    
    if (!userId) {
      return reply.status(400).send({ error: "userId ist erforderlich." });
    }
    
    try {
      const result = await deleteRating(userId, movieId);
      if (result.error) {
        return reply.status(404).send(result);
      }
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: "Database error",
        details: error.message
      });
    }
  });
}