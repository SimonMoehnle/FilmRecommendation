"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Movie {
  movieId: number;
  title: string;
  genre: string;
  description: string;
  releaseYear: number;
  averageRating: number;
  ratingCount: number;
  imageUrl?: string;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:4000/movies", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMovies(data.movies);
      } catch (err) {
        console.error("Fehler beim Abrufen der Filme:", err);
        setError("Filme konnten nicht geladen werden.");
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Alle Filme</h1>

      {error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.map((movie) => (
            <Card key={movie.movieId} className="bg-gray-800">
              {movie.imageUrl ? (
                <Image
                  src={movie.imageUrl}
                  alt={movie.title}
                  width={300}
                  height={400}
                  className="rounded-t-md"
                />
              ) : (
                <div className="bg-gray-700 h-[300px] flex items-center justify-center text-sm text-gray-400 rounded-t-md">
                  Kein Bild verfügbar
                </div>
              )}
              <CardHeader className="p-3">
                <CardTitle className="text-lg">{movie.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-sm text-gray-300 space-y-1">
                <p><span className="font-semibold">Genre:</span> {movie.genre}</p>
                <p><span className="font-semibold">Jahr:</span> {movie.releaseYear}</p>
                <p><span className="font-semibold">Ø Bewertung:</span> {movie.averageRating.toFixed(1)} ⭐ ({movie.ratingCount})</p>
                <p className="text-xs text-gray-400 mt-2">{movie.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
