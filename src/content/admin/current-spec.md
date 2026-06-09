# Saltus 特進 システム仕様書（現行）

> **対象読者:** システム管理者（ADMIN）のみ  
> **版:** 初稿完了版（2026年6月）  
> **リポジトリ:** `Saltus-Special-class` / Render 本番デプロイ

---

## システム概要

**Saltus 特進 — 個別MTG知見ストック＆サポート管理システム** は、特進クラス向けに以下を一元管理する Web アプリケーションです。

| 領域 | 概要 |
|------|------|
| MTG議事録 | 1on1 MTG の日付・タイトル・議事録（Markdown）・宿題事項・コメント |
| 問い合わせ | システム不具合・使い方に関するサポートデスク（スレッド形式） |
| 認証・権限 | メール/パスワードログイン、3段階ロール |
| 使い方ガイド | Markdown ベースの操作マニュアル（全メンバー閲覧可） |

---

## 技術スタック

| レイヤ | 技術 |
|--------|------|
| フロント / API | Next.js 16（App Router）、React 19、TypeScript |
| スタイル | Tailwind CSS v4 |
| ORM | Prisma 7 |
| DB | PostgreSQL（Supabase） |
| 認証 | JWT（`jose`）+ HttpOnly Cookie（`saltus_session`） |
| パスワード | bcryptjs |
| バリデーション | Zod |
| Markdown | react-markdown + remark-gfm |
| 本番ホスティング | Render（`render.yaml`） |

### ディレクトリ構成（主要）

```
src/
  app/                    # ページ・API Routes
    (auth)/               # ログイン・新規登録・PWリセット
    (dashboard)/          # 認証後ダッシュボード
    api/                  # REST API
  components/             # UI コンポーネント
  content/
    help/                 # 使い方ガイド Markdown
    admin/                # 仕様書 Markdown（本ドキュメント）
  lib/                    # ビジネスロジック・認可・Prisma
  generated/prisma/       # Prisma Client（gitignore、ビルド時生成）
prisma/schema.prisma      # DB スキーマ
public/                   # 静的ファイル（help 画像、auth/tiger.png）
```

---

## 画面構成

### 公開画面（未ログイン）

| パス | 画面名 | 備考 |
|------|--------|------|
| `/login` | ログイン | 左パネル：虎背景 + サービス説明 |
| `/signup` | 新規登録 | 権限は自動で MEMBER |
| `/password-reset` | パスワード再設定 | トークン方式 |

### ダッシュボード（ログイン後）

| パス | 画面名 | 閲覧権限 |
|------|--------|----------|
| `/dashboard` | ホーム | 全員 |
| `/dashboard/mtg` | MTG議事録一覧 | 全員（表示範囲はロール依存） |
| `/dashboard/mtg/new` | MTG新規投稿 | 全員 |
| `/dashboard/mtg/[id]` | MTG詳細 | 本人 or MANAGER/ADMIN |
| `/dashboard/support` | 問い合わせ一覧 | 全員（表示範囲はロール依存） |
| `/dashboard/support/[id]` | 問い合わせスレッド | 起票者 or ADMIN |
| `/dashboard/guide` | 使い方ガイド | 全員 |
| `/dashboard/settings` | 設定（PW変更・管理設定） | 全員（管理機能は ADMIN のみ） |
| `/dashboard/admin/spec` | 仕様書（現行） | **ADMIN のみ** |
| `/dashboard/admin/spec/extensibility` | 拡張性ロードマップ | **ADMIN のみ** |

### 共通 UI

- **サイドバー:** ロールに応じたメニュー表示（`src/lib/navigation.ts`）
- **FAB（青ボタン）:** 全ダッシュボード画面で問い合わせモーダル起動
- **DashboardShell:** ヘッダー・ログアウト・レスポンシブハンバーガー

---

## 権限・認可

### ロール定義

| ロール | 表示名 | 概要 |
|--------|--------|------|
| `MEMBER` | メンバー | 自分の MTG・問い合わせのみ |
| `MANAGER` | マネージャー | 全員の MTG 閲覧、自分の問い合わせ |
| `ADMIN` | システム管理者 | 全問い合わせ、ユーザー権限管理、削除 MTG 復旧、仕様書 |

### MTG 議事録 権限マトリクス

| 操作 | MEMBER | MANAGER | ADMIN |
|------|:------:|:-------:|:-----:|
| 自分の MTG 閲覧 | ○ | ○ | ○ |
| 他人の MTG 閲覧 | × | ○ | ○ |
| 新規投稿 | ○ | ○ | ○ |
| 編集（本人分） | ○ | ○ | ○ |
| 編集（他人分） | × | ○ | ○ |
| 論理削除 | ○（本人） | ○ | ○ |
| 削除済み復旧 | × | × | ○ |
| メンバー絞り込み検索 | × | ○ | ○ |

### 問い合わせ 権限マトリクス

| 操作 | MEMBER | MANAGER | ADMIN |
|------|:------:|:-------:|:-----:|
| 自分の起票閲覧 | ○ | ○ | ○ |
| 全件閲覧 | × | × | ○ |
| 新規起票（FAB） | ○ | ○ | ○ |
| スレッド返信 | ○ | ○ | ○ |
| ステータス変更 | × | × | ○ |
| 取り下げ（CANCELLED） | ○（本人） | ○（本人） | ○ |

### 認可の実装場所

- ページ: `getSessionUser()` + `redirect` / `forbidden()`
- API: `requireApiUser()` + `canAccess*` / `canEdit*` 関数（`src/lib/meetings.ts`, `src/lib/tickets.ts`）
- ミドルウェア: ログイン有無のみ（ロールは各ページ/APIで判定）

---

## 機能仕様 — MTG議事録

### データ項目

| 項目 | 型 | 必須 | 説明 |
|------|-----|:----:|------|
| title | String? | 任意 | 一覧の太字表示。未入力時は「ー」 |
| date | Date | ○ | MTG 実施日 |
| content | Text | ○ | 議事録本文（Markdown 対応） |
| homework | Json | - | 宿題配列 `[{ id, text, completed }]` |
| deletedAt | DateTime? | - | 論理削除日時。null = 有効 |

### 一覧

- キーワード（タイトル・内容・投稿者名）
- MTG 実施日
- 投稿メンバー（MANAGER/ADMIN のみ）
- 論理削除済みは一覧に非表示

### 詳細

- 宿題チェック → 即時 PATCH（完了で取り消し線）
- コメント投稿（編集不可）
- 編集モード → タイトル・日付・内容・宿題を修正
- 削除 → 論理削除（確認ダイアログ）

---

## 機能仕様 — 問い合わせ

### 種別

| type | 名称 | 入力項目 |
|------|------|----------|
| `SYSTEM` | システムへの問い合わせ | タイトル、現状の動き、理想の動き、備考（任意） |
| `USAGE` | 使い方の問い合わせ | タイトル、画面名、内容 |

### ステータス

| status | 表示 | 遷移 |
|--------|------|------|
| `OPEN` | 起票 | 初期状態 |
| `PENDING` | 対応中 | ADMIN が変更 |
| `RESOLVED` | 完了 | ADMIN が変更 |
| `CANCELLED` | 取り下げ | 起票者 or ADMIN |

### 一覧フィルタ

- ワード（タイトル・各フィールド・起票者名）
- ステータス
- 起票日（JST 1日単位）
- 種別（SYSTEM / USAGE）

---

## 機能仕様 — 管理・その他

### 管理設定（`/dashboard/settings` 内・ADMIN のみ）

- ユーザー一覧 + ロール変更（ADMIN のみ API）
- 削除済み MTG 一覧 + 復旧ボタン

### 使い方ガイド

- ソース: `src/content/help/member-guide.md`
- 画像: `public/help/*.png`
- 「画像の差し替え方法」セクションは ADMIN のみ表示

### 認証

- セッション Cookie: `saltus_session`（HttpOnly）
- 新規登録 → デフォルト `MEMBER`、ADMIN への昇格は管理画面から
- パスワードリセット → メールトークン（`resetToken` / `resetTokenExpires`）

---

## DB構成

### ER 概要

```
User 1──* Meeting
User 1──* MeetingComment
User 1──* Ticket
User 1──* Comment（Ticket 用）

Meeting 1──* MeetingComment
Ticket 1──* Comment
```

### テーブル一覧

#### User

| カラム | 型 | 備考 |
|--------|-----|------|
| id | String (cuid) | PK |
| email | String | unique |
| name | String | |
| passwordHash | String | |
| role | Role enum | default MEMBER |
| resetToken | String? | unique |
| resetTokenExpires | DateTime? | |
| createdAt / updatedAt | DateTime | |

#### Meeting

| カラム | 型 | 備考 |
|--------|-----|------|
| id | String (cuid) | PK |
| date | Date | MTG 実施日 |
| title | String? | 任意タイトル |
| content | Text | 議事録 |
| homework | Json | default `[]` |
| participants | String? | 未使用（将来用） |
| deletedAt | DateTime? | 論理削除 |
| userId | String | FK → User |
| createdAt | DateTime | |

#### MeetingComment

| カラム | 型 | 備考 |
|--------|-----|------|
| id, meetingId, userId, content, createdAt | | |

#### Ticket

| カラム | 型 | 備考 |
|--------|-----|------|
| title | String | default `""` |
| type | TicketType | SYSTEM / USAGE |
| status | TicketStatus | default OPEN |
| systemField1〜3 | String? | SYSTEM 用 |
| usageField1〜2 | String? | USAGE 用 |
| userId | String | FK → User |
| createdAt | DateTime | |

#### Comment（Ticket スレッド）

| カラム | 型 | 備考 |
|--------|-----|------|
| ticketId, userId, content, createdAt | | |

### インデックス

- Meeting: `userId`, `date`, `deletedAt`
- Ticket: `userId`, `status`, `createdAt`
- 各 Comment: 親 ID + `createdAt`

---

## API一覧

| メソッド | パス | 概要 |
|----------|------|------|
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |
| POST | `/api/auth/signup` | 新規登録 |
| POST | `/api/auth/password-reset` | リセット要求 |
| POST | `/api/auth/password-reset/confirm` | リセット確定 |
| POST | `/api/auth/change-password` | PW 変更 |
| GET/POST | `/api/meetings` | 一覧 / 作成 |
| GET/PATCH/DELETE | `/api/meetings/[id]` | 詳細 / 更新 / 論理削除 |
| POST | `/api/meetings/[id]/restore` | 復旧（ADMIN） |
| POST | `/api/meetings/[id]/comments` | MTG コメント |
| GET/POST | `/api/tickets` | 一覧 / 起票 |
| GET/PATCH | `/api/tickets/[id]` | 詳細 / ステータス |
| POST | `/api/tickets/[id]/comments` | 返信 |
| GET | `/api/admin/users` | ユーザー一覧 |
| PATCH | `/api/admin/users/[id]` | ロール変更 |

---

## デプロイ・環境変数

| 変数 | 用途 |
|------|------|
| `DIRECT_URL` | Supabase 5432 直結（Prisma 優先接続） |
| `DATABASE_URL` | Supabase 6543 + pgbouncer |
| `AUTH_SECRET` | JWT 署名（32文字以上） |
| `NEXT_PUBLIC_APP_URL` | 本番 URL（Render） |

### ビルド・起動

```bash
npm install && npm run build   # postinstall で prisma generate
npm start
```

Prisma Client は `@/lib/prisma.ts` で Lazy Proxy 化され、ビルド時 DB 未設定でも失敗しない。

---

## ドキュメントの更新方法

| 種類 | ファイル | 閲覧 |
|------|----------|------|
| 使い方ガイド | `src/content/help/member-guide.md` | 全員 |
| 現行仕様書 | `src/content/admin/current-spec.md` | ADMIN |
| 拡張性 | `src/content/admin/extensibility.md` | ADMIN |

Markdown を編集 → GitHub push → Render 自動デプロイで反映。
