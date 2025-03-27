// src/app/page.tsx
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

// Typdefinition für Filme (weitere Felder können hier ergänzt werden)
interface Movie {
  movieId: string;
  title: string;
  description: string;
  releaseYear: number;
  imageUrl?: string; // Optional – falls kein Bild vorhanden ist
}

// Diese Server Component ruft beim Rendern die Filme von der API ab.
export default async function Page() {
  let movies: Movie[] = [];

  try {
    // ACHTUNG: Hier wird der API-Endpunkt auf Port 4000 verwendet.
    const res = await fetch("http://localhost:4000/movies", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    movies = data.movies;
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    // Fallback-Beispiele, falls der API-Aufruf fehlschlägt
    movies = [
      { movieId: "1", title: "Beispiel Film 1", description: "Beschreibung", releaseYear: 2020 },
      { movieId: "2", title: "Beispiel Film 2", description: "Beschreibung", releaseYear: 2019 },
    ];
  }

  return (
    <div className="dark bg-gray-900 text-white min-h-screen">
      {/* Header im Netflix-Stil */}
      <header className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo – Stelle sicher, dass /logo.svg im public-Ordner liegt */}
          <Image src="/logo.svg" alt="Netflix Clone" width={100} height={40} />
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Home</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Serien</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Filme</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Neu &amp; Beliebt</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div>
          <Button variant="ghost">Sign In</Button>
        </div>
      </header>

      {/* Hauptinhalt – Anzeige der Filme */}
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4">Populäre Filme</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <Card key={movie.movieId} className="bg-gray-800">
              {/* Falls ein Bild vorhanden ist, anzeigen; ansonsten einen Platzhalter */}
              {movie.imageUrl ? (
                <Image
                  src={movie.imageUrl}
                  alt={movie.title}
                  width={200}
                  height={300}
                  className="rounded-t-md"
                />
              ) : (
                <div className="bg-gray-700 w-full h-[300px] flex items-center justify-center rounded-t-md">
                  <span className="text-sm text-gray-400">Kein Bild</span>
                </div>
              )}
              <CardHeader className="p-2">
                <CardTitle className="text-sm font-bold">{movie.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <p className="text-xs text-gray-300">
                  Erscheinungsjahr: {movie.releaseYear}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 p-4 text-center text-xs text-gray-500">
        <p>&copy; 2025 Netflix Clone. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
