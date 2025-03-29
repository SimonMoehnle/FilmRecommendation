"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch("http://localhost:4000/register/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (data.message === "User erfolgreich registriert!") {
      router.push("/login"); // Weiterleitung zur Login-Seite
    } else {
      setError(data.error || "Fehler bei der Registrierung");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-6">
      <h1 className="text-3xl font-bold">Registrieren</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Name"
        className="p-2 rounded bg-gray-800 text-white"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="E-Mail"
        className="p-2 rounded bg-gray-800 text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Passwort"
        className="p-2 rounded bg-gray-800 text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleRegister}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
      >
        Registrieren
      </button>

      <p className="text-sm mt-4">
        Bereits registriert?{" "}
        <a href="/login" className="text-blue-400 underline">
          Jetzt einloggen
        </a>
      </p>
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