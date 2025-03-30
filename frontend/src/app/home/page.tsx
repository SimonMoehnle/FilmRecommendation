"use client";

import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { FaRegStar } from "react-icons/fa";
import { Trash } from "lucide-react"; // Lösch-Icon für Admins
import { toast, Toaster } from "sonner";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupedMovies, setGroupedMovies] = useState<Record<string, any[]>>({});
  const [filteredMovies, setFilteredMovies] = useState<Record<string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]); // Neuer State für favorisierte Film-IDs
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  // States für Film-Erstellung (Admin)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newReleaseYear, setNewReleaseYear] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      const decoded: any = jwtDecode(token);
    } catch (err) {
      console.error("Token konnte nicht dekodiert werden:", err);
    }

    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded: any = jwtDecode(token);
        if (decoded?.role) {
          setUserRole(decoded.role);
          console.log("User Role:", decoded.role);
        }
        if (decoded?.userId) {
          fetchFavoriteIds(token, decoded.userId); // ✅ HIER hinzufügen
        }
      } catch (err) {
        console.error("Token konnte nicht dekodiert werden:", err);
      }
    
      fetchMovies(token);
    } else {
      setError("Du musst eingeloggt sein, um Filme anzuzeigen.");
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

      setMovies(data.movies); // erstmal nur setzen

      const genres: Record<string, any[]> = {};
      data.movies.forEach((movie: any) => {
        const genre = movie.genre || "Unbekannt";
        if (!genres[genre]) genres[genre] = [];
        genres[genre].push(movie);
      });

      setGroupedMovies(genres);
      setFilteredMovies(genres);
    } catch (err) {
      console.error("Fehler beim Abrufen der Filme:", err);
      setError("Filme konnten nicht geladen werden.");
    }
  };

    // Lade die Favoriten-IDs des eingeloggten Nutzers
    const fetchFavoriteIds = async (token, userId) => {
      try {
        const res = await fetch(`http://localhost:4000/favorites/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fehler beim Abrufen der Favoriten");
        const data = await res.json();
        // Extrahiere die movieIds aus den Favoriten
        const favIds = data.favorites.map((movie) => movie.movieId);
        setFavoriteIds(favIds);
      } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten-IDs:", error);
      }
    };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  // Toggle-Funktion: Wenn der Film bereits favorisiert ist, lösche ihn, sonst füge ihn hinzu
  const toggleFavorite = async (movieId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:4000/movies/${movieId}/favorite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      console.log("Film als Favorit gespeichert");
    }
  };

  // Delete-Funktion: Nur für Admins
  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Willst du diesen Film wirklich löschen?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/movies/${movieId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Fehler beim Löschen des Films:", errorData);
        toast.error("Fehler beim Löschen des Films.");
        return;
      }
      toast.success("Film wurde erfolgreich gelöscht.");
      // Nach erfolgreichem Löschen die Filme neu laden
      fetchMovies(token);
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      toast.error("Fehler beim Löschen des Films.");
    }
  };

  // Filter-Funktionalität
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMovies(groupedMovies);
    } else {
      const filtered: Record<string, any[]> = {};
      Object.entries(groupedMovies).forEach(([genre, movies]) => {
        const matching = movies.filter((movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matching.length > 0) {
          filtered[genre] = matching;
        }
      });
      setFilteredMovies(filtered);
    }
  }, [searchTerm, groupedMovies]);

  // Öffnet das Modal zur Filme-Erstellung und setzt das Genre voraus
  const openAddMovieModal = (genre: string) => {
    setSelectedGenre(genre);
    setShowAddMovieModal(true);
  };

  const closeAddMovieModal = () => {
    setShowAddMovieModal(false);
    setSelectedGenre(null);
    setNewTitle("");
    setNewDescription("");
    setNewReleaseYear("");
  };

  // Film hinzufügen (POST)
  const handleAddMovie = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !selectedGenre) return;
    try {
      const res = await fetch("http://localhost:4000/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          genre: selectedGenre,
          description: newDescription,
          releaseYear: newReleaseYear,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Fehler beim Hinzufügen des Films:", errorData);
        return;
      }
      fetchMovies(token);
      closeAddMovieModal();
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Films:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      <Toaster />
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
        {isLoggedIn ? (
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex items-center justify-center w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
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
            </div>
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
          {/* Suchfeld */}
          <div className="max-w-md mx-auto mb-12">
            <input
              type="text"
              placeholder="Filmtitel suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#1e1e1e] text-white border border-red-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          {/* Filter & Sortierung */}
          <div className="flex justify-center mb-10 relative">
            <button
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V18a1 1 0 01-.553.894l-4 2A1 1 0 019 20v-6.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              Sortieren
            </button>
            {showSortDropdown && (
              <div className="absolute top-12 z-10 bg-gray-800 text-white rounded shadow-lg w-60">
                <ul>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${
                        sortOption === "rating" ? "bg-gray-700" : ""
                      }`}
                      onClick={() => setSortOption("rating")}
                    >
                      Beliebtheit (Beste Bewertung)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${
                        sortOption === "title" ? "bg-gray-700" : ""
                      }`}
                      onClick={() => setSortOption("title")}
                    >
                      Titel (A–Z)
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          {/* Film-Gruppen nach Genre anzeigen */}
          {Object.keys(filteredMovies).map((genre) => (
            <section key={genre} className="mb-10">
              <h2 className="text-2xl font-semibold mb-6">{genre}</h2>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-transparent">
                <div className="flex gap-6 pb-4 w-max">
                  {/* Plus-Karte nur für Admins */}
                  {userRole === "ADMIN" && (
                    <div
                      className="flex-shrink-0 w-[280px] h-[360px] bg-[#1e2736] rounded-lg border border-red-600 flex items-center justify-center cursor-pointer"
                      onClick={() => openAddMovieModal(genre)}
                    >
                      <div className="text-6xl font-bold">+</div>
                    </div>
                  )}
                  {filteredMovies[genre]
                    .sort((a, b) => {
                      if (sortOption === "rating") {
                        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
                      } else if (sortOption === "title") {
                        return a.title.localeCompare(b.title);
                      }
                      return 0;
                    })
                    .slice(0, searchTerm.trim() === "" ? 15 : undefined)
                    .map((movie: any) => (
                      <div
                        key={movie.movieId}
                        className="flex-shrink-0 w-[280px] h-[360px] bg-[#1e2736] rounded-lg border border-red-600 flex flex-col justify-between relative"
                      >
                        {/* Favoriten-Stern */}
                        <div className="relative">
                          <button
                            onClick={() => toggleFavorite(movie.movieId)}
                            className="absolute top-2 right-2 z-10 text-yellow-400 hover:text-yellow-300"
                          >
                            {movie.isFavorite ? <FaStar size={20} /> : <FaRegStar size={20} />}
                          </button>
                        </div>
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
                        <div className="p-5 pt-0 flex gap-2 items-center">
                          <Link href={`/movie/${movie.movieId}`}>
                            <button className="bg-red-600 text-white py-2 px-4 rounded transition hover:bg-red-700 font-semibold flex-1">
                              Detailansicht
                            </button>
                          </Link>
                          {userRole === "ADMIN" && (
                            <button
                              onClick={() => handleDeleteMovie(movie.movieId)}
                              className="bg-blue-900 text-white w-12 h-11 flex items-center justify-center rounded transition hover:bg-blue-800"
                            >
                              <Trash size={20} />
                            </button>
                          )}
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
      {/* Modal zum Hinzufügen eines Films */}
      {showAddMovieModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-2xl mb-4">
              Film hinzufügen – Genre: {selectedGenre}
            </h2>
            <form onSubmit={handleAddMovie} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Titel"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="p-2 rounded bg-[#1e1e1e] text-white border border-red-600"
                required
              />
              <input
                type="text"
                placeholder="Beschreibung"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="p-2 rounded bg-[#1e1e1e] text-white border border-red-600"
                required
              />
              <input
                type="text"
                placeholder="Release Year"
                value={newReleaseYear}
                onChange={(e) => setNewReleaseYear(e.target.value)}
                className="p-2 rounded bg-[#1e1e1e] text-white border border-red-600"
                required
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeAddMovieModal}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Film erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
