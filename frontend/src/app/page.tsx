"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  genre?: string;        // Beispielhaft hinzugefügt
  description?: string;  // ...
  releaseYear?: number;
  imageUrl?: string;
}

export default async function Page() {
  let movies: Movie[] = [];

  // Backend-Abfrage (anpassen, je nachdem auf welchem Port dein Backend läuft)
  try {
    const res = await fetch("http://localhost:3000/movies", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    movies = data.movies;
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    // Fallback-Daten
    movies = [
      { movieId: "1", title: "Film A", genre: "Genre A", description: "Body text..." },
      { movieId: "2", title: "Film B", genre: "Genre B", description: "Body text..." },
      { movieId: "3", title: "Film C", genre: "Genre C", description: "Body text..." },
      { movieId: "4", title: "Film D", genre: "Genre D", description: "Body text..." },
    ];
  }

  return (
    // Gradient-Hintergrund: von Schwarz, über ein dunkles Rot, zurück zu Schwarz
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      {/* Header-Bereich */}
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
        {/* Einloggen-Button rechts */}
        <Link href="/genre">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded">
            Einloggen
          </button>
        </Link>
      </header>

      {/* Hauptbereich */}
      <main className="flex flex-col items-center text-center px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Deine Lieblingsfilme,<br className="hidden md:block" />
          Unterhaltung pur.
        </h1>
        
        {/* Cards-Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 w-full max-w-6xl sm:grid-cols-2 md:grid-cols-4">
          {movies.map((movie) => (
            <Card
              key={movie.movieId}
              className="rounded-lg bg-white/10 backdrop-blur-sm text-white hover:shadow-xl transition-shadow"
            >
              {/* Falls Bild vorhanden, hier mit <Image> einbinden */}
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">
                  {movie.title ?? "Text"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-200 mb-2">
                  {movie.genre ?? "Genre"}
                </p>
                <p className="text-sm text-gray-300">
                  {movie.description ?? "Body text..."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
                {/* ---- Neuer Abschnitt mit Vorteilskarten ---- */}
                <section className="w-full max-w-7xl mt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Mehr Gründe für eine Mitgliedschaft
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
        <li><a href="#" className="hover:underline">Netflix Shop</a></li>
        <li><a href="#" className="hover:underline">Nutzungsbedingungen</a></li>
        <li><a href="#" className="hover:underline">Impressum</a></li>
      </ul>
      <ul className="space-y-2">
        <li><a href="#" className="hover:underline">Cookie-Einstellungen</a></li>
        <li><a href="#" className="hover:underline">Kontakt</a></li>
        <li><a href="#" className="hover:underline">Wahlmöglichkeiten für Werbung</a></li>
        <li><a href="#" className="hover:underline">Nur auf Netflix</a></li>
      </ul>
    </div>
    </div>
    </footer>
    </div>
  );
}
