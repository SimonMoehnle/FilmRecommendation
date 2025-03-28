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
    </div>
  );
}