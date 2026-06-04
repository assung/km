// 管理我的最愛 —— Favorites（space & page）的管理頁。
// 入口:側邊欄「我的最愛」group 底部的「管理我的最愛」meta row。
//
// 功能:Spaces / Pages 分頁、搜尋、拖曳排序(DataTable enableRowDrag)、移出收藏、開啟原頁。
// 全程消費 DS primitives(DataTable / Tabs / Input / Empty / Button / Badge),不自寫表格 widget。

import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Empty,
  Button,
  Badge,
} from '@qijenchen/design-system'
import { Search, ExternalLink, StarOff, Star } from 'lucide-react'
import type { FavoriteItem, FavoriteSpace, FavoritePage } from '../data'
import { SpaceNameCell, PageNameCell, SpaceRefCell } from './cells'

export interface ManageFavoritesPageProps {
  favorites: FavoriteItem[]
  onOpenItem: (id: string) => void
  onRemoveFavorite: (id: string) => void
  onReorderFavorite: (sourceId: string, targetId: string, position: 'before' | 'after') => void
}

const matches = (name: string, q: string) => name.toLowerCase().includes(q.trim().toLowerCase())

function rowActions(id: string, onOpen: (id: string) => void, onRemove: (id: string) => void) {
  return (
    <>
      <Button variant="text" size="xs" iconOnly startIcon={ExternalLink} aria-label="開啟" onClick={() => onOpen(id)} />
      <Button variant="text" size="xs" iconOnly startIcon={StarOff} aria-label="移出我的最愛" onClick={() => onRemove(id)} />
    </>
  )
}

export function ManageFavoritesPage({
  favorites,
  onOpenItem,
  onRemoveFavorite,
  onReorderFavorite,
}: ManageFavoritesPageProps) {
  const [tab, setTab] = useState<'spaces' | 'pages'>('spaces')
  const [query, setQuery] = useState('')

  const spaces = useMemo(
    () => favorites.filter((f): f is FavoriteSpace => f.kind === 'space'),
    [favorites],
  )
  const pages = useMemo(
    () => favorites.filter((f): f is FavoritePage => f.kind === 'page'),
    [favorites],
  )
  const filteredSpaces = spaces.filter((s) => matches(s.name, query))
  const filteredPages = pages.filter((p) => matches(p.name, query))

  const spaceCols = useMemo(() => {
    const col = createColumnHelper<FavoriteSpace>()
    return [
      col.accessor('name', {
        header: '名稱',
        meta: { width: 320 },
        cell: ({ row }) => <SpaceNameCell name={row.original.name} color={row.original.color} />,
      }),
      col.accessor('pageCount', {
        header: '頁面數',
        meta: { width: 120 },
        cell: ({ getValue }) => <span className="text-fg-secondary">{getValue()} 頁</span>,
      }),
      col.accessor('updatedLabel', { header: '最後更新', meta: { type: 'string', width: 160 } }),
    ]
  }, [])

  const pageCols = useMemo(() => {
    const col = createColumnHelper<FavoritePage>()
    return [
      col.accessor('name', {
        header: '名稱',
        meta: { width: 320 },
        cell: ({ row }) => <PageNameCell name={row.original.name} />,
      }),
      col.accessor('space', {
        header: '所屬 Space',
        meta: { width: 200 },
        cell: ({ row }) => <SpaceRefCell name={row.original.space} color={row.original.spaceColor} />,
      }),
      col.accessor('updatedLabel', { header: '最後更新', meta: { type: 'string', width: 160 } }),
    ]
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-8 py-6 flex flex-col gap-6">
      <header>
        <h1 className="text-h3 font-semibold">管理我的最愛</h1>
        <p className="text-body text-fg-secondary mt-1">
          整理你收藏的 space 與 page。拖曳左側握把可重新排序,星號移出收藏,或開啟原始頁面。
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'spaces' | 'pages')}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="spaces" badge={<Badge count={spaces.length} />}>Spaces</TabsTrigger>
            <TabsTrigger value="pages" badge={<Badge count={pages.length} />}>Pages</TabsTrigger>
          </TabsList>
          <Input
            startIcon={Search}
            placeholder="搜尋我的最愛…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="搜尋我的最愛"
            className="w-64"
          />
        </div>

        <TabsContent value="spaces" className="mt-4">
          <DataTable
            columns={spaceCols}
            data={filteredSpaces}
            height="auto"
            getRowId={(r) => r.id}
            enableRowDrag
            onRowReorder={onReorderFavorite}
            rowActions={(r) => rowActions(r.id, onOpenItem, onRemoveFavorite)}
            emptyState={
              <Empty
                icon={Star}
                title={query ? '找不到符合的 space' : '尚無收藏的 space'}
                description={query ? '換個關鍵字再試試。' : '在 space 上點星號即可加入我的最愛。'}
              />
            }
          />
        </TabsContent>

        <TabsContent value="pages" className="mt-4">
          <DataTable
            columns={pageCols}
            data={filteredPages}
            height="auto"
            getRowId={(r) => r.id}
            enableRowDrag
            onRowReorder={onReorderFavorite}
            rowActions={(r) => rowActions(r.id, onOpenItem, onRemoveFavorite)}
            emptyState={
              <Empty
                icon={Star}
                title={query ? '找不到符合的 page' : '尚無收藏的 page'}
                description={query ? '換個關鍵字再試試。' : '在頁面上點星號即可加入我的最愛。'}
              />
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
