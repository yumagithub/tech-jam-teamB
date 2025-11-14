"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component

export default function ReviewPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [tags, setTags] = useState("");
  const [review, setReview] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend API
    console.log({ restaurantName, tags, review, reviewerName });
    alert("レビューを投稿しました！ (コンソールでデータを確認してください)");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 overflow-x-hidden">
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
                placeholder="レストランを検索..."
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              />
              {/* In a real app, this would be a search input that uses the Shop Search API */}
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="text-gray-200">
                タグ
              </label>
              <Input
                id="tags"
                type="text"
                placeholder="例: デートに最適, 静か, コスパが良い"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="review" className="text-gray-200">
                Review
              </label>
              <Textarea
                id="review"
                placeholder="レビューをここに書いてください..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="bg-gray-700 border-gray-600 min-h-[150px] text-gray-100 placeholder:text-gray-400 caret-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
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
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-lg text-white"
            >
              レビューを投稿する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// You might need to create this Textarea component if it doesn't exist in shadcn/ui by default
// Example: components/ui/textarea.tsx
/*
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
*/
