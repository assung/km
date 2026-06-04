// KM 平台側邊欄 —— 對齊 DS canonical `sidebar.stories.tsx#IconCollapse` + `#MixedContent`。
//
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#MixedContent
//
// 三段結構(消費 DS Sidebar primitives,不自寫 widget):
//   1. 主導覽(SidebarMenu,扁平,每項有 icon 支援 icon 收合模式）
//   2. 我的最愛(collapsible group + hover-reveal inlineActions + meta「管理」入口）
//   3. 最近瀏覽(collapsible group + hover-reveal inlineActions + meta「查看全部」入口）
//
// 「管理 Favorites / Recent 的入口」= 各 group 底部的 `variant="meta"` 命令 row,
// 對齊 sidebar.stories.tsx MixedContent 的「查看更多」section-command 慣例。

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Avatar,
  ItemAvatar,
} from '@qijenchen/design-system'
import {
  Home, Search, FilePen, Settings2, Star, StarOff, MoreHorizontal, X,
} from 'lucide-react'
import { KIND_ICON, type FavoriteItem, type RecentPage } from './data'

const MAIN_NAV = [
  { id: 'home', label: '首頁', icon: Home },
  { id: 'search', label: '搜尋', icon: Search },
  { id: 'drafts', label: '我的草稿', icon: FilePen },
] as const

/** 側邊欄最多顯示的 recent 筆數(其餘走「查看全部」進管理頁)。 */
const SIDEBAR_RECENT_LIMIT = 5

// SidebarProvider 由 App 持有(wrap 整個 AppShell,讓 header 的 SidebarTrigger
// 跟 activeId single-selection 共用同一個 context）—— 本元件只渲 <Sidebar> 本體。
export interface KmSidebarProps {
  favorites: FavoriteItem[]
  recents: RecentPage[]
  /** 點 meta 入口 / 主導覽以外的導頁。 */
  onManageFavorites: () => void
  onViewAllRecent: () => void
  onRemoveFavorite: (id: string) => void
  onFavoriteRecent: (id: string) => void
  onRemoveRecent: (id: string) => void
}

// ── Workspace brand(對齊 chrome-header-brand canonical:raw Avatar 24px,非 row context)──
function WorkspaceBrand() {
  return (
    <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
      <Avatar size={24} shape="square" color="blue" solid alt="Acme 知識庫" />
      <span className="text-body-lg font-medium truncate group-data-[collapsible=icon]:hidden">
        Acme 知識庫
      </span>
    </div>
  )
}

// ── User footer(對齊 canonical sidebar-menu-button-with-avatar:asChild + role=group + menu-label）──
function UserFooter() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div role="group" aria-label="當前使用者">
            <ItemAvatar alt="Alan Chen" color="blue" />
            <span data-sidebar="menu-label" className="min-w-0 flex-1 truncate">Alan Chen</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function KmSidebar({
  favorites,
  recents,
  onManageFavorites,
  onViewAllRecent,
  onRemoveFavorite,
  onFavoriteRecent,
  onRemoveRecent,
}: KmSidebarProps) {
  const visibleRecents = recents.slice(0, SIDEBAR_RECENT_LIMIT)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceBrand />
      </SidebarHeader>

      <SidebarContent>
        {/* 1. 主導覽 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton id={item.id} startIcon={item.icon} tooltip={item.label}>
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 2. 我的最愛(space & page）—— collapsible group,icon 模式整段隱藏 */}
        <SidebarGroup collapsible defaultOpen className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>我的最愛</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favorites.length === 0 ? (
                <SidebarMenuItem>
                  {/* meta variant:不參與 selection,視覺退到 meta 層 */}
                  <SidebarMenuButton variant="meta" disabled>
                    尚無最愛項目
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                favorites.map((fav) => (
                  <SidebarMenuItem key={fav.id}>
                    <SidebarMenuButton
                      id={fav.id}
                      startIcon={KIND_ICON[fav.kind]}
                      tooltip={fav.name}
                      actionsReveal="hover"
                      inlineActions={[
                        { icon: StarOff, label: '移出我的最愛', onClick: () => onRemoveFavorite(fav.id) },
                        { icon: MoreHorizontal, label: '更多動作', onClick: () => {} },
                      ]}
                    >
                      {fav.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
              {/* 管理入口 —— section-command meta row（對齊 MixedContent「查看更多」慣例） */}
              <SidebarMenuItem>
                <SidebarMenuButton variant="meta" startIcon={Settings2} onClick={onManageFavorites}>
                  管理我的最愛
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 3. 最近瀏覽 —— collapsible group */}
        <SidebarGroup collapsible defaultOpen className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>最近瀏覽</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleRecents.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton variant="meta" disabled>
                    尚無瀏覽紀錄
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                visibleRecents.map((page) => (
                  <SidebarMenuItem key={page.id}>
                    <SidebarMenuButton
                      id={page.id}
                      startIcon={KIND_ICON.page}
                      tooltip={page.name}
                      actionsReveal="hover"
                      inlineActions={[
                        { icon: Star, label: '加入我的最愛', onClick: () => onFavoriteRecent(page.id) },
                        { icon: X, label: '從紀錄移除', onClick: () => onRemoveRecent(page.id) },
                      ]}
                    >
                      {page.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
              <SidebarMenuItem>
                <SidebarMenuButton variant="meta" onClick={onViewAllRecent}>
                  查看全部
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserFooter />
      </SidebarFooter>
    </Sidebar>
  )
}
