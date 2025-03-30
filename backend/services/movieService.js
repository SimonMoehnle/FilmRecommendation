import { driver } from "../db.js";
import { requireAnyRole } from "./authMiddleware.js";

// Funktion: Alle Filme abrufen
export async function getAllMovies() {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (m:Movie) RETURN m");

    return result.records.map(record => {
      const props = record.get("m").properties;

      return {
        movieId: props.movieId?.low ?? props.movieId,
        title: props.title,
        genre: props.genre,
        description: props.description,
        releaseYear: props.releaseYear?.low ?? props.releaseYear,
        averageRating: props.averageRating,
        ratingCount: props.ratingCount?.low ?? props.ratingCount
      };
    });

  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    throw error;
  } finally {
    await session.close();
  }
}


// Funktion: Einen Film anhand der movieId abrufen
export async function getMovieById(movieId) {
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (m:Movie {movieId: $movieId}) RETURN m",
      { movieId }
    );
    if (result.records.length === 0) {
      return null;
    }

    const raw = result.records[0].get("m").properties;

    return {
      movieId: raw.movieId?.low ?? raw.movieId,
      title: raw.title,
      genre: raw.genre,
      description: raw.description,
      releaseYear: raw.releaseYear?.low ?? raw.releaseYear,
      averageRating: raw.averageRating?.toNumber?.() ?? raw.averageRating,
      ratingCount: raw.ratingCount?.low ?? raw.ratingCount
    };
  } catch (error) {
    console.error("Fehler beim Abrufen des Films:", error);
    throw error;
  } finally {
    await session.close();
  }
}


// Funktion: Einen neuen Film erstellen
export async function createMovie(title, genre, description, releaseYear) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      // 1. Ermittle den aktuellen höchsten movieId-Wert (oder 0, wenn keine Filme existieren)
      MATCH (m:Movie)
      WITH coalesce(max(m.movieId), 0) AS maxId
      
      // 2. Merge den Counter und passe seinen Wert an, falls nötig
      MERGE (counter:Counter {id: "movieId"})
      ON CREATE SET counter.value = maxId
      ON MATCH SET counter.value = CASE WHEN counter.value < maxId THEN maxId ELSE counter.value END
      WITH counter
      
      // 3. Erhöhe den Counter um 1 und hole den neuen Wert als newMovieId
      WITH counter, counter.value AS currentValue
      SET counter.value = currentValue + 1
      WITH counter.value AS newMovieId
      
      // 4. Erstelle den neuen Film mit der eindeutigen movieId
      CREATE (m:Movie {
        movieId: newMovieId, 
        title: $title,
        genre: $genre, 
        description: $description, 
        releaseYear: toInteger($releaseYear), 
        averageRating: 0.0, 
        ratingCount: 0
      })
      RETURN m { .movieId, .title, .description, .genre, .releaseYear, .averageRating, .ratingCount } AS movie
      `,
      { title, genre, description, releaseYear }
    );

    const rawMovie = result.records[0].get("movie");

    const movie = {
      movieId: rawMovie.movieId?.low ?? rawMovie.movieId,
      title: rawMovie.title,
      genre: rawMovie.genre,
      description: rawMovie.description,
      releaseYear: rawMovie.releaseYear?.low ?? rawMovie.releaseYear,
      averageRating: rawMovie.averageRating,
      ratingCount: rawMovie.ratingCount?.low ?? rawMovie.ratingCount
    };

    return {
      message: "Film erfolgreich erstellt!",
      ...movie
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
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (m:Movie {movieId: toInteger($movieId)})
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
  const session = driver.session();
  try {
    // Existenz prüfen
    const movieExists = await session.run(
      "MATCH (m:Movie {movieId: toInteger($movieId)}) RETURN m",
      { movieId }
    );
    if (movieExists.records.length === 0) {
      return { error: "Film nicht gefunden!" };
    }
    await session.run(
      "MATCH (m:Movie {movieId: toInteger($movieId)}) DETACH DELETE m",
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

export async function deleteAllMovies() {
  const session = driver.session();
  try {
    await session.run("MATCH (m:Movie) DETACH DELETE m");
    return { message: "Alle Filme wurden erfolgreich gelöscht." };
  } catch (error) {
    console.error("Fehler beim Löschen aller Filme:", error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function getMoviesByGenre(genre) {
  const session = driver.session();
  try {
    console.log("Genre-Filter:", genre); // <-- DEBUG

    const result = await session.run(
      `
      MATCH (m:Movie {genre: $genre})
      RETURN m
      `,
      { genre }
    );

    console.log("Anzahl gefundener Filme:", result.records.length); // <-- DEBUG

    return result.records.map(record => {
      const props = record.get("m").properties;

      return {
        movieId: props.movieId?.low ?? props.movieId,
        title: props.title,
        genre: props.genre,
        description: props.description,
        releaseYear: props.releaseYear?.low ?? props.releaseYear,
        averageRating: props.averageRating,
        ratingCount: props.ratingCount?.low ?? props.ratingCount
      };
    });

  } catch (error) {
    console.error("Fehler beim Abrufen der Filme nach Genre:", error);
    throw error;
  } finally {
    await session.close();
  }
}





