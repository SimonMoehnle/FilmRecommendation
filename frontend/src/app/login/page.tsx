"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLocked && lockCountdown > 0) {
      timer = setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isLocked, lockCountdown]);

  const handleLogin = async () => {
    if (isLocked) return;

    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/home");
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockCountdown(30); // Sperre für 30 Sekunden
      }

      alert(data.error || "Fehler beim Login");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-6">
      <h1 className="text-3xl font-bold">Login</h1>

      <input
        type="email"
        placeholder="E-Mail"
        className="p-2 rounded bg-gray-800 text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLocked}
      />
      <input
        type="password"
        placeholder="Passwort"
        className="p-2 rounded bg-gray-800 text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLocked}
      />

      <button
        onClick={handleLogin}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold disabled:opacity-50"
        disabled={isLocked}
      >
        {isLocked ? `Gesperrt (${lockCountdown}s)` : "Einloggen"}
      </button>

      {failedAttempts > 0 && !isLocked && (
        <p className="text-sm text-yellow-400">
          Fehlversuche: {failedAttempts}/5
        </p>
      )}

      {isLocked && (
        <p className="text-sm text-red-500">
          Zu viele Fehlversuche. Konto temporär gesperrt!
        </p>
      )}

      <p className="text-sm mt-4">
        Noch kein Konto?{" "}
        <a href="/registrieren" className="text-blue-400 underline">
          Jetzt registrieren
        </a>
      </p>

      {/* Footer unverändert */}
      <footer className="bg-black/80 text-white px-8 py-10 text-sm">
        {/* ... */}
      </footer>
    </div>
  );
}
