// ratingRoutes.js
import { rateMovie, getReviews } from "../services/ratingService.js";
import { requireAnyRole } from "../services/authMiddleware.js";

export default async function ratingRoutes(fastify, options) {
  // Route: Film bewerten (oder Bewertung aktualisieren)
  fastify.post(
    "/movies/:movieId/rate",
    {
      preHandler: requireAnyRole(["USER", "ADMIN"]),
    },
    async (request, reply) => {
      console.log("eingeloggter user:", request.user);
      const { movieId } = request.params;
      const numericMovieId = parseInt(movieId, 10);
      const { score, review } = request.body;
      const userId = request.user.userId; // 👈 aus dem JWT

      // Validierung
      if (isNaN(numericMovieId)) {
        return reply.status(400).send({ error: "movieId muss eine gültige Zahl sein." });
      }

      if (score === undefined || score < 1 || score > 5) {
        return reply.status(400).send({ error: "Score muss zwischen 1 und 5 liegen." });
      }

      try {
        const result = await rateMovie(userId, numericMovieId, score, review || "");

        if (result.status === 404) {
          return reply.status(404).send({ error: result.error });
        }

        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message,
        });
      }
  });

  // Route: Bewertungen zu einem Film abrufen
  fastify.get("/movies/:movieId/reviews", {
    preHandler: requireAnyRole(["ADMIN", "USER"])       //Bewertung darf nur der Admin löschen
  }, async (request, reply) => {
    const movieId = parseInt(request.params.movieId, 10);
    try {
      const reviews = await getReviews(movieId);
      return reply.send({ reviews });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: "Fehler beim Abrufen der Bewertungen.",
        details: error.message,
      });
    }
  });
}