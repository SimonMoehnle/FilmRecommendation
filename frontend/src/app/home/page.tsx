"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupedMovies, setGroupedMovies] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Du musst eingeloggt sein, um Filme anzuzeigen.");
    } else {
      setIsLoggedIn(true);
      fetchMovies(token);
    }
  }, []);

  const fetchMovies = async (token: string) => {
    try {
      const res = await fetch("http://localhost:4000/movies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMovies(data.movies);

      // Filme nach Genre gruppieren
      const genres: Record<string, any[]> = {};
      data.movies.forEach((movie: any) => {
        const genre = movie.genre || "Unbekannt";
        if (!genres[genre]) genres[genre] = [];
        genres[genre].push(movie);
      });

      setGroupedMovies(genres);
    } catch (err) {
      console.error("Fehler beim Abrufen der Filme:", err);
      setError("Filme konnten nicht geladen werden.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Token aus dem localStorage entfernen
    setIsLoggedIn(false); // Zustand zurücksetzen
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="relative w-[300px] h-[80px]">
          <img
            src="https://i.ibb.co/CpmRBD0X/image.png"
            alt="DualStream Logo"
            className="object-contain"
            width={300}
            height={80}
          />
        </div>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Logout
          </button>
        ) : (
          <Link href="/login">
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
              Einloggen
            </button>
          </Link>
        )}
      </header>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {isLoggedIn && (
        <main className="px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Entdecke alle Filme
          </h1>

          {/* Film-Gruppen nach Genre anzeigen */}
          {Object.keys(groupedMovies).map((genre) => (
            <section key={genre}>
              <h2 className="text-2xl font-semibold mb-4">{genre}</h2>
              <div className="flex space-x-4 overflow-x-auto">
                {groupedMovies[genre].map((movie: any) => (
                  <Card key={movie.movieId} className="bg-gray-800 flex-shrink-0 w-[250px]">
                    <CardHeader>
                      <CardTitle>{movie.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{movie.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm">
                        Bewertung: {movie.averageRating ? movie.averageRating.toFixed(1) : "–"} / 5
                        </p>
                        <span className="text-yellow-400">⭐</span>
                    </div>
                    <Link href={`/movie/${movie.movieId}`}>
                        <button className="bg-red-600 text-white py-1 px-4 rounded mt-2">
                        Detailansicht
                        </button>
                    </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  );
}
