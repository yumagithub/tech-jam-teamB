"use client"

import React, { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Textarea } from "../../../components/ui/textarea"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReviewPage({ params }: { params: any }) {
	const restaurantId: string = String(params?.restaurantId ?? "")
	return (
		<div className="min-h-dvh bg-gray-50">
			<header className="bg-white border-b sticky top-0 z-20">
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span aria-hidden className="text-2xl">🍽️</span>
						<span className="text-lg sm:text-xl font-semibold text-gray-900">会食ナビ</span>
					</div>
					<div className="flex items-center gap-4 text-gray-600">
						<button aria-label="通知" className="hover:text-gray-800 text-xl">🔔</button>
						<div className="h-8 w-8 rounded-full bg-gray-200" />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl sm:text-3xl font-bold">レビューを投稿する</CardTitle>
						<p className="text-sm text-muted-foreground mt-2">最高の会食体験を、次の幹事のために共有しましょう。</p>
					</CardHeader>
					<CardContent className="p-6 sm:p-10">
						<ReviewForm restaurantId={restaurantId} />
					</CardContent>
				</Card>
			</main>
		</div>
	)
}

function ReviewForm({ restaurantId }: { restaurantId: string }) {
	const router = useRouter()
	const [restaurantName, setRestaurantName] = useState("")
	const [reviewerName, setReviewerName] = useState("")
	const PRESET_TAGS = ["接待", "懇親会", "お祝い事", "デート", "深い話", "ランチ"] as const
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [tagInput, setTagInput] = useState("")
	const [customTags, setCustomTags] = useState<string[]>([])
	const [body, setBody] = useState("")
	const [files, setFiles] = useState<File[]>([])
	const [submitting, setSubmitting] = useState(false)
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

	useEffect(() => {
		let active = true
		;(async () => {
			try {
				const res = await fetch(`/api/hotpepper/shop?id=${encodeURIComponent(restaurantId)}`)
				if (!active || !res.ok) return
				const data = await res.json()
				setRestaurantName(data?.name ?? "")
			} catch {
				// ignore
			}
		})()
		return () => {
			active = false
		}
	}, [restaurantId])

	const restaurantLabel = useMemo(
		() => (restaurantName ? restaurantName : `店舗ID: ${restaurantId}`),
		[restaurantId, restaurantName]
	)

	function togglePreset(tag: string) {
		setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
	}

	function addTag() {
		const t = tagInput.trim()
		if (!t) return
		if ([...customTags, ...selectedTags].includes(t)) return
		setCustomTags((prev) => [...prev, t])
		setTagInput("")
	}

	function removeTag(t: string) {
		setCustomTags((prev) => prev.filter((x) => x !== t))
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setMessage(null)
		const allTags = [...selectedTags, ...customTags]
		if (!reviewerName.trim()) return setMessage({ type: "error", text: "レビュー者の名前を入力してください。" })
		if (!allTags.length) return setMessage({ type: "error", text: "タグを1つ以上選択または追加してください。" })
		if (!body.trim()) return setMessage({ type: "error", text: "レビュー本文を入力してください。" })

		setSubmitting(true)
		try {
			const res = await fetch("/api/reviews", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					restaurantId,
					restaurantName: restaurantName || null,
					reviewerName: reviewerName.trim(),
					tags: allTags,
					body: body.trim(),
				}),
			})
			if (!res.ok) throw new Error("failed")
			setMessage({ type: "success", text: "レビューを送信しました。ご協力ありがとうございます。" })
			setReviewerName("")
			setSelectedTags([])
			setCustomTags([])
			setBody("")
			setFiles([])
		} catch {
			setMessage({ type: "error", text: "送信に失敗しました。時間をおいて再度お試しください。" })
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-10">
			<section className="space-y-2">
				<h2 className="text-base font-semibold text-gray-900">1. お店<span className="text-red-500 ml-1">*</span></h2>
				<Input value={restaurantLabel} readOnly aria-readonly className="bg-white" />
				<p className="text-xs text-muted-foreground">このレビューは店舗ID {restaurantId} に紐づきます。</p>
			</section>

			{/* レビュー者名 */}
			<section className="space-y-2">
				<h2 className="text-base font-semibold text-gray-900">レビュー者の名前<span className="text-red-500 ml-1">*</span></h2>
				<Input
					id="reviewerName"
					placeholder="例）山田 太郎"
					value={reviewerName}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewerName(e.target.value)}
					required
				/>
			</section>

			{/* 2. シーンタグ（プリセット） */}
			<section className="space-y-3">
				<h2 className="text-base font-semibold text-gray-900">2. どんなシーンにおすすめですか？<span className="text-red-500 ml-1">*</span></h2>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{PRESET_TAGS.map((tag) => {
						const active = selectedTags.includes(tag)
						return (
							<label
								key={tag}
								className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${active ? "bg-amber-50 border-amber-300" : "border-gray-200 hover:bg-gray-50"}`}
							>
								<input
									type="checkbox"
									checked={active}
									onChange={() => togglePreset(tag)}
									className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-600"
								/>
								<span className="ml-3 text-sm text-gray-700 font-medium">{tag}</span>
							</label>
						)
					})}
				</div>
				<p className="text-xs text-muted-foreground">最低1つ以上選択してください。必要に応じて自由入力タグも追加可能です。</p>
			</section>

			{/* 自由入力タグ */}
			<section className="space-y-2">
				<h3 className="text-sm font-medium text-gray-900">自由入力タグ（任意）</h3>
				<div className="flex gap-2">
					<Input
						placeholder="例）半個室、日本酒、駅近"
						value={tagInput}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
						onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
							if (e.key === "Enter") {
								e.preventDefault()
								addTag()
							}
						}}
					/>
					<Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
						追加
					</Button>
				</div>
				{(customTags.length > 0 || selectedTags.length > 0) && (
					<div className="flex flex-wrap gap-2 pt-2">
						{selectedTags.map((t) => (
							<Badge key={`preset-${t}`} variant="secondary">{t}</Badge>
						))}
						{customTags.map((t) => (
							<span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm">
								{t}
								<button
									type="button"
									onClick={() => removeTag(t)}
									className="text-muted-foreground hover:text-foreground"
									aria-label={`${t} を削除`}
								>
									  <span aria-hidden>✖️</span>
								</button>
							</span>
						))}
					</div>
				)}
			</section>

			{/* 3. レビュー本文 */}
			<section className="space-y-2">
				<h2 className="text-base font-semibold text-gray-900">3. レビュー本文<span className="text-red-500 ml-1">*</span></h2>
				<Textarea
					id="body"
					placeholder={"お店の雰囲気、料理、サービスなど、具体的な体験を書いてください。\n例）完全個室で周りを気にせず話せました。接待には間違いないお店です。"}
					rows={8}
					value={body}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
					required
				/>
			</section>

			{/* 4. 写真アップロード（任意） */}
			<section className="space-y-2">
				<h2 className="text-base font-semibold text-gray-900">4. 写真（任意）</h2>
				<div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-gray-300 rounded-md bg-white">
					<div className="space-y-2 text-center">
						<div className="mx-auto text-3xl text-gray-400" aria-hidden>📤</div>
						<div className="flex flex-col items-center gap-2 text-sm text-gray-600">
							<label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-amber-700 hover:text-amber-800">
								<span>ファイルをアップロード</span>
								<input
									id="file-upload"
									name="file-upload"
									type="file"
									multiple
									accept="image/*"
									className="sr-only"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										const list = Array.from(e.target.files ?? [])
										setFiles(list)
									}}
								/>
							</label>
							<p>またはドラッグ＆ドロップ</p>
						</div>
						<p className="text-xs text-gray-500">PNG, JPG, GIF（10MBまで）</p>
						{files.length > 0 && (
							<div className="flex flex-wrap gap-2 justify-center pt-2">
								{files.map((f) => (
									<Badge key={f.name} variant="outline" className="max-w-[200px] truncate">{f.name}</Badge>
								))}
							</div>
						)}
					</div>
				</div>
			</section>

			{message && (
				<div role="status" className={message.type === "success" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
					{message.text}
				</div>
			)}

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					キャンセル
				</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? "送信中..." : "投稿する"}
				</Button>
			</div>
		</form>
	)
}

