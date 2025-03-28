// app/movie/[id]/page.tsx

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "lucide-react";

interface Movie {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  averageRating?: number;
}

interface MovieDetailProps {
  params: {
    id: string;
  };
}

async function getMovie(id: string): Promise<Movie | null> {
  try {
    const res = await fetch(`http://localhost:4000/movies/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.movie;
  } catch (error) {
    console.error("Fehler beim Abrufen des Films:", error);
    return null;
  }
}

const MovieDetail = async ({ params }: MovieDetailProps) => {
  const movie = await getMovie(params.id);

  if (!movie) {
    return <div className="text-white p-8">Film nicht gefunden...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1E0000] to-black text-white px-8 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">{movie.title}</h1>
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>{movie.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{movie.description}</CardDescription>
          <p className="text-sm text-gray-300">Genre: {movie.genre}</p>
          <p className="text-sm text-gray-300">Release Year: {movie.releaseYear}</p>
          <p className="text-sm text-gray-300">Rating: {movie.averageRating || "N/A"} / 5</p>
        </CardContent>
        <CardFooter>
          <Link href="/" className="bg-red-600 text-white py-2 px-4 rounded">Zurück zur Startseite</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MovieDetail;
