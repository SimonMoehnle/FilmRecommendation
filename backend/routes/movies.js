import {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
  } from "../services/movieService.js";
  
  export default async function movieRoutes(fastify, options) {
    // Route: Alle Filme abrufen
    fastify.get("/movies", async (request, reply) => {
      try {
        const movies = await getAllMovies();
        return reply.send({ movies });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message
        });
      }
    });
  
    // Route: Einzelnen Film anhand der movieId abrufen
    fastify.get("/movies/:movieId", async (request, reply) => {
      const { movieId } = request.params;
      try {
        const movie = await getMovieById(movieId);
        if (!movie) {
          return reply.status(404).send({ error: "Film nicht gefunden!" });
        }
        return reply.send({ movie });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message
        });
      }
    });
  
    // Route: Neuen Film erstellen
    fastify.post("/movies", async (request, reply) => {
      const { title, description, releaseYear } = request.body;
      if (!title || !description || !releaseYear) {
        return reply.status(400).send({
          error: "Title, Beschreibung und Erscheinungsjahr sind erforderlich!"
        });
      }
      try {
        const result = await createMovie(title, description, releaseYear);
        return reply.status(201).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message
        });
      }
    });
  
    // Route: Bestehenden Film aktualisieren
    fastify.put("/movies/:movieId", async (request, reply) => {
      const { movieId } = request.params;
      const { title, description, releaseYear } = request.body;
      if (!title || !description || !releaseYear) {
        return reply.status(400).send({
          error: "Title, Beschreibung und Erscheinungsjahr sind erforderlich!"
        });
      }
      try {
        const result = await updateMovie(movieId, title, description, releaseYear);
        if (result.error) {
          return reply.status(404).send(result);
        }
        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message
        });
      }
    });
  
    // Route: Film löschen
    fastify.delete("/movies/:movieId", async (request, reply) => {
      const { movieId } = request.params;
      try {
        const result = await deleteMovie(movieId);
        if (result.error) {
          return reply.status(404).send(result);
        }
        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message
        });
      }
    });
  }
  