import { getSession } from "../db.js";
import db from "../db.js";

export async function addFavorite(userId, movieId) {
  const session = getSession();
  try {
    console.log("→ Füge Favorit hinzu:", userId, movieId); // Debug

    const query = `
      MATCH (u:User {userId: $userId}), (m:Movie {movieId: $movieId})
      MERGE (u)-[:FAVORITED]->(m)
    `;

    const result = await session.run(query, { 
      userId: parseInt(userId), 
      movieId: parseInt(movieId) 
    });
    console.log("→ Neo4j Ergebnis:", result.summary);

    return { message: "Favorit gespeichert" };
  } catch (error) {
    console.error("❌ Fehler bei FAVORITED:", error); // Hier sehen wir den echten Grund
    throw error;
  } finally {
    await session.close();
  }
}

export async function removeFavorite(userId, movieId) {
  // Ändere hier von db.session() zu getSession()
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (u:User {userId: $userId})-[f:FAVORITED]->(m:Movie {movieId: $movieId})
      DELETE f
      `,
      { 
        userId: parseInt(userId), 
        movieId: parseInt(movieId) 
      }
    );
    return { message: "Favorit entfernt" };
  } catch (error) {
    console.error("❌ Fehler beim Entfernen von FAVORITED:", error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function getFavoritesOfUser(userId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (u:User {userId: $userId})-[:FAVORITED]->(m:Movie)
      RETURN m {
        .movieId, .title, .genre, .description, .releaseYear, .averageRating
      } AS movie
    `, { userId });
  
    return result.records.map(r => r.get("movie"));
  } finally {
    await session.close();
  }
}
