# グルメナビゲーター

このウェブアプリケーションは、会社の会食設定プロセスを簡素化するために設計されたレストラン検索アプリです。ホットペッパーグルメ API を利用してレストランを検索し、社内レビューを共有する機能を持ちます。

## 主要技術

- **フレームワーク:** [Next.js 15](https://nextjs.org/) (App Router)
- **言語:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **データベース:** [PostgreSQL](https://www.postgresql.org/)
- **コンテナ:** [Docker](https://www.docker.com/)

## ディレクトリ構造

```
  tech-jam-teamB/
  ├── app/                                    # Next.js App Router
  │   ├── api/                                # API ルート（バックエンド）
  │   │   ├── restaurants/
  │   │   │   ├── search/route.ts             # 飲食店検索API
  │   │   │   └── [id]/route.ts               # 飲食店詳細取得API
  │   │   ├── reviews/
  │   │   │   ├── route.ts                    # レビュー投稿API
  │   │   │   └── [restaurantId]/route.ts     # レビュー一覧取得API(1店舗)
  │   │   └── schedules/
  │   │       └── adjust/route.ts             # 日程調整・飲食店提案API
  │   ├── restaurants/
  │   │   ├── page.tsx                        # 飲食店検索画面
  │   │   ├── [id]/page.tsx                   # 飲食店詳細画面
  │   │   └── review/page.tsx                 # レビュー投稿画面(メインページ)
  │   ├── review/
  │   │   └── [restaurantId]/page.tsx         # レビュー投稿画面(詳細ページ)
  │   ├── schedule/
  │   │   └── page.tsx                        # 日程調整画面
  │   ├── page.tsx                            # ルートページ
  │   ├── globals.css
  │   └── layout.tsx
  ├── components/
  │   └── ui/                                 # shadcn/ui コンポーネント
  ├── lib/
  │   ├── db.ts                               # データベース接続（Neon PostgreSQL）
  │   ├── hotpepper/                          # Hotpepper API関連
  │   │   ├── client.ts
  │   │   ├── types.ts
  │   │   └── constants.ts
  │   └── utils.ts
  └── scripts/
      └── setup-db.sql                        # DB初期化スクリプト
```

## セットアップと実行

開発環境は Docker コンテナ内で実行することを推奨します。

### 1. 環境変数の設定

プロジェクトのルートに `.env.local` ファイルを作成し、ホットペッパーグルメ API の API キーを設定します。

```.env.local
HOTPEPPER_API_KEY=ご自身のAPIキーをここに設定
```

### 2. 実行方法

#### Docker (推奨)

以下のコマンドを実行すると、Docker イメージのビルドと開発サーバーの起動が行われます。

```bash
docker-compose up --build
```

アプリケーションは `http://localhost:3000` でアクセス可能になります。

#### ローカル (npm)

Docker を使用しない場合は、ローカル環境で直接実行することも可能です。

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 利用可能なスクリプト

- `npm run dev`: 開発サーバーを起動します (Turbopack 利用)。
- `npm run build`: 本番用にアプリケーションをビルドします。
- `npm run start`: ビルドされた本番用サーバーを起動します。
- `npm run lint`: ESLint を実行し、コードの静的解析を行います。

## API

このアプリケーションは、外部 API との通信をバックエンドの API ルート経由でプロキシします。

| エンドポイント                | メソッド | 用途           | データソース  |
| ----------------------------- | -------- | -------------- | ------------- |
| `/api/restaurants/search`     | GET      | 飲食店検索     | Hotpepper API |
| `/api/restaurants/[id]`       | GET      | 飲食店詳細     | Hotpepper API |
| `/api/reviews`                | POST     | レビュー投稿   | PostgreSQL    |
| `/api/reviews/[restaurantId]` | GET      | レビュー一覧   | PostgreSQL    |
| `/api/schedules/adjust`       | POST     | 日程調整・推薦 | Hotpepper API |

詳しくは `app/api` ディレクトリ内の各 `route.ts` を参照してください。
