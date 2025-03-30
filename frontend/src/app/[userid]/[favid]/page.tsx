"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // Annahme: Default-Export verwenden
import { Clapperboard } from "lucide-react";

// Typ für den dekodierten JWT-Token
interface DecodedToken {
  userId: number;
  // Weitere Eigenschaften können hier ergänzt werden
}

// Interface für ein Favoriten-Filmobjekt
interface FavoriteMovie {
  movieId: number | { low: number };
  title: string;
  description?: string;
  genre?: string;
  averageRating?: number;
  // Weitere Felder je nach API-Antwort ergänzen
}

export default function FavoritenPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchFavorites(token);
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchFavorites = async (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const userId = decoded.userId;

      const res = await fetch(`http://localhost:4000/favorites/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Fehler beim Abrufen der Favoriten");
      }

      // Hier wird angenommen, dass die API ein Array vom Typ FavoriteMovie zurückgibt
      const data: FavoriteMovie[] = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error("Fehler beim Abrufen der Favoriten:", error);
    }
  };

  const handleRemoveFavorite = async (movieId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:4000/movies/${movieId}/favorite`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Fehler beim Entfernen aus Favoriten");

      // Favoritenliste aktualisieren: Nutze einen Typ-Check, ob movieId ein Objekt ist oder nicht
      setFavorites((prev) =>
        prev.filter((movie: FavoriteMovie) =>
          (typeof movie.movieId === "object" ? movie.movieId.low : movie.movieId) !== movieId
        )
      );
    } catch (error) {
      console.error("Fehler beim Entfernen aus Favoriten:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <Link href="/">
          <div className="relative w-[300px] h-[80px]">
            <img
              src="https://i.ibb.co/CpmRBD0X/image.png"
              alt="DualStream Logo"
              className="object-contain"
              width={300}
              height={80}
            />
          </div>
        </Link>

        {isLoggedIn && (
          <div className="flex items-center gap-4 justify-end">
            <button
              onClick={() => router.push("/home")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition flex items-center gap-2"
            >
              <Clapperboard className="w-5 h-5" />
              Zu den Filmen
            </button>

            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 15c3.866 0 7.36 1.567 9.879 4.096M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Benutzer
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black/10 focus:outline-none">
                  <div className="py-1">
                    <button
                      onClick={() => router.push("/benutzerkonto")}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Benutzerkonto verwalten
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        setIsLoggedIn(false);
                        router.push("/");
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hauptbereich */}
      <main className="flex flex-col items-center justify-center px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          Favoritenliste
        </h1>
        <p className="text-lg text-gray-300 text-center">
          Hier kannst du deine Lieblingsfilme sehen.
        </p>
        <div className="mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.length === 0 ? (
              <div className="col-span-full text-center text-gray-400">
                Noch keine Favoriten gespeichert.
              </div>
            ) : (
              favorites.map((movie: FavoriteMovie, index: number) => (
                <div
                  key={`${
                    typeof movie.movieId === "object"
                      ? movie.movieId.low
                      : movie.movieId
                  }-${index}`}
                  className="bg-[#1e2736] rounded-lg border border-red-600 p-4 shadow-md flex flex-col justify-between"
                >
                  <Link
                    href={`/movie/${
                      typeof movie.movieId === "object"
                        ? movie.movieId.low
                        : movie.movieId
                    }`}
                  >
                    <h2 className="text-xl font-bold mb-2 cursor-pointer hover:underline">
                      {movie.title}
                    </h2>
                  </Link>
                  <p className="text-gray-300 text-sm mb-2">
                    {movie.description || "Keine Beschreibung verfügbar."}
                  </p>
                  <p className="text-sm text-white mb-1">
                    Genre: <span className="text-gray-400">{movie.genre}</span>
                  </p>
                  <p className="text-sm text-white">
                    Bewertung: {movie.averageRating?.toFixed(1) ?? "–"} / 5 ⭐
                  </p>
                  <button
                    onClick={() =>
                      handleRemoveFavorite(
                        typeof movie.movieId === "object"
                          ? movie.movieId.low
                          : movie.movieId
                      )
                    }
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Aus Favoriten entfernen
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
