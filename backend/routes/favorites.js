import { addFavorite, removeFavorite, getFavoritesOfUser } from "../services/favoriteService.js";
import { requireAnyRole } from "../services/authMiddleware.js";

export default async function favoriteRoutes(fastify, options) {
  // Route: Film zu Favoriten hinzufügen
  fastify.post("/movies/:movieId/favorite", {
    preHandler: requireAnyRole(["USER", "ADMIN"]),
  }, async (req, reply) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.movieId, 10);
    const result = await addFavorite(userId, movieId);
    return reply.send(result);
  });

  // Route: Film aus Favoriten entfernen
  fastify.delete("/movies/:movieId/favorite", {
    preHandler: requireAnyRole(["USER", "ADMIN"]),
  }, async (req, reply) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.movieId, 10);
    const result = await removeFavorite(userId, movieId);
    return reply.send(result);
  });

  // Route: Favoritenliste eines Benutzers abrufen
  fastify.get("/favorites/:userId", async (req, reply) => {
    const userId = parseInt(req.params.userId, 10);
    const favorites = await getFavoritesOfUser(userId);
    return reply.send({ favorites });
  });

  // Neue Route: Film zu Favoritenliste hinzufügen
  fastify.post("/favorites", async (req, reply) => {
    const { user } = req; // wird aus Token extrahiert
    const { movieId } = req.body;

    const favId = `${user.id}-main`; // z. B. statisch "main", oder später auswählbar

    await db.run(
      `MERGE (u:User {userId: $userId})
       MERGE (m:Movie {movieId: $movieId})
       MERGE (f:FavoriteList {id: $favId})
       MERGE (u)-[:OWNS]->(f)
       MERGE (f)-[:INCLUDES]->(m)`,
      { userId: user.id, movieId: Number(movieId), favId }
    );

    reply.send({ success: true });
  });

  // Neue Route: Filme aus einer bestimmten Favoritenliste abrufen
  fastify.get("/favorites/:userId/:favId", async (req, reply) => {
    const { userId, favId } = req.params;

    const result = await db.run(
      `MATCH (u:User {userId: $userId})-[:OWNS]->(f:FavoriteList {id: $favId})-[:INCLUDES]->(m:Movie)
       RETURN m`,
      { userId, favId }
    );

    const movies = result.records.map((r) => r.get("m").properties);
    reply.send({ movies });
  });
}