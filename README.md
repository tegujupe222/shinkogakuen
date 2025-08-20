# 合格者お知らせサイト

Next.jsとVercelを使用した合格者向けお知らせ管理サイトです。

## 機能

- 管理者機能
  - お知らせの作成・編集・削除
  - 学生プロフィール管理
  - 書類管理
  - 合格証書管理

- 学生機能
  - お知らせ閲覧
  - プロフィール編集
  - 書類ダウンロード
  - 合格証書確認

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel
- **認証**: 簡易認証（JWT対応予定）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数をVercelダッシュボードで設定
3. 自動デプロイが有効になります

### 環境変数の設定（Vercel）

Vercelダッシュボードで以下の環境変数を設定してください：

- `GEMINI_API_KEY`: Gemini APIキー

## テストアカウント

### 管理者
- メールアドレス: admin@example.com
- パスワード: admin123

### 学生
- メールアドレス: student@example.com
- パスワード: student123

## API エンドポイント

### 認証
- `POST /api/auth` - ログイン

### お知らせ管理
- `GET /api/announcements` - お知らせ一覧取得
- `POST /api/announcements` - お知らせ作成
- `GET /api/announcements/[id]` - 個別お知らせ取得
- `PUT /api/announcements/[id]` - お知らせ更新
- `DELETE /api/announcements/[id]` - お知らせ削除

## 開発

### プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── admin/            # 管理者用コンポーネント
│   ├── auth/             # 認証関連コンポーネント
│   ├── icons/            # アイコンコンポーネント
│   ├── shared/           # 共通コンポーネント
│   └── student/          # 学生用コンポーネント
├── hooks/                # カスタムフック
├── types.ts              # TypeScript型定義
└── package.json          # 依存関係
```

## ライセンス

MIT License
