"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FavoritenPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      router.push("/login"); // Weiterleitung zur Login-Seite, wenn nicht eingeloggt
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Token aus dem localStorage entfernen
    setIsLoggedIn(false); // Zustand zurücksetzen
    router.push("/"); // Zur Landing-Seite weiterleiten
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="relative w-[300px] h-[80px]">
          <img
            src="https://i.ibb.co/CpmRBD0X/image.png"
            alt="DualStream Logo"
            className="object-contain"
            width={300}
            height={80}
          />
        </div>

        {/* Benutzer Dropdown */}
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
                Benutzer
              </button>
            </div>

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
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
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

      {/* Hauptbereich */}
      <main className="flex flex-col items-center justify-center px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          Favoritenliste
        </h1>
        <p className="text-lg text-gray-300 text-center">
          Hier kannst du deine Lieblingsfilme sehen.
        </p>
        <div className="mt-12">
          <div className="p-6 rounded-lg bg-gray-800 text-white shadow-lg">
            <p className="text-center">Platzhalter für Favoriten-Inhalte</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 text-white px-8 py-10 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col space-y-4">
          {/* Hotline / Kontakt */}
          <p className="mb-4">Fragen? Einfach anrufen: 0800-000-5677</p>

          {/* Mehrspaltiges Link-Grid */}
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

          {/* Standort */}
          <p className="mt-4 text-gray-400">DualiStream Deutschland</p>
        </div>
      </footer>
    </div>
  );
}