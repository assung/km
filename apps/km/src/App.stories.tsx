// KM 平台 —— Favorites（space & page）+ Recent pages 導航入口及其管理頁的 product demo。
// 對齊 DS canonical `sidebar.stories.tsx#MixedContent`(SidebarMenu + collapsible group +
// hover-reveal inlineActions + meta section-command 入口)。

import type { Meta, StoryObj } from '@storybook/react'
import App from './App'

const meta: Meta<typeof App> = {
  title: 'Apps/km/知識庫導航',
  component: App,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '知識管理平台 demo —— 側邊欄的「我的最愛(space & page)」與「最近瀏覽」導航入口,加上兩個管理頁:\n\n' +
          '- **我的最愛**:collapsible group + hover-reveal inlineActions(移出收藏 / 更多);底部 meta row「管理我的最愛」進管理頁。\n' +
          '- **最近瀏覽**:collapsible group;底部 meta row「查看全部」進完整列表頁。\n' +
          '- **管理我的最愛頁**:Spaces / Pages 分頁 + 搜尋 + DataTable 拖曳排序 + 移出收藏。\n' +
          '- **最近瀏覽頁**:時間分桶 filter + 搜尋 + 加入最愛 / 單筆移除 / 清除全部。\n\n' +
          '收藏 / 移除 / 排序 / 瀏覽紀錄皆為真實互動,跨側邊欄、首頁、管理頁、DocPage 即時同步。\n\n' +
          'SSOT 鐵律:只消費 `@qijenchen/design-system` primitives,**禁修改 DS source**。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof App>

export const Default: Story = {
  name: '完整導航',
}
