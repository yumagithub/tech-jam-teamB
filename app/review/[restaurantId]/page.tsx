"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Define the type for a single shop to ensure type safety
interface Shop {
  id: string;
  name: string;
}

export default function ReviewPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for the review form fields
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isGourmetMeister, setIsGourmetMeister] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      const fetchRestaurantDetails = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/restaurants/${restaurantId}`);
          if (!response.ok)
            throw new Error("Failed to fetch restaurant details");
          const data = await response.json();
          if (data.shop && data.shop.length > 0) {
            setRestaurant(data.shop[0]);
          } else {
            throw new Error("Restaurant not found");
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        }
        setLoading(false);
      };
      fetchRestaurantDetails();
    }
  }, [restaurantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reviewData = {
      restaurantId,
      title,
      review,
      reviewerName,
      isGourmetMeister,
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      alert("レビューが正常に投稿されました！");
      // Clear the form
      setTitle("");
      setReview("");
      setReviewerName("");
      setIsGourmetMeister(false);
      // Optionally, redirect the user
      // window.location.href = `/restaurants/${restaurantId}`;
    } catch (error) {
      console.error(error);
      alert("レビューの投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-100">
            レビューを投稿する
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="restaurantName" className="text-gray-200">
                レストラン名
              </label>
              <Input
                id="restaurantName"
                type="text"
                value={restaurant ? restaurant.name : ""}
                readOnly
                className="bg-gray-700 border-gray-600 cursor-not-allowed text-gray-300 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="title" className="text-gray-200">
                レビュータイトル
              </label>
              <Input
                id="title"
                type="text"
                placeholder="例: 最高の沖縄そば！"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="review" className="text-gray-200">
                レビュー内容
              </label>
              <Textarea
                id="review"
                placeholder="レビューをここに書いてください..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="bg-gray-700 border-gray-600 min-h-[150px] text-gray-100 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reviewerName" className="text-gray-200">
                あなたの名前
              </label>
              <Input
                id="reviewerName"
                type="text"
                placeholder="名前を入力してください"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isGourmetMeister"
                checked={isGourmetMeister}
                onCheckedChange={(checked) =>
                  setIsGourmetMeister(Boolean(checked))
                }
              />
              <label
                htmlFor="isGourmetMeister"
                className="text-sm font-medium leading-none text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                グルメマイスターですか？
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-lg text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "投稿中..." : "レビューを投稿する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
