'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

// Define the type for a single shop
interface Shop {
  id: string;
  name: string;
  logo_image: string;
  name_kana: string;
  address: string;
  station_name: string;
  access: string;
  mobile_access: string;
  urls: { pc: string };
  photo: { pc: { l: string; m: string; s: string; } };
  open: string;
  close: string;
  genre: { name: string; catch: string };
  budget: { name: string; average: string };
  capacity: number;
  party_capacity: number;
  wifi: string;
  course: string;
  free_drink: string;
  free_food: string;
  private_room: string;
  horigotatsu: string;
  tatami: string;
  card: string;
  non_smoking: string;
  charter: string;
  parking: string;
  barrier_free: string;
  other_memo: string;
  shop_detail_memo: string;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const { id } = params;
  const [restaurant, setRestaurant] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRestaurantDetail = async () => {
        setLoading(true);
        try {
          // We need to create this API route
          const response = await fetch(`/api/restaurants/${id}`);
          const data = await response.json();
          // The API returns a list even for ID search
          if (data.shop && data.shop.length > 0) {
            setRestaurant(data.shop[0]);
          }
        } catch (error) {
          console.error('レストランの詳細取得に失敗しました:', error);
        }
        setLoading(false);
      };
      fetchRestaurantDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Restaurant not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-lg text-gray-400">{restaurant.name_kana}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Image src={restaurant.photo.pc.l} alt={restaurant.name} width={600} height={400} className="rounded-lg shadow-lg w-full" />
          </div>
          <div className="space-y-4">
            <p>{restaurant.genre.catch}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{restaurant.genre.name}</Badge>
              <Badge variant="secondary">{restaurant.budget.name}</Badge>
            </div>
            <div>
              <h3 className="font-semibold">住所</h3>
              <p>{restaurant.address}</p>
            </div>
            <div>
              <h3 className="font-semibold">アクセス</h3>
              <p>{restaurant.access}</p>
            </div>
            <div>
              <h3 className="font-semibold">営業時間</h3>
              <p>{restaurant.open}</p>
              <p>Closed: {restaurant.close}</p>
            </div>
            <a href={restaurant.urls.pc} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">ホットペッパーで見る</Button>
            </a>
            <Link
            href={`/review/${restaurant.id}`}
            passHref
            className="block mt-4"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700">
              このお店のレビューを投稿する
            </Button>
          </Link>
          </div>
        </div>

        <Card className="mt-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2"><span className="font-semibold">Capacity:</span> {restaurant.capacity}</div>
            <div className="flex items-center gap-2"><span className="font-semibold">Max Party:</span> {restaurant.party_capacity}</div>
            <div className="flex items-center gap-2"><span className="font-semibold">Wi-Fi:</span> <Badge variant={restaurant.wifi === 'あり' ? 'default' : 'outline'}>{restaurant.wifi}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Courses:</span> <Badge variant={restaurant.course === 'あり' ? 'default' : 'outline'}>{restaurant.course}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">All-you-can-drink:</span> <Badge variant={restaurant.free_drink === 'あり' ? 'default' : 'outline'}>{restaurant.free_drink}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">All-you-can-eat:</span> <Badge variant={restaurant.free_food === 'あり' ? 'default' : 'outline'}>{restaurant.free_food}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Private Room:</span> <Badge variant={restaurant.private_room === 'あり' ? 'default' : 'outline'}>{restaurant.private_room}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Horigotatsu:</span> <Badge variant={restaurant.horigotatsu === 'あり' ? 'default' : 'outline'}>{restaurant.horigotatsu}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Tatami:</span> <Badge variant={restaurant.tatami === 'あり' ? 'default' : 'outline'}>{restaurant.tatami}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Card Payment:</span> <Badge variant={restaurant.card === '利用可' ? 'default' : 'outline'}>{restaurant.card}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Non-Smoking:</span> <Badge>{restaurant.non_smoking}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Charter:</span> <Badge>{restaurant.charter}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Parking:</span> <Badge>{restaurant.parking}</Badge></div>
            <div className="flex items-center gap-2"><span className="font-semibold">Barrier-Free:</span> <Badge>{restaurant.barrier_free}</Badge></div>
          </CardContent>
        </Card>

        {/* Placeholder for internal reviews */}
        <Card className="mt-8 bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle>内部レビュー</CardTitle>
            </CardHeader>
            <CardContent>
                <p>まだ内部レビューはありません。</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
