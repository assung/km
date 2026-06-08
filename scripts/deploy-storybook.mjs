#!/usr/bin/env node
// scripts/deploy-storybook.mjs — build Storybook + deploy 到 Netlify(含免費密碼保護)。
//
// 密碼保護方式(2026-06,實測修正):
//   - ❌ `_headers` Basic-Auth → Netlify free 方案「不執行」(實測 curl 回 200)
//   - ❌ dashboard Password Protection → Pro $20/mo 付費功能
//   - ✅ **Edge Function**(netlify/edge-functions/basic-auth.ts)→ free 方案可用,本專案採用
//
// 帳密設在「Netlify 環境變數」(dashboard → Site configuration → Environment variables):
//   BASIC_AUTH_USER / BASIC_AUTH_PASSWORD     ← edge function 讀這兩個(沒設 = 站台公開)
// 不寫進 repo、也不寫進 build 產物,最安全。
//
// .env(本機,已 gitignore)只需要:
//   NETLIFY_SITE_ID=xxxx   ← 要部署到哪個 site(沒設則用已 link 的 site)
//
// 用法:
//   npm run deploy:storybook         # build + deploy --prod
//   DRY=1 npm run deploy:storybook   # 只 build,不部署

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// 極簡 .env 載入(取 NETLIFY_SITE_ID;已存在的 process.env 優先)
function loadDotEnv() {
  const f = join(ROOT, '.env')
  if (!existsSync(f)) return
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadDotEnv()

const siteId = process.env.NETLIFY_SITE_ID
const dryRun = process.env.DRY === '1'
const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' })

console.log('① Build Storybook…')
run('npm run build-storybook')

if (dryRun) {
  console.log('② DRY=1 → 跳過 deploy。產物在 storybook-static/。')
  process.exit(0)
}

console.log('② Deploy 到 Netlify production(含 edge function basic-auth)…')
console.log('   (若跳出「Select the project」選單,選你的 app 即可。)')
const siteFlag = siteId ? ` --site=${siteId}` : ''
run(`npx netlify deploy --prod --dir="${join(ROOT, 'storybook-static')}"${siteFlag}`)

console.log('\n✅ Deploy 完成。密碼保護由 edge function 負責,確認你已在 Netlify 設好環境變數:')
console.log('   BASIC_AUTH_USER / BASIC_AUTH_PASSWORD')
console.log('   (Site configuration → Environment variables。沒設 = 站台公開不擋。)')
console.log('驗證:curl -sI <site-url> 應回 HTTP 401;瀏覽器無痕開應跳帳密彈窗。')
