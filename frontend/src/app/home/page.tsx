"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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
    router.push("/"); // Zur Landing-Seite weiterleiten
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
            <section key={genre} className="mb-10">
                <h2 className="text-2xl font-semibold mb-6">{genre}</h2>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-transparent">
                  <div className="flex gap-6 pb-4 w-max">
                    {groupedMovies[genre].map((movie: any) => (
                      <div 
                        key={movie.movieId} 
                        className="flex-shrink-0 w-[280px] h-[360px] bg-[#1e2736] rounded-lg border border-red-600 flex flex-col justify-between"
                      >
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2">
                            {movie.title}
                          </h3>

                          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                            {movie.description || "Imported from MovieLens"}
                          </p>

                          <div className="flex items-center mb-4">
                            <p className="text-white text-sm">
                              Bewertung: {movie.averageRating ? movie.averageRating.toFixed(1) : "–"}/5
                            </p>
                            <span className="text-yellow-400 ml-2">⭐</span>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <Link href={`/movie/${movie.movieId}`}>
                            <button className="bg-red-600 text-white py-2 px-4 rounded w-full hover:bg-red-700 transition font-semibold">
                              Detailansicht
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </section>
          ))}
        </main>
      )}
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
