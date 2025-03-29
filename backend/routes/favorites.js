import { addFavorite, removeFavorite, getFavoritesOfUser } from "../services/favoriteService.js";
import { requireAnyRole } from "../services/authMiddleware.js";

export default async function favoriteRoutes(fastify, options) {
  fastify.post("/movies/:movieId/favorite", {
    preHandler: requireAnyRole(["USER", "ADMIN"]),
  }, async (req, reply) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.movieId, 10);
    const result = await addFavorite(userId, movieId);
    return reply.send(result);
  });

  fastify.delete("/movies/:movieId/favorite", {
    preHandler: requireAnyRole(["USER", "ADMIN"]),
  }, async (req, reply) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.movieId, 10);
    const result = await removeFavorite(userId, movieId);
    return reply.send(result);
  });

  // öffentlich zugängliche Favoritenliste
  fastify.get("/favorites/:userId", async (req, reply) => {
    const userId = parseInt(req.params.userId, 10);
    const favorites = await getFavoritesOfUser(userId);
    return reply.send({ favorites });
  });
}