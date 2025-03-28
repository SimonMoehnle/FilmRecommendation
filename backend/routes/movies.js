import {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    deleteAllMovies,
    getMoviesByGenre
  } from "../services/movieService.js";

import { createMovieSchema } from "../schema/movie-schema.js";
import { requireAnyRole } from "../services/authMiddleware.js";
  
  export default async function movieRoutes(fastify, options) {
    // Route: Alle Filme abrufen
    fastify.get("/movies", {
      preHandler: requireAnyRole(["USER", "ADMIN"]),
    }, async (request, reply) => {
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
      const movieId = parseInt(request.params.movieId, 10); // <<< wichtig!
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

    // Route: Filme nach Genre abrufen
    fastify.get("/movies/genre/:genre", async (request, reply) => {
      const { genre } = request.params;
      try {
        const movies = await getMoviesByGenre(genre);
        return reply.send({ movies });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: "Database error",
          details: error.message
        });
      }
    });

    
    // Route: Neuen Film erstellen
    fastify.post("/movies", {schema: createMovieSchema}, async (request, reply) => {
      const { title, genre, description, releaseYear } = request.body;
      if (!title || !description || !releaseYear) {
        return reply.status(400).send({
          error: "Title, Beschreibung und Erscheinungsjahr sind erforderlich!"
        });
      }
      try {
        const result = await createMovie(title, genre, description, releaseYear);
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
    fastify.delete("/movies/:movieId", {
      preHandler: requireAnyRole(["ADMIN"])
    }, async (request, reply) => {
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

    // Route: Alle Filme löschen
    fastify.delete("/deleteAllMovies", async (request, reply) => {
      try {
        const result = await deleteAllMovies();
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
  