import { getSession } from "../db.js";

// Funktion: Alle Filme abrufen
export async function getAllMovies() {
  const session = getSession();
  try {
    const result = await session.run("MATCH (m:Movie) RETURN m");
    return result.records.map(record => record.get("m").properties);
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Funktion: Einen Film anhand der movieId abrufen
export async function getMovieById(movieId) {
  const session = getSession();
  try {
    const result = await session.run(
      "MATCH (m:Movie {movieId: $movieId}) RETURN m",
      { movieId }
    );
    if (result.records.length === 0) {
      return null;
    }
    return result.records[0].get("m").properties;
  } catch (error) {
    console.error("Fehler beim Abrufen des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Funktion: Einen neuen Film erstellen
export async function createMovie(title, description, releaseYear) {
  const session = getSession();
  try {
    // Counter verwenden, um eine eindeutige movieId zu generieren (analog zur User-Erstellung)
    const result = await session.run(
      `
      MERGE (counter:Counter {id: "movieId"}) 
      ON CREATE SET counter.value = 1 
      ON MATCH SET counter.value = counter.value + 1 
      WITH counter.value AS newId
      CREATE (m:Movie {
        movieId: "M" + newId, 
        title: $title, 
        description: $description, 
        releaseYear: toInteger($releaseYear), 
        averageRating: 0.0, 
        ratingCount: 0, 
        createdAt: datetime(), 
        updatedAt: datetime()
      })
      RETURN m.movieId AS movieId
      `,
      { title, description, releaseYear }
    );
    return {
      message: "Film erfolgreich erstellt!",
      movieId: result.records[0].get("movieId")
    };
  } catch (error) {
    console.error("Fehler beim Erstellen des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Funktion: Einen bestehenden Film aktualisieren
export async function updateMovie(movieId, title, description, releaseYear) {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (m:Movie {movieId: $movieId})
      SET m.title = $title, 
          m.description = $description, 
          m.releaseYear = toInteger($releaseYear), 
          m.updatedAt = datetime()
      RETURN m.movieId AS movieId
      `,
      { movieId, title, description, releaseYear }
    );
    if (result.records.length === 0) {
      return { error: "Film nicht gefunden!" };
    }
    return {
      message: "Film erfolgreich aktualisiert!",
      movieId
    };
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Funktion: Einen Film löschen
export async function deleteMovie(movieId) {
  const session = getSession();
  try {
    // Existenz prüfen
    const movieExists = await session.run(
      "MATCH (m:Movie {movieId: $movieId}) RETURN m",
      { movieId }
    );
    if (movieExists.records.length === 0) {
      return { error: "Film nicht gefunden!" };
    }
    await session.run(
      "MATCH (m:Movie {movieId: $movieId}) DETACH DELETE m",
      { movieId }
    );
    return {
      message: "Film erfolgreich gelöscht!",
      movieId
    };
  } catch (error) {
    console.error("Fehler beim Löschen des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}