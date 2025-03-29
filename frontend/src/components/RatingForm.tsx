'use client';

import { useState } from "react";

export const RatingForm = ({ movieId }: { movieId: string }) => {
  const [score, setScore] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Du musst eingeloggt sein, um eine Bewertung abzugeben.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/movies/${movieId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, review }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Bewertung fehlgeschlagen.");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error("Fehler beim Bewerten:", err);
      setMessage("Ein Fehler ist aufgetreten.");
    }
  };

  return (
    <div className="mt-10 p-6 bg-[#1E0000] rounded-md shadow-lg max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-semibold mb-4">Film bewerten</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="score" className="block mb-1 font-medium">Bewertung (1-5)</label>
          <select
            id="score"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="review" className="block mb-1 font-medium">Kommentar (optional)</label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded font-semibold"
        >
          Bewertung abschicken
        </button>
        {message && (
          <p className="mt-2 text-sm text-green-400">{message}</p>
        )}
      </form>
    </div>
  );
};