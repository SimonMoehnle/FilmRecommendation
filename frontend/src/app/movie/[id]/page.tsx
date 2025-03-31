"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { RatingForm } from "@/components/RatingForm";
import { Clapperboard } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface Movie {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  averageRating?: number;
}

interface Review {
  user: string;
  userId: number;
  score: number;
  review: string;
  ratedAt: string;
}

export default function MovieDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Du musst eingeloggt sein, um Filme anzuzeigen.");
    } else {
      setIsLoggedIn(true);
      // Token dekodieren, um die Rolle zu ermitteln
      try {
        const decoded: any = jwtDecode(token);
        if (decoded?.role) {
          setUserRole(decoded.role);
        }
      } catch (err) {
        console.error("Token konnte nicht dekodiert werden:", err);
      }
      fetchMovie(token);
      fetchReviews(token, id as string);
    }
  }, [id]);

  const fetchMovie = async (token: string) => {
    try {
      const res = await fetch(`http://localhost:4000/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const m = data.movie;

      // Konvertiere Neo4j-Integer in normale Zahlen
      if (m) {
        m.movieId = typeof m.movieId === "object" ? m.movieId.low : m.movieId;
        m.releaseYear =
          typeof m.releaseYear === "object" ? m.releaseYear.low : m.releaseYear;
        m.averageRating =
          typeof m.averageRating === "object" ? m.averageRating.low : m.averageRating;
      }

      setMovie(m);
    } catch (err) {
      console.error("Fehler beim Abrufen des Films:", err);
      setError("Film konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (token: string, movieId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/movies/${movieId}/reviews`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const convertedReviews = data.reviews.map((r: any) => ({
        ...r,
        score: typeof r.score === "object" ? r.score.low : r.score,
      }));
      setReviews(convertedReviews);
    } catch (err) {
      console.error("Fehler beim Abrufen der Bewertungen:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  if (loading) return <div className="text-white p-8">Lade Film...</div>;
  if (!movie) return <div className="text-white p-8">Film nicht gefunden...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <Link href="/">
          <div className="relative w-[300px] h-[80px] cursor-pointer">
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
                {userRole === "ADMIN" ? "Admin" : "Benutzer"}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black/10 focus:outline-none">
                  <div className="py-1">
                    {userRole === "ADMIN" ? (
                      <>
                        <button
                          onClick={() => router.push("/admin/panel")}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                          Admin-Panel
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-700"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push("/benutzerkonto")}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                          Benutzerkonto verwalten
                        </button>
                        <button
                          onClick={() => {
                            const token = localStorage.getItem("token");
                            if (token) {
                              const decoded: any = jwtDecode(token);
                              if (decoded?.userId) {
                                router.push(`/${decoded.userId}/favoritenliste`);
                              }
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                          Meine Favoriten
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-700"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hauptinhalt */}
      <div className="px-8 py-16 flex flex-col items-center">
        {/* Film-Detail Card */}
        <Card className="w-full max-w-3xl bg-gray-800 p-6 space-y-6">
          <CardHeader>
            <CardTitle className="text-3xl">{movie.title}</CardTitle>
            <CardDescription>
              {movie.description || "Imported from MovieLens"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-semibold">Genre:</span> {movie.genre}
            </p>
            <p>
              <span className="font-semibold">Erscheinungsjahr:</span>{" "}
              {movie.releaseYear}
            </p>
            <p>
              <span className="font-semibold">
                Durchschnittliche Bewertung:
              </span>{" "}
              {movie.averageRating?.toFixed(1) || "Keine"} / 5
            </p>
          </CardContent>
          <CardContent>
            <RatingForm movieId={id as string} />
          </CardContent>
          <CardFooter>
            <Link href="/home">
              <button className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                ⬅ Zurück zur Startseite
              </button>
            </Link>
          </CardFooter>
        </Card>

        {/* Reviews Card */}
        <Card className="w-full max-w-3xl bg-gray-800 p-6 space-y-6 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Bewertungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((r, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-4 rounded mb-4 flex flex-col gap-1"
                >
                  <p className="text-sm">
                    <span className="font-semibold">{r.user}</span> – Bewertung: {r.score}/5
                  </p>
                  <p className="text-sm">{r.review}</p>
                  <p className="text-xs text-gray-400">
                    Am: {new Date(r.ratedAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-300">Noch keine Bewertungen vorhanden.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
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
                  DualiStream Shop
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
                  Nur auf DualiStream
                </a>
              </li>
            </ul>
          </div>
          <p className="mt-4 text-gray-400">DualiStream Deutschland</p>
        </div>
      </footer>
    </div>
  );
}
