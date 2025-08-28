'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import Papa from 'papaparse';
import Link from "next/link";
import Image from "next/image";
import { Users, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';

// Define types for API response for better type-safety
interface Restaurant {
  id: string;
  name: string;
  photo: { pc: { l: string; }; };
  budget: { name: string; };
  genre: { name: string; };
  catch: string;
  address: string;
  party_capacity: number;
}

interface Recommendation {
  date: string;
  available: string[];
  maybe: string[];
  unavailable: string[];
  suggestionText: string;
  restaurants?: Restaurant[];
}

interface ScheduleResults {
  topRecommendation: Recommendation;
  otherOptions: Recommendation[];
}

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

          // 1. Find the header row (starts with "日程")
          const headerRowIndex = rows.findIndex(row => row[0] === '日程');
          if (headerRowIndex === -1) {
            throw new Error('CSVに「日程」列が見つかりません。調整さんの標準フォーマットと異なるようです。');
          }
          
          // 2. Extract participant names from the header
          const participantNames = rows[headerRowIndex].slice(1).filter(name => name); // Filter out empty names

          // 3. Find the actual data rows (between header and "コメント" row)
          const commentRowIndex = rows.findIndex(row => row[0] === 'コメント');
          const endOfDataIndex = commentRowIndex === -1 ? rows.length : commentRowIndex;
          const dateRows = rows.slice(headerRowIndex + 1, endOfDataIndex);

          // 4. Transpose the data to match backend expectations
          const scheduleData = participantNames.map((name, nameIndex) => {
            const userRow: { [key: string]: string } = { '名前': name };
            dateRows.forEach(dateRow => {
              const date = dateRow[0];
              const status = dateRow[nameIndex + 1];
              if (date) { // Ensure date is not empty
                userRow[date] = status || ''; // Default to empty string if status is undefined
              }
            });
            return userRow;
          });

          if (scheduleData.length === 0) {
            throw new Error('CSVに有効な参加者データが見つかりません。');
          }

          const priorityUsersList = priorityUsers.split(',').map(u => u.trim()).filter(u => u);

          // API call to the backend
          const response = await fetch('/api/schedules/adjust', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scheduleData: scheduleData,
              priorityUsers: priorityUsersList,
            }),
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-4 pt-10">
      <Card className="w-full max-w-3xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">日程調整</CardTitle>
          <CardDescription className="text-gray-400">
            調整さん等で出力したCSVをアップロードして、最適な日程を見つけましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="csv-file">1. CSVファイルを選択</Label>
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
              <Label htmlFor="priority-users">2. 優先する参加者（任意）</Label>
              <Input
                id="priority-users"
                type="text"
                placeholder='山田太郎, 鈴木花子 (カンマ区切りで入力)'
                value={priorityUsers}
                onChange={(e) => setPriorityUsers(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg" disabled={isLoading}>
              {isLoading ? '調整中...' : '日程を調整する'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Area */}
      <div id="results-area" className="w-full max-w-5xl mt-8">
        {isLoading && <p className="text-center text-lg">最適日程を計算中...</p>}
        {error && <p className="text-center text-red-500">エラー: {error}</p>}
        {results && (
          <div className="space-y-12">
            {/* Top Recommendation Section */}
            <div>
              <h2 className="text-3xl font-bold text-center text-amber-400 mb-2">🏆 一番おすすめの日程 🏆</h2>
              <p className="text-center text-lg text-gray-300 mb-6">{results.topRecommendation.suggestionText}</p>
              <Card className="bg-gray-800 border-amber-400/50">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Calendar className="text-amber-400" />
                    {results.topRecommendation.date}
                  </CardTitle>
                  <div className="flex items-center gap-6 text-gray-300 pt-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="text-green-500" />
                      <span>参加: {results.topRecommendation.available.length}人</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="text-yellow-500" />
                      <span>未定: {results.topRecommendation.maybe.length}人</span>
                    </div>
                     <div className="flex items-center gap-2">
                      <ThumbsDown className="text-red-500" />
                      <span>不参加: {results.topRecommendation.unavailable.length}人</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Other Options Section */}
            {results.otherOptions && results.otherOptions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-center text-gray-400 mb-6">その他の候補</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.otherOptions.map((option) => (
                    <Card key={option.date} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="text-gray-400" />
                          {option.date}
                        </CardTitle>
                        <div className="flex items-center gap-6 text-gray-300 pt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="text-green-500" />
                            <span>参加: {option.available.length}人</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="text-yellow-500" />
                            <span>未定: {option.maybe.length}人</span>
                          </div>
                           <div className="flex items-center gap-2">
                            <ThumbsDown className="text-red-500" />
                            <span>不参加: {option.unavailable.length}人</span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Restaurants Section */}
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-400 mb-6">おすすめのレストラン</h2>
                {results.topRecommendation.restaurants && results.topRecommendation.restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.topRecommendation.restaurants.map((shop) => (
                    <Card key={shop.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-amber-400 transition-colors">
                        <Link href={`/restaurants/${shop.id}`} passHref target="_blank" rel="noopener noreferrer">
                            <Image src={shop.photo.pc.l} alt={shop.name} width={400} height={300} className="w-full h-48 object-cover" />
                            <CardHeader>
                                <CardTitle className="truncate text-gray-100">{shop.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p className="text-gray-300 truncate">{shop.catch}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{shop.genre.name}</Badge>
                                <Badge variant="secondary">{shop.budget.name}</Badge>
                                </div>
                                <p className="text-gray-400 truncate">{shop.address}</p>
                            </CardContent>
                        </Link>
                    </Card>
                    ))}
                </div>
                ) : (
                <p className="text-center text-gray-400">この日程でおすすめできるレストランが見つかりませんでした。</p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
