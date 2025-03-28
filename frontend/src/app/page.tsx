"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Beispieltyp für Filme
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
        {/* Einloggen-Button: Weiterleitung zur /genre-Seite */}
        <Link href="/genre">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
            Einloggen
          </button>
        </Link>
      </header>

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
                    {movie.averageRating.toFixed(1)} ⭐ ({movie.ratingCount})
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{movie.description}</p>
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
