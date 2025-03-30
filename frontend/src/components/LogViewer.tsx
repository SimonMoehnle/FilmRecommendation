"use client";

import { useEffect, useState } from "react";

export default function LogViewer() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:4000/admin/logs");
        const data = await res.json();

        if (data.log) {
          const lines = data.log.split("\n").filter((line) => line.trim() !== "");
          setLogs(lines);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Logs:", err);
      }
    };

    fetchLogs();
  }, []);

  const getStatusIcon = (line: string) => {
    const match = line.match(/→ (\d{3})/);
    const code = match ? parseInt(match[1]) : null;

    if (code >= 200 && code < 300) return "✅";
    if (code >= 400) return "❌";
    return "ℹ️";
  };

  return (
    <div className="mt-12 bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-4">📜 Server-Logs</h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {logs.map((line, index) => (
          <div key={index} className="text-sm text-gray-100 flex items-start">
            <span className="mr-2">{getStatusIcon(line)}</span>
            <span className="whitespace-pre-wrap">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
