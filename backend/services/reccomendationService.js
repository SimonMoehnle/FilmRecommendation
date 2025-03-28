import { getSession } from "../db.js";

export async function getRecommendedMovies(userId) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (me:User {userId: $userId})-[r1:RATED]->(m1:Movie)-[:BELONGS_TO]->(g:Genre)
      WHERE r1.score >= 4
      WITH me, g.genreName AS preferredGenre, count(*) AS cnt
      ORDER BY cnt DESC
      LIMIT 3

      MATCH (other:User)-[r2:RATED]->(m2:Movie)-[:BELONGS_TO]->(g2:Genre)
      WHERE g2.genreName = preferredGenre AND r2.score >= 4 AND other <> me
        AND NOT (me)-[:RATED]->(m2)

      RETURN DISTINCT m2 AS movie
      LIMIT 10
      `,
      { userId: parseInt(userId) }
    );

    const movies = result.records.map(record => {
      const m = record.get("movie").properties;
      return {
        movieId: m.movieId?.low ?? m.movieId,
        title: m.title,
        genre: m.genre,
        description: m.description,
        releaseYear: m.releaseYear?.low ?? m.releaseYear,
        averageRating: m.averageRating,
        ratingCount: m.ratingCount?.low ?? m.ratingCount
      };
    });

    return movies;
  } catch (error) {
    console.error("Fehler bei Empfehlungen:", error);
    throw error;
  } finally {
    await session.close();
  }
}
