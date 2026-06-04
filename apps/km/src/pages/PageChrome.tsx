// PageChrome —— AppShell `header` slot 的當前頁 chrome bar。
// 消費 ChromeHeader primitive(不手刻 <header px-loose border-b>,per M23 2026-06-04 手刻浮層/chrome 子規則）。

import { Fragment, type ReactNode } from 'react'
import {
  ChromeHeader,
  SidebarTrigger,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@qijenchen/design-system'

export interface Crumb {
  label: string
  /** 有 onClick = 可點的中繼層;最後一項(當前頁)不傳。 */
  onClick?: () => void
}

export function PageChrome({ crumbs, actions }: { crumbs: Crumb[]; actions?: ReactNode }) {
  return (
    <ChromeHeader className="bg-surface">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList size="md">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <Fragment key={crumb.label}>
                <BreadcrumbItem>
                  {isLast || !crumb.onClick ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button type="button" onClick={crumb.onClick}>{crumb.label}</button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </ChromeHeader>
  )
}
