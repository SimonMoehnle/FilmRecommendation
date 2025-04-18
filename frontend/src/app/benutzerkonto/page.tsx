"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard } from "lucide-react";

export default function BenutzerkontoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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

        {/* Rechte Seite: Benutzer Dropdown und Buttons */}
        {isLoggedIn && (
          <div className="flex items-center gap-4 justify-end">
            {/* Startseite-Button */}
            <button
              onClick={() => router.push("/home")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition flex items-center gap-2"
            >
              <Clapperboard className="w-5 h-5" />
              Zu den Filmen
            </button>

            {/* Benutzer Dropdown */}
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
                      onClick={handleLogout}
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
          Benutzerkonto
        </h1>
        <p className="text-lg text-gray-300 text-center">
          Hier kannst du deine Kontoeinstellungen verwalten.
        </p>
        <div className="mt-12 w-full max-w-xl bg-gray-800 text-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Dein Benutzerkonto
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const token = localStorage.getItem("token");
              if (!token) return;

              try {
                const res = await fetch(
                  "http://localhost:4000/users/me/update",
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, email, password }),
                  }
                );

                const data = await res.json();
                if (!res.ok) {
                  setMessage(data.error || "Aktualisierung fehlgeschlagen");
                } else {
                  setMessage(data.message);
                }
              } catch (err) {
                setMessage("Ein Fehler ist aufgetreten.");
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
                placeholder="Neuer Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
                placeholder="Neue E-Mail"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
                placeholder="Neues Passwort"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 transition text-white py-3 rounded font-semibold"
            >
              Änderungen speichern
            </button>
            {message && (
              <p className="mt-3 text-center text-sm text-green-400">
                {message}
              </p>
            )}
          </form>
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