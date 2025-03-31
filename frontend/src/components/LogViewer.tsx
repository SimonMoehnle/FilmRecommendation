"use client";

import { useEffect, useState } from "react";

export default function LogViewer() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/admin/logs", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.log) {
          const lines = data.log.split("\n").filter((line: string) => line.trim() !== "");
          setLogs(lines);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Logs:", err);
      }
    };

    fetchLogs();
  }, []);

  // Zerlegt eine Logzeile in Timestamp, Level und Message
  const parseLogLine = (line: string) => {
    // Beispiel: "[2025-03-31T12:34:56.789Z] INFO: Nachricht"
    const regex = /^\[(.+?)\]\s+(\w+):\s+(.*)$/;
    const match = line.match(regex);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2],
        message: match[3],
      };
    }
    return {
      timestamp: "",
      level: "",
      message: line,
    };
  };

  // Extrahiert aus der Logzeile den HTTP-Status und liefert ein passendes Icon
  const getStatusIcon = (line: string) => {
    const match = line.match(/→ (\d{3})/);
    const code = match ? parseInt(match[1]) : null;
    if (code !== null) {
      if (code >= 200 && code < 300) return "✅";
      if (code >= 400) return "❌";
    }
    return "ℹ️";
  };

  return (
    <div className="mt-12 bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-4">Server-Logs</h2>
      <div className="overflow-x-auto">
        {/* Container mit fester Höhe und vertikalem Scrollen */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="sticky top-0 z-10 bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Timestamp</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Level</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">HTTP</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map((line, index) => {
                const { timestamp, level, message } = parseLogLine(line);
                return (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-200">{timestamp}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{level}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{getStatusIcon(line)}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
