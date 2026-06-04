// 首頁 —— 快速存取我的最愛 + 最近瀏覽,並提供進入兩個管理頁的入口。

import { Avatar, Button } from '@qijenchen/design-system'
import { FileText, Settings2, ChevronRight, Star, Clock } from 'lucide-react'
import type { FavoriteItem, RecentPage } from '../data'

export interface HomePageProps {
  favorites: FavoriteItem[]
  recents: RecentPage[]
  onOpenItem: (id: string) => void
  onManageFavorites: () => void
  onViewAllRecent: () => void
}

function SectionHeading({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Star
  title: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="flex items-center gap-2 text-h5 font-semibold">
        <Icon className="size-4 text-fg-muted" aria-hidden />
        {title}
      </h2>
      {action}
    </div>
  )
}

export function HomePage({ favorites, recents, onOpenItem, onManageFavorites, onViewAllRecent }: HomePageProps) {
  return (
    <div className="mx-auto max-w-5xl px-8 py-6 flex flex-col gap-8">
      <header>
        <h1 className="text-h3 font-semibold">早安,Alan</h1>
        <p className="text-body text-fg-secondary mt-1">從你的最愛與最近瀏覽快速回到工作。</p>
      </header>

      {/* 我的最愛 */}
      <section>
        <SectionHeading
          icon={Star}
          title="我的最愛"
          action={
            <Button variant="text" size="sm" startIcon={Settings2} onClick={onManageFavorites}>
              管理
            </Button>
          }
        />
        {favorites.length === 0 ? (
          <p className="text-body text-fg-muted">尚無收藏,在 space 或 page 上點星號即可加入。</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {favorites.map((fav) => (
              <button
                key={fav.id}
                type="button"
                onClick={() => onOpenItem(fav.id)}
                className="flex items-center gap-3 rounded-lg border border-divider bg-surface p-3 text-left transition-colors hover:bg-neutral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {fav.kind === 'space' ? (
                  <Avatar size={32} shape="square" color={fav.color} solid alt={fav.name} />
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-hover">
                    <FileText className="size-4 text-fg-muted" aria-hidden />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium">{fav.name}</span>
                  <span className="block truncate text-caption text-fg-muted">
                    {fav.kind === 'space' ? `${fav.pageCount} 頁` : fav.space}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 最近瀏覽 */}
      <section>
        <SectionHeading
          icon={Clock}
          title="最近瀏覽"
          action={
            <Button variant="text" size="sm" endIcon={ChevronRight} onClick={onViewAllRecent}>
              查看全部
            </Button>
          }
        />
        {recents.length === 0 ? (
          <p className="text-body text-fg-muted">尚無瀏覽紀錄。</p>
        ) : (
          <ul className="divide-y divide-divider rounded-lg border border-divider bg-surface">
            {recents.slice(0, 4).map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  onClick={() => onOpenItem(page.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <FileText className="size-4 shrink-0 text-fg-muted" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-body">{page.name}</span>
                  <span className="shrink-0 text-caption text-fg-muted">{page.viewedLabel}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
