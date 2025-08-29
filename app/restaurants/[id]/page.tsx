"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  photo: { pc: { l: string; m: string; s: string } };
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

// Define the type for a single review
interface Review {
  id: number;
  title: string;
  reviewer_name: string;
  is_gourmet_meister: boolean;
  body: string;
  created_at: string;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const { id } = params;
  const [restaurant, setRestaurant] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchDetailsAndReviews = async () => {
        setLoading(true);
        try {
          // Fetch restaurant details and reviews in parallel
          const [resDetails, resReviews] = await Promise.all([
            fetch(`/api/restaurants/${id}`),
            fetch(`/api/reviews/${id}`),
          ]);

          if (!resDetails.ok)
            throw new Error("Failed to fetch restaurant details");
          const dataDetails = await resDetails.json();
          if (dataDetails.shop && dataDetails.shop.length > 0) {
            setRestaurant(dataDetails.shop[0]);
          } else {
            throw new Error("Restaurant not found");
          }

          if (!resReviews.ok) throw new Error("Failed to fetch reviews");
          const dataReviews = await resReviews.json();
          setReviews(dataReviews);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
        setLoading(false);
      };
      fetchDetailsAndReviews();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Restaurant not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-100">
            {restaurant.name}
          </h1>
          <p className="text-lg text-gray-300">{restaurant.name_kana}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Image
              src={restaurant.photo.pc.l}
              alt={restaurant.name}
              width={600}
              height={400}
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          <div className="space-y-4">
            <p className="text-gray-200 break-words">
              {restaurant.genre.catch}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{restaurant.genre.name}</Badge>
              <Badge variant="secondary">{restaurant.budget.name}</Badge>
              <Badge variant="secondary">
                収容人数: {restaurant.party_capacity}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">住所</h3>
              <p className="text-gray-300 break-words">{restaurant.address}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">アクセス</h3>
              <p className="text-gray-300 break-words">{restaurant.access}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">営業時間</h3>
              <p className="text-gray-300">{restaurant.open}</p>
              <p className="text-sm text-gray-400">
                定休日: {restaurant.close}
              </p>
            </div>
            <a
              href={restaurant.urls.pc}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                ホットペッパーで見る
              </Button>
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
            <CardTitle className="text-gray-100">詳細</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-300">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">総席数:</span>{" "}
              <span className="break-words whitespace-normal max-w-full">
                {restaurant.capacity}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">最大収容人数:</span>{" "}
              <span className="break-words whitespace-normal max-w-full">
                {restaurant.party_capacity}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">Wi-Fi:</span>{" "}
              <Badge
                variant={restaurant.wifi === "あり" ? "default" : "outline"}
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.wifi !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.wifi}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">コース:</span>{" "}
              <Badge
                variant={restaurant.course === "あり" ? "default" : "outline"}
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.course !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.course}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">飲み放題:</span>{" "}
              <Badge
                variant={
                  restaurant.free_drink === "あり" ? "default" : "outline"
                }
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.free_drink !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.free_drink}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">食べ放題:</span>{" "}
              <Badge
                variant={
                  restaurant.free_food === "あり" ? "default" : "outline"
                }
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.free_food !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.free_food}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">個室:</span>{" "}
              <Badge
                variant={
                  restaurant.private_room === "あり" ? "default" : "outline"
                }
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.private_room !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.private_room}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">掘りごたつ:</span>{" "}
              <Badge
                variant={
                  restaurant.horigotatsu === "あり" ? "default" : "outline"
                }
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.horigotatsu !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.horigotatsu}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">座敷:</span>{" "}
              <Badge
                variant={restaurant.tatami === "あり" ? "default" : "outline"}
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.tatami !== "あり" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.tatami}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">
                クレジットカード:
              </span>{" "}
              <Badge
                variant={restaurant.card === "利用可" ? "default" : "outline"}
                className={cn(
                  "break-words whitespace-normal max-w-full",
                  restaurant.card !== "利用可" &&
                    "border-gray-400 text-gray-100 bg-gray-700/40"
                )}
              >
                {restaurant.card}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">禁煙席:</span>{" "}
              <Badge className="break-words whitespace-normal max-w-full">
                {restaurant.non_smoking}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">貸切:</span>{" "}
              <Badge className="break-words whitespace-normal max-w-full">
                {restaurant.charter}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">駐車場:</span>{" "}
              <Badge className="break-words whitespace-normal max-w-full">
                {restaurant.parking}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-gray-100">バリアフリー:</span>{" "}
              <Badge className="break-words whitespace-normal max-w-full">
                {restaurant.barrier_free}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">レビュー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg bg-gray-700/50 border border-gray-600"
                >
                  <div className="flex items-center mb-2">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>
                        {review.reviewer_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-lg text-gray-100 break-words">
                        {review.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-300">
                        <span className="break-words whitespace-normal max-w-full">
                          {review.reviewer_name}
                        </span>
                        {review.is_gourmet_meister && (
                          <Badge
                            variant="outline"
                            className="ml-2 border-amber-400 text-amber-400"
                          >
                            グルメマイスター
                          </Badge>
                        )}
                      </div>
                    </div>
                    <time className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap break-words">
                    {review.body}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">まだレビューはありません。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
