// KM 平台示範資料 —— Favorites（space & page）+ Recent pages 的工作集。
//
// 設計原則:story 是 visual baseline,必須確定性(deterministic)。時間一律存「預先
// 格式化的相對標籤 + bucket」,不在 render 時跑 Date.now()(對齊 sidebar.stories.tsx
// 「固定值非 Math.random」note,否則每次 build 像素 / 文案不同 = visual regression 無法比對）。

import type { LucideIcon } from 'lucide-react'
import { Layers, FileText } from 'lucide-react'

/** 對齊 DS Avatar / Tag 的 ColorKey(知識庫 space 的識別色;neutral 作為未知 fallback)。 */
export type SpaceColor =
  | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'turquoise' | 'magenta' | 'indigo' | 'neutral'

/** Favorite 可以是一個 space 或一個 page —— 兩種 kind 共用一張清單。 */
export type FavoriteKind = 'space' | 'page'

interface FavoriteBase {
  id: string
  name: string
  /** 最後更新的相對標籤(deterministic)。 */
  updatedLabel: string
}

export interface FavoriteSpace extends FavoriteBase {
  kind: 'space'
  color: SpaceColor
  /** space 內頁面數量。 */
  pageCount: number
}

export interface FavoritePage extends FavoriteBase {
  kind: 'page'
  /** 所屬 space 名稱。 */
  space: string
  spaceColor: SpaceColor
}

export type FavoriteItem = FavoriteSpace | FavoritePage

/** Recent 列表的時間分桶,給「今天 / 本週 / 更早」filter 用。 */
export type RecentBucket = 'today' | 'week' | 'earlier'

export interface RecentPage {
  id: string
  name: string
  space: string
  spaceColor: SpaceColor
  /** 瀏覽時間的相對標籤(deterministic)。 */
  viewedLabel: string
  bucket: RecentBucket
}

/** 側邊欄 row 的 prefix icon —— space 用 Layers,page 用 FileText。 */
export const KIND_ICON: Record<FavoriteKind, LucideIcon> = {
  space: Layers,
  page: FileText,
}

export const BUCKET_LABEL: Record<RecentBucket, string> = {
  today: '今天',
  week: '本週',
  earlier: '更早',
}

// ── 示範資料(Notion / Confluence 風格的真實業務情境)──────────────────────

export const INITIAL_FAVORITES: FavoriteItem[] = [
  { id: 'sp-eng', kind: 'space', name: 'Engineering', color: 'blue', pageCount: 248, updatedLabel: '2 小時前' },
  { id: 'sp-product', kind: 'space', name: 'Product', color: 'purple', pageCount: 132, updatedLabel: '昨天' },
  { id: 'pg-roadmap', kind: 'page', name: '2026 產品路線圖', space: 'Product', spaceColor: 'purple', updatedLabel: '3 小時前' },
  { id: 'pg-onboarding', kind: 'page', name: '新人 Onboarding 清單', space: 'People Ops', spaceColor: 'green', updatedLabel: '上週' },
  { id: 'pg-runbook', kind: 'page', name: 'Incident 處理手冊', space: 'Engineering', spaceColor: 'blue', updatedLabel: '5 天前' },
  { id: 'sp-design', kind: 'space', name: 'Design', color: 'magenta', pageCount: 86, updatedLabel: '昨天' },
]

export const INITIAL_RECENTS: RecentPage[] = [
  { id: 'pg-search-rfc', name: 'RFC:全文搜尋改版', space: 'Engineering', spaceColor: 'blue', viewedLabel: '剛剛', bucket: 'today' },
  { id: 'pg-roadmap', name: '2026 產品路線圖', space: 'Product', spaceColor: 'purple', viewedLabel: '32 分鐘前', bucket: 'today' },
  { id: 'pg-standup', name: '週會記錄 06/03', space: 'Engineering', spaceColor: 'blue', viewedLabel: '今天 09:14', bucket: 'today' },
  { id: 'pg-brand', name: '品牌識別準則', space: 'Design', spaceColor: 'magenta', viewedLabel: '昨天', bucket: 'week' },
  { id: 'pg-okr', name: 'Q2 OKR 對齊', space: 'Product', spaceColor: 'purple', viewedLabel: '2 天前', bucket: 'week' },
  { id: 'pg-runbook', name: 'Incident 處理手冊', space: 'Engineering', spaceColor: 'blue', viewedLabel: '4 天前', bucket: 'week' },
  { id: 'pg-onboarding', name: '新人 Onboarding 清單', space: 'People Ops', spaceColor: 'green', viewedLabel: '上週', bucket: 'earlier' },
  { id: 'pg-handbook', name: '遠端工作守則', space: 'People Ops', spaceColor: 'green', viewedLabel: '2 週前', bucket: 'earlier' },
]
