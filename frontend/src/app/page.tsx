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
    <div className="bg-gray-900 text-white min-h-screen px-6 py-8">
      <header className="flex items-center justify-between px-8 py-4">
        {/* Logo links */}
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
      <main className="flex flex-col items-center text-center px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Deine Lieblingsfilme,
          <br className="hidden md:block" /> Unterhaltung pur.
        </h1>

        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 w-full max-w-6xl sm:grid-cols-2 md:grid-cols-4">
            {movies.map((movie) => (
              <Card
                key={movie.movieId}
                className="bg-gray-800 rounded-lg backdrop-blur-sm text-white hover:shadow-xl transition-shadow"
              >
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
                  <p>
                    <span className="font-semibold">Genre:</span> {movie.genre}
                  </p>
                  <p>
                    <span className="font-semibold">Jahr:</span> {movie.releaseYear}
                  </p>
                  <p>
                    <span className="font-semibold">Ø Bewertung:</span>{" "}
                    {movie.averageRating !== undefined ? movie.averageRating.toFixed(1) : "–"} ⭐
                    ({movie.ratingCount ?? 0})
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-black/80 text-white px-8 py-10 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col space-y-4">
          <p className="mb-4">Fragen? Einfach anrufen: 0800-000-5677</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Häufig gestellte Fragen (FAQ)
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Medien-Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Geschenkkarten kaufen
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Datenschutz
                </a>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Möglichkeit kündigen
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Hilfe-Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Karriere
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Rechtliche Hinweise
                </a>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Konto
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Netflix Shop
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Nutzungsbedingungen
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Impressum
                </a>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Cookie-Einstellungen
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Kontakt
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Wahlmöglichkeiten für Werbung
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Nur auf Netflix
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
