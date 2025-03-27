// ratingService.js
import { getSession } from "../db.js";

// Funktion: Einen Film bewerten (erstellt oder aktualisiert die RATED-Relationship)
export async function rateMovie(userId, movieId, score, review) {
  const session = getSession();
  try {
    // Prüfen, ob bereits eine Bewertung vorliegt
    const existingResult = await session.run(
      "MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId}) RETURN r",
      { userId, movieId }
    );

    if (existingResult.records.length > 0) {
      // Existierende Bewertung aktualisieren
      await session.run(
        `MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId})
         SET r.score = toInteger($score), 
             r.review = $review, 
             r.ratedAt = datetime()
         RETURN r`,
         { userId, movieId, score, review }
      );
      return { message: "Bewertung erfolgreich aktualisiert." };
    } else {
      // Neue Bewertung anlegen
      await session.run(
        `MATCH (u:User {userId: $userId}), (m:Movie {movieId: $movieId})
         CREATE (u)-[:RATED {
           score: toInteger($score), 
           review: $review, 
           ratedAt: datetime()
         }]->(m)
         RETURN m.movieId AS movieId`,
         { userId, movieId, score, review }
      );
      return { message: "Bewertung erfolgreich angelegt." };
    }
  } catch (error) {
    console.error("Fehler beim Bewerten des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Funktion: Eine Bewertung löschen
export async function deleteRating(userId, movieId) {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId})
       DELETE r
       RETURN count(r) AS deletedCount`,
       { userId, movieId }
    );
    const deletedCount = result.records[0].get("deletedCount").toNumber();
    if (deletedCount > 0) {
      return { message: "Bewertung erfolgreich gelöscht." };
    } else {
      return { error: "Bewertung nicht gefunden." };
    }
  } catch (error) {
    console.error("Fehler beim Löschen der Bewertung:", error);
    throw error;
  } finally {
    await session.close();
  }
}