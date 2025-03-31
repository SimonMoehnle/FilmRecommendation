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
    preHandler: [requireAnyRole(["ADMIN", "USER"])] // Authentifizierung und Rollenprüfung
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
  fastify.get("/favorites/:userId", {
    preHandler: requireAnyRole(["USER", "ADMIN"]),
  }, async (req, reply) => {
    const userId = parseInt(req.params.userId, 10);
    const favorites = await getFavoritesOfUser(userId);
    return reply.send({ favorites });
  });

  // Neue Route: Film zu Favoritenliste hinzufügen
  fastify.post("/favorites", {
    preHandler: requireAnyRole(["ADMIN", "USER"])
  }, async (req, reply) => {
    const { user } = req; // wird aus dem Token extrahiert
    const { movieId, isPublic } = req.body; // Neuer Parameter isPublic, z.B. true oder false
    const favId = `${user.id}-main`; // Beispiel-ID, evtl. später erweiterbar
  
    try {
      await db.run(
        `
        MERGE (u:User {userId: $userId})
        MERGE (m:Movie {movieId: $movieId})
        MERGE (f:FavoriteList {id: $favId})
        ON CREATE SET f.isPublic = $isPublic
        MERGE (u)-[:OWNS]->(f)
        MERGE (f)-[:INCLUDES]->(m)
        `,
        { userId: user.id, movieId: Number(movieId), favId, isPublic }
      );
      reply.send({ success: true });
    } catch (error) {
      console.error("Fehler beim Erstellen der Favoritenliste:", error);
      reply.code(500).send({ error: "Interner Serverfehler" });
    }
  });
  
}