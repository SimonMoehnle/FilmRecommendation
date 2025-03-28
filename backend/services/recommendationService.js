import { driver } from "../db.js";

export async function getUserCFRecommendations(userId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (me:User {userId: $userId})-[:RATED]->(m:Movie)<-[:RATED]-(other:User)
      WHERE me <> other

      MATCH (other)-[r:RATED]->(rec:Movie)
      WHERE r.score >= 4 AND NOT EXISTS {
        MATCH (me)-[:RATED]->(rec)
      }

      RETURN rec {
        .movieId,
        .title,
        .genre,
        .description,
        .releaseYear,
        .averageRating,
        .ratingCount
      }, avg(r.score) AS relevance
      ORDER BY relevance DESC
      LIMIT 10
      `,
      { userId }
    );

    return result.records.map((record) => {
      const rec = record.get("rec");
      const relevance = record.get("relevance");

      return {
        movieId: rec.movieId?.toNumber?.() ?? rec.movieId,
        title: rec.title,
        genre: rec.genre,
        description: rec.description,
        releaseYear: rec.releaseYear?.toNumber?.() ?? rec.releaseYear,
        averageRating: rec.averageRating?.toNumber?.() ?? rec.averageRating,
        ratingCount: rec.ratingCount?.toNumber?.() ?? rec.ratingCount,
        relevance: relevance?.toNumber?.() ?? relevance,
      };
    });
  } catch (error) {
    console.error("Fehler bei UserCF:", error);
    throw error;
  } finally {
    await session.close();
  }
}
