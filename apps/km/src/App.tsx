// KM 平台示範 App —— 對齊 DS canonical `sidebar.stories.tsx#MixedContent` baseline。
//
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#MixedContent
//
// 主軸:側邊欄的「我的最愛(space & page)」與「最近瀏覽」導航入口 + 其管理頁。
// 狀態(favorites / recents / 當前 view)集中在此,跨側邊欄、首頁、管理頁、DocPage 即時同步,
// 讓收藏 / 移除 / 排序 / 瀏覽紀錄都是真實互動(visual-audit coverable,per M15)。
//
// SSOT 鐵律:只 import `@qijenchen/design-system` public exports,禁修改 DS source。

import { useMemo, useState } from 'react'
import {
  TooltipProvider,
  SidebarProvider,
  AppShell,
  Empty,
} from '@qijenchen/design-system'
import { Search } from 'lucide-react'
import {
  INITIAL_FAVORITES,
  INITIAL_RECENTS,
  type FavoriteItem,
  type RecentPage,
  type SpaceColor,
} from './data'
import { KmSidebar } from './KmSidebar'
import { PageChrome, type Crumb } from './pages/PageChrome'
import { HomePage } from './pages/HomePage'
import { ManageFavoritesPage } from './pages/ManageFavoritesPage'
import { RecentPagesPage } from './pages/RecentPagesPage'
import { DocPage } from './pages/DocPage'

// ── Catalog:所有可開啟項目的 metadata SSOT(從初始資料合併,page 同 id 以 favorites 較完整者為準）──
interface CatalogEntry {
  id: string
  kind: 'space' | 'page'
  name: string
  updatedLabel: string
  color?: SpaceColor // space
  pageCount?: number // space
  space?: string // page
  spaceColor?: SpaceColor // page
}

const CATALOG: Record<string, CatalogEntry> = (() => {
  const map: Record<string, CatalogEntry> = {}
  for (const r of INITIAL_RECENTS) {
    map[r.id] = { id: r.id, kind: 'page', name: r.name, space: r.space, spaceColor: r.spaceColor, updatedLabel: r.viewedLabel }
  }
  for (const f of INITIAL_FAVORITES) {
    map[f.id] = f.kind === 'space'
      ? { id: f.id, kind: 'space', name: f.name, color: f.color, pageCount: f.pageCount, updatedLabel: f.updatedLabel }
      : { id: f.id, kind: 'page', name: f.name, space: f.space, spaceColor: f.spaceColor, updatedLabel: f.updatedLabel }
  }
  return map
})()

function toFavorite(entry: CatalogEntry): FavoriteItem {
  return entry.kind === 'space'
    ? { id: entry.id, kind: 'space', name: entry.name, color: entry.color ?? 'neutral', pageCount: entry.pageCount ?? 0, updatedLabel: entry.updatedLabel }
    : { id: entry.id, kind: 'page', name: entry.name, space: entry.space ?? '', spaceColor: entry.spaceColor ?? 'neutral', updatedLabel: entry.updatedLabel }
}

type KmView =
  | { kind: 'home' }
  | { kind: 'manage-favorites' }
  | { kind: 'recent' }
  | { kind: 'doc'; id: string }
  | { kind: 'placeholder'; id: 'search' | 'drafts'; label: string }

export default function App() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES)
  const [recents, setRecents] = useState<RecentPage[]>(INITIAL_RECENTS)
  const [view, setView] = useState<KmView>({ kind: 'home' })

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites])

  // ── Actions ───────────────────────────────────────────────────────────────
  const openItem = (id: string) => {
    const entry = CATALOG[id]
    if (!entry) return
    setView({ kind: 'doc', id })
    if (entry.kind === 'page') {
      // 開啟頁面 → 推到「最近瀏覽」最前(去重),標記為剛剛 / 今天。
      setRecents((prev) => {
        const without = prev.filter((r) => r.id !== id)
        const rec: RecentPage = {
          id, name: entry.name, space: entry.space ?? '', spaceColor: entry.spaceColor ?? 'neutral',
          viewedLabel: '剛剛', bucket: 'today',
        }
        return [rec, ...without]
      })
    }
  }

  const addFavorite = (id: string) =>
    setFavorites((prev) => (prev.some((f) => f.id === id) || !CATALOG[id] ? prev : [...prev, toFavorite(CATALOG[id])]))

  const removeFavorite = (id: string) => setFavorites((prev) => prev.filter((f) => f.id !== id))

  const toggleFavorite = (id: string) =>
    favoriteIds.has(id) ? removeFavorite(id) : addFavorite(id)

  const reorderFavorite = (sourceId: string, targetId: string, position: 'before' | 'after') =>
    setFavorites((prev) => {
      const arr = [...prev]
      const from = arr.findIndex((f) => f.id === sourceId)
      if (from < 0) return prev
      const [moved] = arr.splice(from, 1)
      let insert = arr.findIndex((f) => f.id === targetId)
      if (insert < 0) return prev
      if (position === 'after') insert += 1
      arr.splice(insert, 0, moved)
      return arr
    })

  const removeRecent = (id: string) => setRecents((prev) => prev.filter((r) => r.id !== id))
  const clearRecents = () => setRecents([])

  // 側邊欄 single-selection:有 id 的 row 被點 → 導頁。
  const handleSelect = (id: string) => {
    if (id === 'home') setView({ kind: 'home' })
    else if (id === 'search') setView({ kind: 'placeholder', id: 'search', label: '搜尋' })
    else if (id === 'drafts') setView({ kind: 'placeholder', id: 'drafts', label: '我的草稿' })
    else openItem(id)
  }

  const goHome = () => setView({ kind: 'home' })
  const activeId =
    view.kind === 'doc' ? view.id
      : view.kind === 'placeholder' ? view.id
        : view.kind === 'home' ? 'home'
          : '' // manage / recent 是 meta 入口,不參與 sidebar selection

  // ── Per-view chrome + body ──────────────────────────────────────────────────
  function renderView(): { crumbs: Crumb[]; body: React.ReactNode } {
    switch (view.kind) {
      case 'manage-favorites':
        return {
          crumbs: [{ label: '首頁', onClick: goHome }, { label: '管理我的最愛' }],
          body: (
            <ManageFavoritesPage
              favorites={favorites}
              onOpenItem={openItem}
              onRemoveFavorite={removeFavorite}
              onReorderFavorite={reorderFavorite}
            />
          ),
        }
      case 'recent':
        return {
          crumbs: [{ label: '首頁', onClick: goHome }, { label: '最近瀏覽' }],
          body: (
            <RecentPagesPage
              recents={recents}
              favoriteIds={favoriteIds}
              onOpenItem={openItem}
              onFavoriteRecent={addFavorite}
              onRemoveRecent={removeRecent}
              onClearRecents={clearRecents}
            />
          ),
        }
      case 'doc': {
        const entry = CATALOG[view.id]
        const title = entry?.name ?? view.id
        return {
          crumbs: [{ label: '首頁', onClick: goHome }, { label: title }],
          body: (
            <DocPage
              title={title}
              spaceLabel={entry?.kind === 'page' ? entry.space : undefined}
              isSpace={entry?.kind === 'space'}
              isFavorite={favoriteIds.has(view.id)}
              onToggleFavorite={() => toggleFavorite(view.id)}
            />
          ),
        }
      }
      case 'placeholder':
        return {
          crumbs: [{ label: '首頁', onClick: goHome }, { label: view.label }],
          body: (
            <div className="px-8 py-16">
              <Empty icon={Search} title={view.label} description="此 demo 聚焦於 Favorites / Recent 導航與管理頁,本頁為佔位。" />
            </div>
          ),
        }
      case 'home':
      default:
        return {
          crumbs: [{ label: '首頁' }],
          body: (
            <HomePage
              favorites={favorites}
              recents={recents}
              onOpenItem={openItem}
              onManageFavorites={() => setView({ kind: 'manage-favorites' })}
              onViewAllRecent={() => setView({ kind: 'recent' })}
            />
          ),
        }
    }
  }

  const { crumbs, body } = renderView()

  // TooltipProvider self-wrap:Storybook story render 跳過 main.tsx → App 必自帶 Tooltip context。
  // SidebarProvider wrap 整個 AppShell → header 的 SidebarTrigger + sidebar single-selection 共用 context。
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={handleSelect}>
        <AppShell
          layout="primary-sidebar"
          sidebar={
            <KmSidebar
              favorites={favorites}
              recents={recents}
              onManageFavorites={() => setView({ kind: 'manage-favorites' })}
              onViewAllRecent={() => setView({ kind: 'recent' })}
              onRemoveFavorite={removeFavorite}
              onFavoriteRecent={addFavorite}
              onRemoveRecent={removeRecent}
            />
          }
          header={<PageChrome crumbs={crumbs} />}
        >
          {body}
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
