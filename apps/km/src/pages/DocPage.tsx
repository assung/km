// DocPage —— 開啟某個 space / page 後的通用內容頁(本 demo 的「相關頁面」落點)。
// 提供「加入 / 移出我的最愛」toggle,讓收藏動作在頁面層也閉環。

import { Avatar, Button } from '@qijenchen/design-system'
import { FileText, Star, StarOff } from 'lucide-react'

export interface DocPageProps {
  title: string
  /** space 名(page 顯示所屬 space);space 本身不傳。 */
  spaceLabel?: string
  isSpace: boolean
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function DocPage({ title, spaceLabel, isSpace, isFavorite, onToggleFavorite }: DocPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8 flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {isSpace ? (
            <Avatar size={40} shape="square" color="blue" solid alt={title} />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-hover">
              <FileText className="size-5 text-fg-muted" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-h3 font-semibold truncate">{title}</h1>
            {spaceLabel && <p className="text-caption text-fg-muted mt-0.5">{spaceLabel}</p>}
          </div>
        </div>
        <Button
          variant={isFavorite ? 'secondary' : 'tertiary'}
          size="sm"
          startIcon={isFavorite ? StarOff : Star}
          onClick={onToggleFavorite}
        >
          {isFavorite ? '移出我的最愛' : '加入我的最愛'}
        </Button>
      </header>

      <div className="space-y-4 text-body text-fg-secondary">
        <p>
          這是 <span className="text-foreground font-medium">{title}</span> 的內容頁。在真實知識庫產品中,
          這裡會渲染文件正文 / 子頁面樹 / 協作者等。本 demo 聚焦於側邊欄的 Favorites 與 Recent 導航入口
          及其管理頁。
        </p>
        <p>
          從側邊欄開啟此頁會自動加入「最近瀏覽」;在這裡或側邊欄 hover row 都能加入 / 移出我的最愛,
          狀態跨側邊欄、首頁、管理頁即時同步。
        </p>
      </div>
    </div>
  )
}
