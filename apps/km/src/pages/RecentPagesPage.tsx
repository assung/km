// 最近瀏覽 —— Recent pages 的完整列表 / 管理頁。
// 入口:側邊欄「最近瀏覽」group 底部的「查看全部」meta row。
//
// 功能:依時間分桶 filter(全部 / 今天 / 本週 / 更早)、搜尋、加入我的最愛、單筆移除、清除全部。

import { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  DataTable,
  SegmentedControl,
  SegmentedControlItem,
  Input,
  Empty,
  Button,
} from '@qijenchen/design-system'
import { Search, ExternalLink, Star, X, Trash2, Clock } from 'lucide-react'
import type { RecentPage, RecentBucket } from '../data'
import { PageNameCell, SpaceRefCell } from './cells'

type BucketFilter = 'all' | RecentBucket

export interface RecentPagesPageProps {
  recents: RecentPage[]
  favoriteIds: Set<string>
  onOpenItem: (id: string) => void
  onFavoriteRecent: (id: string) => void
  onRemoveRecent: (id: string) => void
  onClearRecents: () => void
}

const FILTERS: { value: BucketFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '本週' },
  { value: 'earlier', label: '更早' },
]

const matches = (name: string, q: string) => name.toLowerCase().includes(q.trim().toLowerCase())

export function RecentPagesPage({
  recents,
  favoriteIds,
  onOpenItem,
  onFavoriteRecent,
  onRemoveRecent,
  onClearRecents,
}: RecentPagesPageProps) {
  const [bucket, setBucket] = useState<BucketFilter>('all')
  const [query, setQuery] = useState('')

  const filtered = recents.filter(
    (r) => (bucket === 'all' || r.bucket === bucket) && matches(r.name, query),
  )

  const columns = (() => {
    const col = createColumnHelper<RecentPage>()
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
      col.accessor('viewedLabel', { header: '瀏覽時間', meta: { type: 'string', width: 160 } }),
    ]
  })()

  return (
    <div className="mx-auto max-w-5xl px-8 py-6 flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">最近瀏覽</h1>
          <p className="text-body text-fg-secondary mt-1">
            你最近開啟過的頁面。可加入我的最愛、移除單筆,或清除全部紀錄。
          </p>
        </div>
        <Button
          variant="text"
          size="sm"
          startIcon={Trash2}
          onClick={onClearRecents}
          disabled={recents.length === 0}
        >
          清除瀏覽紀錄
        </Button>
      </header>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SegmentedControl value={bucket} onValueChange={(v) => setBucket(v as BucketFilter)}>
          {FILTERS.map((f) => (
            <SegmentedControlItem key={f.value} value={f.value}>{f.label}</SegmentedControlItem>
          ))}
        </SegmentedControl>
        <Input
          startIcon={Search}
          placeholder="搜尋最近瀏覽…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="搜尋最近瀏覽"
          className="w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        height="auto"
        getRowId={(r) => r.id}
        rowActions={(r) => (
          <>
            <Button variant="text" size="xs" iconOnly startIcon={ExternalLink} aria-label="開啟" onClick={() => onOpenItem(r.id)} />
            <Button
              variant="text"
              size="xs"
              iconOnly
              startIcon={Star}
              aria-label={favoriteIds.has(r.id) ? '已在我的最愛' : '加入我的最愛'}
              disabled={favoriteIds.has(r.id)}
              onClick={() => onFavoriteRecent(r.id)}
            />
            <Button variant="text" size="xs" iconOnly startIcon={X} aria-label="從紀錄移除" onClick={() => onRemoveRecent(r.id)} />
          </>
        )}
        emptyState={
          <Empty
            icon={Clock}
            title={query || bucket !== 'all' ? '找不到符合的頁面' : '尚無瀏覽紀錄'}
            description={
              query || bucket !== 'all'
                ? '換個關鍵字或時間範圍再試試。'
                : '開啟任一頁面後,就會出現在這裡。'
            }
          />
        }
      />
    </div>
  )
}
