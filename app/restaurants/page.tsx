"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";

// Define the types for the API response
interface Shop {
  id: string;
  name: string;
  photo: {
    pc: {
      l: string;
    };
  };
  budget: {
    name: string;
  };
  genre: {
    name: string;
  };
  catch: string;
  address: string;
  party_capacity: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Shop[]>([]);
  const [keyword, setKeyword] = useState("");
  const [budget, setBudget] = useState("");
  const [genre, setGenre] = useState("");
  const [partyCapacity, setPartyCapacity] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    let query = `keyword=${encodeURIComponent(keyword)}`;
    if (budget) query += `&budget=${budget}`;
    if (genre) query += `&genre=${genre}`;
    if (partyCapacity) query += `&party_capacity=${partyCapacity}`;

    try {
      const response = await fetch(`/api/restaurants/search?${query}`);
      const data = await response.json();
      setRestaurants(data.shop || []);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
    setLoading(false);
  }, [keyword, budget, genre, partyCapacity]);

  useEffect(() => {
    fetchRestaurants();
    setGenre("");
  }, [fetchRestaurants]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-1/4 bg-gray-800 p-6 space-y-6">
        <h2 className="text-2xl font-bold">Search</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            type="text"
            placeholder="Keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-gray-700 border-gray-600"
          />
          <Select onValueChange={setBudget} value={budget}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Budget" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white">
              <SelectItem value="B001">〜2000円</SelectItem>
              <SelectItem value="B002">2001〜3000円</SelectItem>
              <SelectItem value="B003">3001〜4000円</SelectItem>
              <SelectItem value="B004">4001〜5000円</SelectItem>
              <SelectItem value="B005">5001〜7000円</SelectItem>
              <SelectItem value="B006">7001〜10000円</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Number of People"
            value={partyCapacity}
            onChange={(e) => setPartyCapacity(e.target.value)}
            className="bg-gray-700 border-gray-600"
          />
          {/* Genre Select would go here - needs genre master API */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Search
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Gourmet Navigator</h1>
          <div className="flex items-center gap-1">
            <Link href="/restaurants/review" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Post a Review
              </Button>
            </Link>
            <Link href="/schedule" passHref>
              <Button className="bg-green-600 hover:bg-green-700">
                Adjust Schedule
              </Button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((shop) => (
              <Card
                key={shop.id}
                className="bg-gray-800 border-gray-700 overflow-hidden"
              >
                <Link href={`/restaurants/${shop.id}`} passHref>
                  <div className="cursor-pointer">
                    <Image
                      src={shop.photo.pc.l}
                      alt={shop.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader className="mt-4">
                      <CardTitle className="truncate text-gray-100">
                        {shop.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-0.5 space-y-2">
                      <p className="text-sm text-gray-300 truncate">
                        {shop.catch}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{shop.genre.name}</Badge>
                        <Badge variant="secondary">{shop.budget.name}</Badge>
                        <Badge variant="secondary">
                          収容人数: {shop.party_capacity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {shop.address}
                      </p>
                    </CardContent>
                    <CardFooter className="mt-4 flex justify-between items-center">
                      <Button size="sm">Been there!</Button>
                      <span className="text-sm text-gray-400">0 Reviews</span>
                    </CardFooter>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
