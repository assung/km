// 管理頁 DataTable 的自訂 cell —— 無 meta.type,DataTable 走 columnDef.cell 渲染。
// compound element(icon/avatar + label)由 consumer 自理對齊與截斷(per data-table.tsx 註解)。

import { Avatar } from '@qijenchen/design-system'
import { FileText } from 'lucide-react'
import type { SpaceColor } from '../data'

/** Space 名稱 cell —— 方形彩色 Avatar(raw,非 row context)+ 截斷標籤。 */
export function SpaceNameCell({ name, color }: { name: string; color: SpaceColor }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar size={20} shape="square" color={color} solid alt={name} />
      <span className="truncate text-foreground">{name}</span>
    </div>
  )
}

/** Page 名稱 cell —— FileText icon + 截斷標籤。 */
export function PageNameCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <FileText className="size-4 shrink-0 text-fg-muted" aria-hidden />
      <span className="truncate text-foreground">{name}</span>
    </div>
  )
}

/** 所屬 space cell —— 小 Avatar + space 名(次要色)。 */
export function SpaceRefCell({ name, color }: { name: string; color: SpaceColor }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar size={16} shape="square" color={color} solid alt={name} />
      <span className="truncate text-fg-secondary">{name}</span>
    </div>
  )
}
