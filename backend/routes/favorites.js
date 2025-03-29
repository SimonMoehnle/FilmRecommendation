import { addFavorite, removeFavorite, getFavoritesOfUser } from "../services/favoriteService.js";
import { requireAnyRole } from "../services/authMiddleware.js";
import db from "../db.js";

export default async function favoriteRoutes(fastify, options) {
  // Route: Film zu Favoriten hinzufügen
  fastify.post("/movies/:movieId/favorite", {
    preHandler: requireAnyRole(["USER", "ADMIN"]),
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      const movieId = parseInt(request.params.movieId, 10);
  
      console.log("Favorisieren:", { userId, movieId }); // ✅ Debug-Log
  
      if (!userId || isNaN(movieId)) {
        console.error("❌ Ungültige Daten:", { userId, movieId });
        return reply.code(400).send({ error: "Benutzer-ID oder Movie-ID fehlt" });
      }
  
      const result = await addFavorite(userId, movieId);
      return reply.send(result);
    } catch (err) {
      console.error("❌ Fehler beim Favorisieren:", err);
      return reply.code(500).send({ error: "Interner Serverfehler" });
    }
  });  

  // DELETE /movies/:id/favorite
  fastify.delete('/movies/:id/favorite', {
    preHandler: [requireAnyRole(["USER", "ADMIN"])] // Authentifizierung und Rollenprüfung
  }, async (req, reply) => {
    try {
      const userId = req.user.userId; // Benutzer-ID aus dem Token
      const movieId = parseInt(req.params.id, 10); // Film-ID aus der URL

      if (!userId || isNaN(movieId)) {
        return reply.status(400).send({ error: 'Benutzer-ID oder Film-ID fehlt' });
      }

      // Entferne den Film aus den Favoriten
      await removeFavorite(userId, movieId);
      reply.send({ message: 'Film wurde aus den Favoriten entfernt.' });
    } catch (error) {
      console.error('Fehler beim Entfernen aus Favoriten:', error);
      reply.status(500).send({ error: 'Interner Serverfehler beim Entfernen aus Favoriten' });
    }
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