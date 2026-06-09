# 個別MTG知見ストック＆サポート管理システム

Saltus 特進クラス向けの Web アプリケーション基盤です。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL（Supabase / Neon 等）
- Render（無料プラン）デプロイ想定

## セットアップ

```bash
cd mtg-support-system
cp .env.example .env
npm install
```

`.env` に以下を設定してください。

- `DATABASE_URL` — PostgreSQL 接続文字列
- `AUTH_SECRET` — 32文字以上のランダム文字列
- `NEXT_PUBLIC_APP_URL` — 例: `http://localhost:3000`

### データベース

```bash
npx prisma migrate dev --name init
# または初回のみ
npx prisma db push
```

### 開発サーバー

```bash
npm run dev
```

- ログイン: http://localhost:3000/login
- 新規登録: http://localhost:3000/signup
- ダッシュボード: http://localhost:3000/dashboard

## 権限（Role）

| Role | 説明 |
|------|------|
| `ADMIN` | システム管理者 — すべての操作が可能 |
| `MANAGER` | マネージャー — 全メンバーの MTG・問い合わせ閲覧（今後実装） |
| `MEMBER` | メンバー — 自分のデータのみ閲覧（今後実装） |

新規登録時は常に `MEMBER` が付与されます。

## Render デプロイ

1. GitHub リポジトリを Render に接続
2. `render.yaml` を利用するか、Web Service を Node で作成
3. 環境変数 `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` を設定
4. デプロイ前に Supabase / Neon 側で DB を作成し、`prisma migrate deploy` を実行

## ディレクトリ構成

```
src/
  app/
    (auth)/          # ログイン・サインアップ・パスワード再設定
    (dashboard)/     # ログイン後の共通レイアウト
    api/auth/        # 認証 API
  components/
    auth/            # 認証フォーム
    layout/          # サイドバー・シェル
  lib/               # Prisma / セッション / バリデーション
prisma/
  schema.prisma      # User + Role
```

## MTG議事録機能

| 画面 | URL |
|------|-----|
| 一覧・検索 | `/dashboard/mtg` |
| 新規投稿 | `/dashboard/mtg/new` |
| 詳細 | `/dashboard/mtg/[id]` |

### 閲覧権限

- **MEMBER** — 自分が投稿した MTG のみ閲覧可能（他人の ID は 403）
- **MANAGER / ADMIN** — 全メンバーの MTG を閲覧・検索可能

スキーマ変更後の DB 反映:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npx prisma db push
```

## 問い合わせ（サポートデスク）機能

| 画面 | URL |
|------|-----|
| 一覧 | `/dashboard/support` |
| スレッド詳細 | `/dashboard/support/[id]` |

- ログイン後の全画面右下に青い吹き出しボタン（新規起票モーダル）
- 種別: システム / 使い方（入力項目が動的切替）
- スレッド形式でコメントのやり取り

### 閲覧・操作権限

| 権限 | 閲覧 | ステータス変更 |
|------|------|----------------|
| MEMBER / MANAGER | 自分の起票のみ | 取り下げ（CANCELLED）のみ |
| ADMIN | 全件 | すべて（起票/対応中/完了/取り下げ） |

スキーマ変更後の DB 反映:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npx prisma db push
```

## 今後の拡張

- MTG 記録の編集・削除
- 問い合わせ管理
- 権限別データフィルタ
- 管理者による Role 変更 UI
