"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Movie {
  movieId: string;
  title: string;
  genre?: string;
  description?: string;
  releaseYear?: number;
  imageUrl?: string;
  averageRating?: number;
  ratingCount?: number;
}

export default function GenrePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/movies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setMovies(data.movies);
      } catch (err) {
        console.error("Fehler beim Abrufen der Filme:", err);
        setError("Filme konnten nicht gelade werden.");
      }
    };

    fetchMovies();
  }, []);

  const moviesByGenre = movies.reduce((groups: Record<string, Movie[]>, movie) => {
    const genre = movie.genre || "Sonstige";
    if (!groups[genre]) groups[genre] = [];
    groups[genre].push(movie);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="relative w-[300px] h-[80px]">
          <Image
            src="https://i.ibb.co/CpmRBD0X/image.png"
            alt="DualStream Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Link href="/login">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
            Einloggen
          </button>
        </Link>
      </header>

      <main className="px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Filme nach Genre
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-6">{error}</p>
        )}

        {Object.keys(moviesByGenre).map((genre) => (
          <section key={genre} className="mb-16">
            <h2 className="text-3xl font-semibold mb-6">{genre}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {moviesByGenre[genre].map((movie) => (
                <Card key={movie.movieId} className="rounded-lg bg-white/10 backdrop-blur-sm text-white hover:shadow-xl transition-shadow">
                  {movie.imageUrl ? (
                    <Image
                      src={movie.imageUrl}
                      alt={movie.title}
                      width={200}
                      height={300}
                      className="rounded-t-md"
                    />
                  ) : (
                    <div className="bg-gray-700 w-full h-[300px] flex items-center justify-center rounded-t-md">
                      <span className="text-sm text-gray-400">Kein Bild</span>
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold">{movie.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-200 mb-2">{movie.description}</p>
                    {movie.averageRating !== undefined && (
                      <p className="text-sm text-gray-300">
                        Bewertung: {movie.averageRating} ({movie.ratingCount} Stimmen)
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
