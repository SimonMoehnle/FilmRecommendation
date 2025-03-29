export async function addFavorite(userId, movieId) {
    const session = getSession();
    try {
      await session.run(`
        MATCH (u:User {userId: $userId}), (m:Movie {movieId: $movieId})
        MERGE (u)-[:FAVORITED]->(m)
      `, { userId, movieId });
      return { message: "Favorit gespeichert" };
    } finally {
      await session.close();
    }
  }
  
  export async function removeFavorite(userId, movieId) {
    const session = getSession();
    try {
      await session.run(`
        MATCH (u:User {userId: $userId})-[f:FAVORITED]->(m:Movie {movieId: $movieId})
        DELETE f
      `, { userId, movieId });
      return { message: "Favorit entfernt" };
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
  