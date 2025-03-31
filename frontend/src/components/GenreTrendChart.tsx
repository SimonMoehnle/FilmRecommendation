"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrendData {
  genre: string;
  period: string;
  avgRating: number;
  ratingCount: number;
}

// Eigener Tooltip mit dunkelblauem Hintergrund & gerundeten Werten
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-blue-950 text-white p-4 rounded-lg shadow-md text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GenreTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Oder wo auch immer du das Token speicherst
  
        if (!token) {
          console.warn("Kein Token gefunden");
          return;
        }

  
        const res = await fetch(
          `http://localhost:4000/stats/genre-trends?range=${range}&groupBy=day`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
  
        const json = await res.json();
        console.log("📊 GenreTrendChart data:", json);
        if (json && Array.isArray(json.data)) {
          setData(json.data);
        } else {
          console.warn("🚫 API response ist ungültig:", json);
          setData([]);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Genre-Trends:", err);
        setData([]);
      }
    };
  
    fetchData();
  }, [range]);
  

  const safeData = Array.isArray(data) ? data : [];

  const genreAverages: { [genre: string]: { total: number; count: number } } = {};
  safeData.forEach((d) => {
    if (!genreAverages[d.genre]) {
      genreAverages[d.genre] = { total: 0, count: 0 };
    }
    genreAverages[d.genre].total += d.avgRating;
    genreAverages[d.genre].count++;
  });

  const genreOverall = Object.entries(genreAverages).map(([genre, { total, count }]) => ({
    genre,
    avg: total / count,
  }));
  genreOverall.sort((a, b) => b.avg - a.avg);

  const topGenres = genreOverall.slice(0, 5).map((item) => item.genre);
  const filteredData = safeData.filter((d) => topGenres.includes(d.genre));
  const periods = Array.from(new Set(filteredData.map((d) => d.period))).sort();

  const chartData = periods.map((period) => {
    const entry: any = { period };
    filteredData
      .filter((d) => d.period === period)
      .forEach((d) => {
        entry[d.genre] = d.avgRating;
      });
    return entry;
  });

  const colors = [
    "#60a5fa", // blue
    "#f87171", // red
    "#34d399", // green
    "#facc15", // yellow
    "#a78bfa", // purple
  ];

  return (
    <Card className="bg-gray-900 border border-gray-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Bewertungstrends pro Genre (Top 5)</CardTitle>
        <div className="flex gap-2 mt-2">
          {["7d", "30d", "90d"].map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "secondary"}
              size="sm"
              onClick={() => setRange(r as "7d" | "30d" | "90d")}
            >
              Letzte {r.replace("d", "")} Tage
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="period" stroke="#ccc" />
              <YAxis stroke="#ccc" domain={[0, 5]} tickCount={6} />
              {/* Custom Tooltip hier */}
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" iconType="circle" height={30} wrapperStyle={{ marginBottom: 10 }} />
              {topGenres.map((genre, index) => (
                <Line
                  key={genre}
                  type="monotone"
                  dataKey={genre}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
