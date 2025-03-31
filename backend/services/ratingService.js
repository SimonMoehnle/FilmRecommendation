import { driver } from "../db.js";

export async function rateMovie(userId, movieId, score, review) {
  const session = driver.session();
  try {
    // Prüfen, ob User und Movie existieren
    const validationResult = await session.run(
      `MATCH (u:User {userId: $userId}), (m:Movie {movieId: $movieId})
       RETURN u, m`,
      { userId, movieId }
    );

    if (validationResult.records.length === 0) {
      return { error: "User oder Film wurde nicht gefunden.", status: 404 };
    }

    // Prüfen, ob bereits eine Bewertung existiert
    const existingResult = await session.run(
      `MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId})
       RETURN r`,
      { userId, movieId }
    );

    if (existingResult.records.length > 0) {
      // Bewertung aktualisieren
      await session.run(
        `MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId})
         SET r.score = toInteger($score), 
             r.review = $review, 
             r.ratedAt = datetime()
         RETURN r`,
        { userId, movieId, score, review }
      );
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
    }

    // Durchschnittsbewertung neu berechnen
    await session.run(
      `MATCH (:User)-[r:RATED]->(m:Movie {movieId: $movieId})
       WITH m, avg(r.score) AS newAvg, count(r) AS ratingCount
       SET m.averageRating = newAvg,
           m.ratingCount = ratingCount`
      , { movieId }
    );

    return {
      message: existingResult.records.length > 0
        ? "Bewertung erfolgreich aktualisiert."
        : "Bewertung erfolgreich angelegt."
    };
  } catch (error) {
    console.error("Fehler beim Bewerten des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}


export async function getReviews(movieId) {
  const session = driver.session();
  try {
    // Alle Bewertungen (mit Benutzername, Score, Reviewtext und Zeitstempel) abfragen
    const result = await session.run(
      `MATCH (u:User)-[r:RATED]->(m:Movie {movieId: $movieId})
       RETURN u.name AS user, u.userId AS userId, r.score AS score, r.review AS review, r.ratedAt AS ratedAt
       ORDER BY r.ratedAt DESC`,
      { movieId }
    );
    const reviews = result.records.map(record => ({
      user: record.get("user"),
      score: record.get("score"),
      review: record.get("review"),
      ratedAt: record.get("ratedAt")
    }));
    return reviews;
  } catch (error) {
    console.error("Fehler beim Abrufen der Bewertungen:", error);
    throw error;
  } finally {
    await session.close();
  }
}