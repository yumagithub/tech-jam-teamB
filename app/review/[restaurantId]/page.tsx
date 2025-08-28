'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // States for the review form fields from the base layout
  const [tags, setTags] = useState('');
  const [review, setReview] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  useEffect(() => {
    if (restaurantId) {
      const fetchRestaurantDetails = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/restaurants/${restaurantId}`);
          if (!response.ok) throw new Error('Failed to fetch restaurant details');
          const data = await response.json();
          if (data.shop && data.shop.length > 0) {
            setRestaurant(data.shop[0]);
          } else {
            throw new Error('Restaurant not found');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
        setLoading(false);
      };
      fetchRestaurantDetails();
    }
  }, [restaurantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend API
    console.log({ restaurantId, tags, review, reviewerName });
    alert('レビューを投稿しました！ (コンソールでデータを確認してください)');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">レビューを投稿する</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="restaurantName">レストラン名</label>
              <Input
                id="restaurantName"
                type="text"
                value={restaurant ? restaurant.name : ''}
                readOnly
                className="bg-gray-700 border-gray-600 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tags">タグ</label>
              <Input
                id="tags"
                type="text"
                placeholder="例: デートに最適, 静か, コスパが良い"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="review">レビュー</label>
              <Textarea
                id="review"
                placeholder="レビューをここに書いてください..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="bg-gray-700 border-gray-600 min-h-[150px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reviewerName">あなたの名前</label>
              <Input
                id="reviewerName"
                type="text"
                placeholder="名前を入力してください"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-lg">レビューを投稿する</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}