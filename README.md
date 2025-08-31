# レストラン検索アプリ (tech-jam-team-b)

このウェブアプリケーションは、会社の会食設定プロセスを簡素化するために設計されたレストラン検索アプリです。ホットペッパーグルメAPIを利用してレストランを検索し、社内レビューを共有する機能を持ちます。

## ✨ 主要技術

- **フレームワーク:** [Next.js](https://nextjs.org/) (App Router)
- **言語:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **データベース:** [PostgreSQL](https://www.postgresql.org/)
- **コンテナ:** [Docker](https://www.docker.com/)

## 🚀 セットアップと実行

開発環境はDockerコンテナ内で実行することを推奨します。

### 1. 環境変数の設定

プロジェクトのルートに `.env.local` ファイルを作成し、ホットペッパーグルメAPIのAPIキーを設定します。

```.env.local
HOTPEPPER_API_KEY=ご自身のAPIキーをここに設定
```

### 2. 実行方法

#### Docker (推奨)

以下のコマンドを実行すると、Dockerイメージのビルドと開発サーバーの起動が行われます。

```bash
docker-compose up --build
```

アプリケーションは `http://localhost:3000` でアクセス可能になります。

#### ローカル (npm)

Dockerを使用しない場合は、ローカル環境で直接実行することも可能です。

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 🛠️ 利用可能なスクリプト

- `npm run dev`: 開発サーバーを起動します (Turbopack利用)。
- `npm run build`: 本番用にアプリケーションをビルドします。
- `npm run start`: ビルドされた本番用サーバーを起動します。
- `npm run lint`: ESLintを実行し、コードの静的解析を行います。

## 📝 API

このアプリケーションは、外部APIとの通信をバックエンドのAPIルート経由でプロキシします。

- **レストラン検索:** `/api/restaurants/search`
- **レストラン詳細:** `/api/restaurants/[id]`
- **レビュー取得/投稿:** `/api/reviews`

詳しくは `app/api` ディレクトリ内の各 `route.ts` を参照してください。