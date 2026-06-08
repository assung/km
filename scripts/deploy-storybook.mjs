#!/usr/bin/env node
// scripts/deploy-storybook.mjs — build Storybook + (免費)密碼保護 + deploy 到 Netlify。
//
// 為何存在(2026-06 verified,修正舊文件「Basic Password 免費」的錯誤):
//   Netlify *dashboard* 內建的 Password Protection 是 **Pro 方案($20/mo)付費功能**,
//   free / Starter 方案沒有。free-tier 真正可用的密碼保護 = HTTP Basic Auth via `_headers` 檔。
//   本 script 在 build 產物 storybook-static/ 注入 `_headers`,Netlify edge 層用瀏覽器原生
//   帳密彈窗擋住整站。
//
// 安全:帳密從「環境變數」讀,只寫進 storybook-static/(已 gitignore)→ 永不進版控。
//       本 repo 為 public,絕不可把帳密 commit。
//
// 設定:把以下放進 .env(已 gitignore)或 export 到 shell —
//   NETLIFY_BASIC_AUTH_USER=team
//   NETLIFY_BASIC_AUTH_PASSWORD=your-shared-password
//   NETLIFY_SITE_ID=xxxxxxxx-xxxx-...   # 你的 Netlify site id(Admin URL / `netlify status` 可查)
//
// 用法:
//   npm run deploy:storybook            # build + 注入 _headers + deploy --prod
//   DRY=1 npm run deploy:storybook      # 只 build + 注入,不真的 deploy(本機檢查用)

import { execSync } from 'node:child_process'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// 極簡 .env 載入(不引外部依賴;已存在的 process.env 優先)
function loadDotEnv() {
  const f = join(ROOT, '.env')
  if (!existsSync(f)) return
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadDotEnv()

const user = process.env.NETLIFY_BASIC_AUTH_USER
const pass = process.env.NETLIFY_BASIC_AUTH_PASSWORD
const siteId = process.env.NETLIFY_SITE_ID
const dryRun = process.env.DRY === '1'

const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' })

// ① Build
console.log('① Build Storybook…')
run('npm run build-storybook')

// ② 注入 _headers Basic-Auth(整站密碼保護)
const outDir = join(ROOT, 'storybook-static')
if (user && pass) {
  writeFileSync(join(outDir, '_headers'), `/*\n  Basic-Auth: ${user}:${pass}\n`)
  console.log(`② 已注入 _headers Basic-Auth(user: ${user})—— 整站需輸入帳密`)
} else {
  console.warn('⚠️  未設 NETLIFY_BASIC_AUTH_USER / NETLIFY_BASIC_AUTH_PASSWORD')
  console.warn('   → 這次將「公開」部署(無密碼保護)!要保護:在 .env 設這兩個變數後重跑。')
}

// ③ Deploy
if (dryRun) {
  console.log('③ DRY=1 → 跳過 deploy。產物在 storybook-static/(含 _headers,若有設帳密)。')
  process.exit(0)
}
console.log('③ Deploy 到 Netlify production…')
console.log('   (若跳出「Select the project」monorepo 選單,選你的 app 即可 ——')
console.log('    --dir 已是絕對路徑,選哪個都會上傳正確的 storybook-static。)')
const siteFlag = siteId ? ` --site=${siteId}` : ''
run(`npx netlify deploy --prod --dir="${outDir}"${siteFlag}`)

console.log('\n✅ 完成。請打開 production URL 驗證:')
console.log('   - 有設帳密 → 應先跳出瀏覽器帳密彈窗,輸入後才看到 Storybook')
console.log('   - 若「沒」跳密碼框 → 代表 Netlify 對你帳號的 _headers Basic-Auth 行為有變,請改用 Pro 方案或回報。')
