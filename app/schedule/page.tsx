'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Papa from 'papaparse';
import Link from "next/link";
import Image from "next/image";
import { Users, Calendar, ThumbsUp, ThumbsDown, PartyPopper } from 'lucide-react';

// Define types for API response for better type-safety
interface Restaurant {
  id: string;
  name: string;
  urls: { pc: string; };
  photo: { pc: { l: string; }; };
  budget: { name: string; };
  genre: { name: string; };
  catch: string;
  address: string;
  party_capacity: number;
}

// New interface for genre-grouped restaurants
interface RestaurantsByGenre {
  genreName: string;
  genreCode: string;
  restaurants: Restaurant[];
}

interface Recommendation {
  date: string;
  available: string[];
  maybe: string[];
  unavailable: string[];
  suggestionText: string;
  restaurantsByGenre?: RestaurantsByGenre[]; // Updated property
}

interface ScheduleResults {
  topRecommendation: Recommendation;
  otherOptions: Recommendation[];
}

// Helper component for displaying participant lists
const ParticipantList = ({ title, names, icon }: { title: string; names: string[]; icon: React.ReactNode }) => (
  <div>
    <h4 className="flex items-center text-base font-semibold mb-3">
      {icon}
      <span className="ml-2">{title} ({names.length})</span>
    </h4>
    {names.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {names.map(name => <Badge key={name} variant="secondary" className="font-normal">{name}</Badge>)}
      </div>
    ) : (
      <p className="text-sm text-gray-400">該当者なし</p>
    )}
  </div>
);


export default function SchedulePage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [priorityUsers, setPriorityUsers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScheduleResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      alert('CSVファイルを選択してください。');
      return;
    }

    setIsLoading(true);
    setResults(null);
    setError(null);

    Papa.parse(csvFile, {
      skipEmptyLines: true,
      complete: async (parsedResult) => {
        try {
          const rows = parsedResult.data as string[][];
          const headerRowIndex = rows.findIndex(row => row[0] === '日程');
          if (headerRowIndex === -1) throw new Error('CSVに「日程」列が見つかりません。');
          
          const participantNames = rows[headerRowIndex].slice(1).filter(name => name);
          const commentRowIndex = rows.findIndex(row => row[0] === 'コメント');
          const endOfDataIndex = commentRowIndex === -1 ? rows.length : commentRowIndex;
          const dateRows = rows.slice(headerRowIndex + 1, endOfDataIndex);

          const scheduleData = participantNames.map((name, nameIndex) => {
            const userRow: { [key: string]: string } = { '名前': name };
            dateRows.forEach(dateRow => {
              const date = dateRow[0];
              const status = dateRow[nameIndex + 1];
              if (date) userRow[date] = status || '';
            });
            return userRow;
          });

          if (scheduleData.length === 0) throw new Error('CSVに有効な参加者データが見つかりません。');

          const priorityUsersList = priorityUsers.split(',').map(u => u.trim()).filter(u => u);

          const response = await fetch('/api/schedules/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduleData, priorityUsers: priorityUsersList }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'APIエラーが発生しました。');
          }

          const data: ScheduleResults = await response.json();
          setResults(data);

        } catch (err) {
          setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        setError(`CSVの解析に失敗しました: ${err.message}`);
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <main className="max-w-6xl mx-auto space-y-12">
        <Card className="w-full max-w-3xl mx-auto bg-gray-800 border-gray-700 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">日程調整アシスタント</CardTitle>
            <CardDescription className="text-gray-400 pt-2">
              調整さんCSVをアップロードして、最適な会食日程とお店を見つけましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="csv-file" className="font-semibold">1. CSVファイルをアップロード</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="bg-gray-700 border-gray-600 file:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority-users" className="font-semibold">2. 優先参加者 (任意)</Label>
                <Input
                  id="priority-users"
                  type="text"
                  placeholder='山田太郎, 鈴木花子 (カンマ区切り)'
                  value={priorityUsers}
                  onChange={(e) => setPriorityUsers(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg" disabled={isLoading}>
                {isLoading ? '調整中...' : '最適な日程を探す'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Area */}
        <div id="results-area">
          {isLoading && <p className="text-center text-lg text-gray-300">最適日程を計算中...</p>}
          {error && <p className="text-center text-red-500">エラー: {error}</p>}
          {results && (
            <div className="space-y-16">
              {/* Top Recommendation Section */}
              <section>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center justify-center gap-3">
                    <PartyPopper className="w-8 h-8 text-amber-400" />
                    一番おすすめの日程
                  </h2>
                  <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-400">{results.topRecommendation.suggestionText}</p>
                </div>
                <Card className="bg-gray-800 border-2 border-amber-400 shadow-lg max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3 text-gray-100">
                      <Calendar className="w-6 h-6 text-amber-400" />
                      {results.topRecommendation.date}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-white">
                    <ParticipantList title="参加" names={results.topRecommendation.available} icon={<ThumbsUp className="text-green-500" />} />
                    <hr className="border-gray-700" />
                    <ParticipantList title="未定" names={results.topRecommendation.maybe} icon={<Users className="text-yellow-500" />} />
                    <hr className="border-gray-700" />
                    <ParticipantList title="不参加" names={results.topRecommendation.unavailable} icon={<ThumbsDown className="text-red-500" />} />
                  </CardContent>
                </Card>
              </section>

              {/* Other Options Section */}
              {results.otherOptions && results.otherOptions.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-center mb-8 text-gray-300">その他の候補日</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.otherOptions.map((option) => (
                      <Card key={option.date} className="bg-gray-800/70 border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg text-gray-300">
                            <Calendar className="w-5 h-5" />
                            {option.date}
                          </CardTitle>
                          <CardDescription className="pt-2">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-green-400"><ThumbsUp className="w-4 h-4" /> {option.available.length}</span>
                              <span className="flex items-center gap-1 text-yellow-400"><Users className="w-4 h-4" /> {option.maybe.length}</span>
                              <span className="flex items-center gap-1 text-red-400"><ThumbsDown className="w-4 h-4" /> {option.unavailable.length}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommended Restaurants Section with Tabs */}
              <section>
                  <h2 className="text-2xl font-bold text-center mb-8 text-gray-300">おすすめのレストラン</h2>
                  {results.topRecommendation.restaurantsByGenre && results.topRecommendation.restaurantsByGenre.length > 0 ? (
                    <Tabs defaultValue={results.topRecommendation.restaurantsByGenre[0].genreCode} className="w-full">
                      <TabsList className="flex w-full overflow-x-auto whitespace-nowrap space-x-2 p-1">
                        {results.topRecommendation.restaurantsByGenre.map((genre) => (
                          <TabsTrigger key={genre.genreCode} value={genre.genreCode}>{genre.genreName}</TabsTrigger>
                        ))}
                      </TabsList>
                      {results.topRecommendation.restaurantsByGenre.map((genre) => (
                        <TabsContent key={genre.genreCode} value={genre.genreCode}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {genre.restaurants.map((shop) => (
                              <Card key={shop.id} className="bg-gray-800 border-gray-700 overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-lg hover:border-gray-500">
                                <Link href={`/restaurants/${shop.id}`} passHref className="flex-grow cursor-pointer">
                                  <Image src={shop.photo.pc.l} alt={shop.name} width={400} height={300} className="w-full h-48 object-cover" />
                                  <CardHeader>
                                      <CardTitle className="truncate text-gray-100">{shop.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-sm space-y-2">
                                      <p className="text-gray-400 truncate">{shop.catch}</p>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">{shop.genre.name}</Badge>
                                        <Badge variant="secondary">{shop.budget.name}</Badge>
                                      </div>
                                      <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                                  </CardContent>
                                </Link>
                                <CardFooter className="pt-4">
                                  <a href={(() => {
                                    try {
                                      const url = new URL(shop.urls.pc);
                                      url.pathname = url.pathname.endsWith('/') ? `${url.pathname}tel/` : `${url.pathname}/tel/`;
                                      return url.toString();
                                    } catch (e) {
                                      console.error("Invalid URL:", shop.urls.pc, e);
                                      return shop.urls.pc; // Fallback to original URL on error
                                    }
                                  })()} target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button className="w-full  bg-blue-600 hover:bg-blue-700">
                                      電話番号を見る
                                    </Button>
                                  </a>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <p className="text-center text-gray-400">この日程でおすすめできるレストランが見つかりませんでした。</p>
                  )}
              </section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}