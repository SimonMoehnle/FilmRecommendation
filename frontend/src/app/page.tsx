"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Movie {
  movieId: string;
  title: string;
  genre?: string;
  description?: string;
  releaseYear?: number;
  averageRating?: number;
  ratingCount?: number;
}

export default function GenrePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Du musst eingeloggt sein, um Filme anzuzeigen.");
      return;
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
  
      const topRated = data.movies
        .filter((m: Movie) => typeof m.averageRating === "number")
        .sort((a: Movie, b: Movie) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
        .slice(0, 4);
  
      setMovies(topRated);
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

      <main className="px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Deine Lieblingsfilme, Unterhaltung pur.
        </h1>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Card
              key={movie.movieId}
              className="bg-gray-800 rounded-lg backdrop-blur-sm text-white hover:shadow-xl transition-shadow"
            >
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
                  {movie.averageRating !== undefined
                    ? movie.averageRating.toFixed(1)
                    : "–"}{" "}
                  ⭐ ({movie.ratingCount ?? 0})
                </p>
                {movie.description && (
                  <p className="text-sm">{movie.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="w-full flex flex-col items-center text-center mt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Mehr Gründe für eine Mitgliedschaft
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl">
            {/* Vorteilskarte 1 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg flex flex-col items-start">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="text-xl font-semibold mb-2">Auf deinem Fernseher</h3>
              <p className="text-sm text-white/90">
                Streame Filme auf Smart-TVs, PlayStation, Xbox, Chromecast und mehr.
              </p>
            </div>
            {/* Vorteilskarte 2 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-pink-600 to-red-600 shadow-lg flex flex-col items-start">
              <div className="text-3xl mb-3">⬇️</div>
              <h3 className="text-xl font-semibold mb-2">Offline ansehen</h3>
              <p className="text-sm text-white/90">
                Lade Filme und Serien herunter, um sie unterwegs ohne Internetverbindung zu schauen.
              </p>
            </div>
            {/* Vorteilskarte 3 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg flex flex-col items-start">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-xl font-semibold mb-2">Auf allen Geräten</h3>
              <p className="text-sm text-white/90">
                Schaue deine Lieblingsinhalte auf Smartphone, Tablet, Laptop oder Fernseher.
              </p>
            </div>
            {/* Vorteilskarte 4 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg flex flex-col items-start">
              <div className="text-3xl mb-3">👪</div>
              <h3 className="text-xl font-semibold mb-2">Profile für Kinder</h3>
              <p className="text-sm text-white/90">
                Erstelle kinderfreundliche Profile, damit die Kleinen sicher nur altersgerechte Inhalte sehen.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black/80 text-white px-8 py-10 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col space-y-4">
          {/* Hotline / Kontakt */}
          <p className="mb-4">Fragen? Einfach anrufen: 0800-000-5677</p>

          {/* Mehrspaltiges Link-Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Häufig gestellte Fragen (FAQ)</a></li>
              <li><a href="#" className="hover:underline">Medien-Center</a></li>
              <li><a href="#" className="hover:underline">Geschenkkarten kaufen</a></li>
              <li><a href="#" className="hover:underline">Datenschutz</a></li>
            </ul>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Möglichkeit kündigen</a></li>
              <li><a href="#" className="hover:underline">Hilfe-Center</a></li>
              <li><a href="#" className="hover:underline">Karriere</a></li>
              <li><a href="#" className="hover:underline">Rechtliche Hinweise</a></li>
            </ul>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Konto</a></li>
              <li><a href="#" className="hover:underline">DualiStream Shop</a></li>
              <li><a href="#" className="hover:underline">Nutzungsbedingungen</a></li>
              <li><a href="#" className="hover:underline">Impressum</a></li>
            </ul>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Cookie-Einstellungen</a></li>
              <li><a href="#" className="hover:underline">Kontakt</a></li>
              <li><a href="#" className="hover:underline">Wahlmöglichkeiten für Werbung</a></li>
              <li><a href="#" className="hover:underline">Nur auf DualiStream</a></li>
            </ul>
          </div>

          {/* Standort */}
          <p className="mt-4 text-gray-400">DualiStream Deutschland</p>
        </div>
      </footer>
    </div>
  );
}