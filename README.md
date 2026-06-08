# Instagram運用ツール

`@laughpandemicmikey` 向けの Instagram ビジネスアカウント運用ダッシュボードです。インサイト分析・予約投稿・競合調査・コメント/DM管理・AIレポートを一元管理します。

## 構成

| パッケージ | 説明 |
|-----------|------|
| `apps/web` | Next.js ダッシュボード（Vercel デプロイ想定） |
| `packages/instagram-sdk` | Meta Graph API ラッパー |
| `worker` | BullMQ バックグラウンドワーカー（Railway デプロイ想定） |
| `prisma` | PostgreSQL スキーマ（Supabase） |

## 前提条件

- Node.js 20+
- Docker Desktop（ローカル Redis 用）
- [Meta Developer](https://developers.facebook.com/) アカウント
- [Supabase](https://supabase.com/) プロジェクト
- Instagram ビジネスアカウント `@laughpandemicmikey`（Facebook ページと連携済み）

---

## 1. Meta アプリの新規作成（初回のみ）

### 1-1. アプリを作成

1. [Meta for Developers](https://developers.facebook.com/) にログイン
2. **マイアプリ** → **アプリを作成**
3. ユースケース: **その他** → アプリタイプ: **ビジネス**
4. アプリ名例: `Instagram運用ツール laughpandemicmikey`
5. 連絡先メールを入力して作成

### 1-2. Instagram Graph API を追加

1. ダッシュボード左メニュー **製品を追加**
2. **Instagram** → **設定**
3. **Instagram Graph API** を有効化

### 1-3. Facebook Login を追加

1. **製品を追加** → **Facebook Login** → **設定**
2. **有効な OAuth リダイレクト URI** に以下を追加:
   - ローカル: `http://localhost:3000/api/auth/meta/callback`
   - 本番: `https://your-domain.vercel.app/api/auth/meta/callback`
3. **設定** → **ベーシック** でアプリドメインに `localhost` と本番ドメインを追加

### 1-4. 必要な権限（スコープ）

アプリレビュー前は **アプリ管理者・開発者・テスター** のみ利用可能です。以下を **アプリレビュー** で申請してください:

| 権限 | 用途 |
|------|------|
| `instagram_basic` | プロフィール・メディア取得 |
| `instagram_manage_insights` | インサイト・オーディエンス分析 |
| `instagram_content_publish` | 予約投稿 |
| `instagram_manage_comments` | コメント返信・非表示 |
| `instagram_manage_messages` | DM 返信 |
| `pages_show_list` | 連携 Facebook ページ一覧 |
| `pages_read_engagement` | ページエンゲージメント |
| `business_management` | ビジネスアセット管理 |

### 1-5. laughpandemicmikey の接続確認

1. Instagram アプリで `@laughpandemicmikey` が **プロフェッショナル（ビジネス）アカウント** であることを確認
2. **設定** → **アカウント** → **プロフェッショナルアカウントに切り替え**（未設定の場合）
3. **Facebook ページと連携**（Meta Business Suite からページを作成・リンク）
4. Meta アプリの **ロール** → **テスター** に Instagram アカウントを追加（開発中）

### 1-6. Webhook 設定（コメント・DM 受信）

1. **製品** → **Webhooks** → **Instagram** を購読
2. コールバック URL: `https://your-domain.vercel.app/api/webhooks/instagram`
3. 検証トークン: `.env` の `META_WEBHOOK_VERIFY_TOKEN` と同じ値
4. 購読フィールド: `comments`, `messages`
5. 連携 Facebook ページを選択して購読

### 1-7. アプリ ID・シークレットの取得

**設定** → **ベーシック** から以下をコピー:

- **アプリ ID** → `META_APP_ID`
- **app secret** → `META_APP_SECRET`

---

## 2. Supabase セットアップ

### 2-1. プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) で新規プロジェクト作成
2. リージョン: `ap-northeast-1`（東京）推奨

### 2-2. 接続文字列の取得

1. **Project Settings** → **Database** → **Connection string**
2. **Session pooler** → **URI** をコピー
3. `[YOUR-PASSWORD]` を実際のパスワードに置換

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

### 2-3. スキーマ適用

```bash
cp .env.example .env
# DATABASE_URL を編集

npm install
npm run db:generate
npm run db:push
```

---

## 3. ローカル開発

### 3-1. 環境変数

```bash
cp .env.example .env
```

`.env` を編集:

```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback
META_WEBHOOK_VERIFY_TOKEN=your_random_verify_token

DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
REDIS_URL=redis://localhost:6379

OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=random_32_chars_minimum
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=random_cron_secret
```

### 3-2. Redis 起動

```bash
docker compose up -d redis
```

> DB は Supabase を使用します。ローカル PostgreSQL が必要な場合は `docker compose up -d` で postgres も起動し、`DATABASE_URL` を `postgresql://postgres:postgres@localhost:5432/instagram_ops` に変更してください。

### 3-3. 依存関係インストール & DB

```bash
npm install
npm run db:generate
npm run db:push
```

### 3-4. 開発サーバー起動

ターミナル 1 — Web:

```bash
npm run dev
```

ターミナル 2 — Worker:

```bash
npm run worker
```

### 3-5. Instagram アカウント接続

1. ブラウザで http://localhost:3000 を開く
2. **Meta でログイン** をクリック
3. `laughpandemicmikey` に紐づく Facebook ページを選択
4. 権限を許可 → ダッシュボードにリダイレクト

### 3-6. 手動同期テスト

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/trigger-sync
```

以下のキューが処理されます:

- `sync-insights` — 日次インサイト・メディア同期
- `sync-audience` — フォロワー属性・オンライン時間帯
- `sync-competitors` — 競合アカウント同期
- `publish-scheduled` — 予約投稿の公開

---

## 4. 本番デプロイ

### Web（Vercel）

1. リポジトリを Vercel に接続
2. Root Directory: `apps/web`
3. 環境変数を `.env` と同様に設定
4. `META_REDIRECT_URI` を本番 URL に変更
5. Webhook URL を本番ドメインに更新

### Worker（Railway）

1. リポジトリを Railway に接続
2. `railway.toml` が worker の起動コマンドを指定
3. 環境変数を設定:
   - `DATABASE_URL`
   - `REDIS_URL`（Railway Redis プラグイン推奨）
   - `META_APP_ID`, `META_APP_SECRET`
   - `OPENAI_API_KEY`
4. Redis サービスを同一プロジェクトに追加

### Cron（Vercel Cron または外部）

毎日 `/api/cron/trigger-sync` を `Authorization: Bearer CRON_SECRET` で呼び出してください。

---

## 5. BullMQ キュー一覧

| キュー名 | 処理内容 |
|---------|---------|
| `sync-insights` | アカウント・投稿インサイト同期 |
| `sync-audience` | フォロワー属性・オンライン時間帯 |
| `publish-scheduled` | 予約投稿の公開 |
| `sync-competitors` | 競合アカウント・投稿同期 |
| `generate-report` | OpenAI による週次レポート生成 |

---

## 6. トラブルシューティング

| 症状 | 対処 |
|------|------|
| OAuth 後に `no_instagram_account` | Facebook ページと Instagram の連携を確認 |
| インサイトが空 | フォロワー 100 人未満だと一部メトリクス不可 |
| Worker が動かない | `docker compose up -d redis` と `REDIS_URL` を確認 |
| Webhook 検証失敗 | `META_WEBHOOK_VERIFY_TOKEN` の一致を確認 |
| トークン期限切れ | Cron が 14 日前に自動リフレッシュ |

---

## ライセンス

Private — laughpandemicmikey 専用
