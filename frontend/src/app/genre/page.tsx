// src/app/genre.tsx
import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

export default async function GenrePage() {
  let movies: Movie[] = [];
  try {
    // Hier wird die Backend-Route verwendet – ggf. kann ein Query-Parameter (z.B. ?sort=genre) genutzt werden,
    // falls das Backend das unterstützt.
    const res = await fetch("http://localhost:3000/movies", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    movies = data.movies;
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    // Fallback-Daten
    movies = [
      { movieId: "1", title: "Action-Blockbuster", genre: "Action", description: "Ein spannender Actionfilm", averageRating: 4.5, ratingCount: 120 },
      { movieId: "2", title: "Lachflash garantiert", genre: "Komödie", description: "Eine urkomische Komödie", averageRating: 4.0, ratingCount: 90 },
      { movieId: "3", title: "Drama des Lebens", genre: "Drama", description: "Ein emotional bewegender Film", averageRating: 3.8, ratingCount: 60 },
      { movieId: "4", title: "Science Fiction Abenteuer", genre: "Sci-Fi", description: "Ein futuristisches Abenteuer", averageRating: 4.2, ratingCount: 80 },
      { movieId: "5", title: "Noch ein Actionfilm", genre: "Action", description: "Mehr Action und Spannung", averageRating: 4.3, ratingCount: 75 },
    ];
  }

  // Filme nach Genre gruppieren – falls ein Film kein Genre hat, wird "Sonstige" verwendet
  const moviesByGenre = movies.reduce((groups: Record<string, Movie[]>, movie) => {
    const genre = movie.genre || "Sonstige";
    if (!groups[genre]) groups[genre] = [];
    groups[genre].push(movie);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      {/* Header-Bereich (Login-Status wird hier vorausgesetzt) */}
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
        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
          Einloggen
        </button>
      </header>

      <main className="px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Filme nach Genre
        </h1>
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
