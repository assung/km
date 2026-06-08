# DS Product Template

> **GitHub Template Repository** for product team apps consuming [`@qijenchen/design-system`](https://github.com/ajenchen/design-system)。
>
> **Use this template** on GitHub → fork 為你自己的 repo,跑 `npm install` + `npm run create-app <product-name>` 就上線。

## Status

- **2026-05-27** repo 重命名 + template-friendly restructure(per fork-and-go workflow)
- Seed app: `apps/template/`(預設範例,fork user 跑 create-app 後可刪)
- Add a new product app: `npm run create-app <kebab-case-name>` → 在 `apps/<name>/` 開新 app

## Template Usage(Day 0 onboarding,fork user 必讀)

### Step 1 — Fork

**Owner setup once**(本 repo 擁有者):GitHub `Settings → General → Template repository ✓` 勾選 + `Settings → General → Danger Zone → Change visibility: Public`(讓 fork user 看到「Use this template」按鈕)。

**Fork user**:GitHub「Use this template」按鈕 → Create new repo from template。

或:`git clone <this-repo>` + `git remote set-url origin <your-new-repo>`。

### Step 2 — npm install(plugin install warning 自動跑)

```bash
npm install   # postinstall 紅色 warning 提示 /plugin install
```

### Step 3 — Claude Code:plugin install + DS canonical cross-load

```
/plugin marketplace add github:ajenchen/design-system
/plugin install design-system@qijenchen-ds
```

### Step 4 — Spawn your first product app

```bash
npm run create-app order-dashboard   # 在 apps/order-dashboard/ 開新 app
npm install                          # ← 必跑:重新 link workspace symlinks 讓新 app 拿 DS deps
cd apps/order-dashboard
npm run dev                          # localhost vite 啟動
```

**為何 `npm run create-app` 後要再跑 `npm install`?** npm workspaces 在新增 workspace dir 後需重新 `npm install` 才能把 `@qijenchen/design-system` symlink 到 `apps/order-dashboard/node_modules/`。漏跑 → vite 起來抓不到 DS package。

Storybook root config `.storybook/main.ts` 自動 glob `apps/**/*.stories.tsx`,**每加新 app stories 自動現身 storybook**,不用手動 register。

### Step 5 — Setup Netlify + 部署(免費密碼保護,3 分鐘)

```bash
npm run setup:netlify       # 只做一次:CLI install + GitHub OAuth login + site 建
# Netlify dashboard → Site configuration → Environment variables → 設
#   BASIC_AUTH_USER / BASIC_AUTH_PASSWORD(帳密只存 Netlify 端,不進 repo)
cp .env.example .env        # 填 NETLIFY_SITE_ID
npm run deploy:storybook    # build + deploy(免費 edge function 密碼保護一起上)
```

**為何用 Edge Function Basic Auth?**(2026-06 實測修正)在 free 方案踩過兩個雷:① dashboard 的 Password Protection 是 **Pro $20/mo 付費**功能;② `_headers` 的 Basic-Auth 在 free 方案**不被執行**(實測 curl 回 200)。**free 方案真正可用的是 Netlify Edge Function**(`netlify/edge-functions/basic-auth.ts`,跑你自己的擋人程式,免費含)。帳密放 Netlify 環境變數,edge function 讀它比對,不符回 401 跳帳密彈窗。Identity 也已於 2024 deprecated。

### Step 6 — Push main → 自動部署

```bash
git push origin main   # Netlify auto build storybook + per-branch preview
```

DS-side hook 自動 inject deploy URL into Claude reply(plugin 提供)。

### Step 7 — Keep DS plugin + npm deps 永遠最新(auto-sync chain)

DS repo 任何 push main → 兩條 auto-chain 同時跑,確保 fork repo 不偏移:

**Chain 1 — npm dependency**(自動):
- DS bump version + tag push → `release.yml` 跑 npm publish → `repository_dispatch ds-published`
- DS push main(non-version SSOT change)→ `ssot-sync-dispatch.yml` 跑 → `repository_dispatch ds-ssot-changed`
- 此 PW repo `.github/workflows/sync-design-system.yml` 收 event → `npm update @qijenchen/*` + commit + push
- Netlify auto rebuild → DataTable / 全 token / 全 component 永遠最新

**Chain 2 — Plugin hooks/skills/memory**(半自動):
- DS 改 hook / skill / governance → plugin.json + marketplace.json 自動 bump version(per DS `sync-version-to-all-manifests.mjs`)
- Fork user 在 terminal 跑 1 command(2026-05-27 改用 Claude CLI `claude plugin` integration):

```bash
npm run sync-all   # 同時 update npm + plugin marketplace + plugin install
```

完整等同手動跑:`npm update @qijenchen/*` + `claude plugin marketplace update qijenchen-ds` + `claude plugin update design-system@qijenchen-ds`。

Plugin 改動需 **restart Claude Code session** 才 apply(SDK 限制)。

Session_start hook `check_plugin_freshness.sh` 偵測 marketplace stale → prompt run `sync-all`。

## Layout

```
ds-product-template/
├── apps/                       ← Product apps (each is independent Vite + React)
│   └── template/              ← Copy this via `npm run create-app <name>`
│       ├── src/
│       │   ├── main.tsx        ← React root + TooltipProvider
│       │   ├── App.tsx         ← Replace with your product UI
│       │   └── globals.css     ← @import tailwindcss + DS tokens
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/                   ← Cross-app shared utilities (if any)
├── scripts/
│   ├── create-app.mjs          ← `npm run create-app <name>` generator
│   └── lint-ds-internal-imports.mjs  ← Guard against importing DS internals
├── .claude/
│   └── settings.json           ← Claude Code config (plugin marketplace flow)
├── .storybook/                 ← Shared Storybook config (imports @qijenchen/storybook-config)
├── .github/
│   ├── CODEOWNERS              ← Code review routing
│   └── workflows/
│       ├── audit.yml           ← tsc + lint + build per push/PR
│       └── sync-design-system.yml ← Dependabot + DS 版本同步(repository_dispatch)
├── package.json                ← workspaces + DS deps
├── tsconfig.json               ← Base TS config (apps extend)
└── README.md                   ← You are here
```

## Claude Code plugin setup(first time)

```
/plugin marketplace add github:ajenchen/design-system
/plugin install design-system@qijenchen-ds
```

Then plugin auto-enables (`.claude/settings.json` `defaultMode: "auto"`). You get:
- 22+ skills (`/component-quality-gate`, `/visual-audit`, etc.)
- 59 hooks (auto-fire pre/post tool events)
- 31 active M-rules (CLAUDE.md instructions inherit on every session)

## Important rules(read CLAUDE.md from `design-system` repo via plugin)

- **Never modify** `node_modules/@qijenchen/design-system/`(install another copy if you need experimental changes — file PR to DS repo instead)
- Import only from public surface: `@qijenchen/design-system` top barrel,`@qijenchen/design-system/styles/tokens`,`@qijenchen/design-system/hooks/<name>`
- Run `npm run lint:imports` before commit to catch internal-path leaks

## Cloud-dev paths(全雲端,3 條路選一條走)

**Path 1 — Claude Code 直連 repo(推薦,真正零地端依賴)**:在 claude.ai/code(或 Claude 桌面 / VS Code extension)直接連你的 GitHub fork repo;Claude 把 repo clone 進 ephemeral sandbox,所有 governance hooks + skills + npm + git ops 在 sandbox 內跑。寫完 commit / push 回 GitHub。**這是 user 目前實際工作流**;不需要 Codespaces 也不需本地 IDE。

**Path 2 — GitHub Codespaces(2026-05-29 ship `.devcontainer/`,給不用 Claude Code 直連的 user)**:fork repo → `<> Code → Codespaces → Create codespace on main` → container 自動裝 Node 22 + gh CLI + jq + `@anthropic-ai/claude-code` + `netlify-cli` + Tailwind / ESLint / Prettier ext + `npm install`(via `postCreateCommand`)。Terminal 自動顯示中文 onboard banner。免費 60h/月。

**Path 3 — 本地**:`git clone` + `npm install` + `claude`(本地 macOS/Linux/WSL)。

**3 path 共通 3 step 上工**(無論在 sandbox / Codespaces / 本地 都一樣):
```bash
claude                                                         # ① 啟動 Claude Code
# 內輸: /plugin marketplace add github:ajenchen/design-system    # ② 拿 DS 治理 plugin
# 內輸: /plugin install design-system@qijenchen-ds                #    啟用 22 skills + 59 hooks
npm run setup:netlify                                          # ③ Netlify OAuth + 建 site
# Netlify dashboard → Environment variables 設 BASIC_AUTH_USER / BASIC_AUTH_PASSWORD
npm run deploy:storybook                                       # ④ build + deploy(免費 edge function 密碼保護)
```

Deploy URL 在 push 後 hook `inject_deploy_url_after_push.sh` 自動 inject 進 Claude reply(`https://<branch>--<owner>-<repo>.netlify.app` 推導 + curl 200 verify + Storybook content sniff)。

## Storybook deploy(無需 GitHub secret)

**Step 1 — Connect Netlify**:
1. Netlify Dashboard → **Add new project** → 連 fork 後的 `ds-product-template` repo
2. Netlify 自動讀根目錄 `netlify.toml` → build `storybook-static` → deploy
3. 每次 push main → Netlify auto rebuild。Per-branch preview 自動啟用。

**Step 2 — 🔒 設密碼保護(免費 Edge Function Basic Auth)**:

1. Netlify dashboard → Site configuration → **Environment variables** → 設 `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`(帳密只存 Netlify 端,不進 repo)
2. 部署:
   ```bash
   cp .env.example .env        # 填 NETLIFY_SITE_ID
   npm run deploy:storybook    # build + deploy(edge function 一起上)
   ```
3. 打開 site URL → 應跳出瀏覽器帳密彈窗 → 把 **site URL + 帳密**私訊給 stakeholder(team Slack / DM)

**為何用 Edge Function?**(2026-06 實測修正,踩過兩個雷):
- ❌ **Dashboard Password Protection** = **Pro 方案 $20/mo 付費**功能,free / Starter **沒有**(舊文件誤寫成免費,按下去會要升級)
- ❌ **`_headers` Basic-Auth** = free 方案**不執行**(實測:`_headers` 被當設定吃掉但 curl 仍回 200,完全不擋)
- ❌ **Identity** = 2024 起 Netlify deprecated
- ✅ **Edge Function**(`netlify/edge-functions/basic-auth.ts`)= free 方案真正可用(跑自己的程式比對帳密,回 401 跳彈窗)

**Defense-in-depth**(`netlify.toml` 已 ship):X-Robots-Tag noindex(搜尋引擎不收錄 URL)+ Referrer strict-origin + X-Frame SAMEORIGIN — SEO 層加固,**真實擋人**靠 edge function 那一層。

**要更細權限 / 美化密碼頁 / 只擋 preview**?
- 升 **Netlify Pro** $20/mo → 解鎖 dashboard Password Protection + Team protection(per-account login + audit log)
- 自架 **Cloudflare Access**(免費 50 user;setup 比 Netlify 複雜)
- 公開 site,只防 SEO(`X-Robots-Tag noindex`)— 若 stakeholder 不介意 URL 知道就能看

### Workflow 機制總覽

本 repo `.github/workflows/` 實際只有 2 個 workflow,deploy 不走 GitHub Actions:

| 機制 | 觸發 | 做什麼 |
|---|---|---|
| `audit.yml` | push / PR | tsc + `lint:imports` + build CI gate |
| `sync-design-system.yml` | Dependabot daily + `repository_dispatch`(DS release/SSOT change)| `npm update @qijenchen/*` + commit + push,讓 DS deps 永遠最新 |
| `netlify.toml`(Netlify Git integration)| push main / per-branch | build `storybook-static` → deploy(無需 GitHub secret)|

Storybook(含真實 product UI demo)透過 `netlify.toml` 的 Netlify Git integration 直接 deploy,push main 即 auto rebuild;不需要 `NETLIFY_AUTH_TOKEN` / site ID secret。

完整 step-by-step 詳 `docs/01-first-time-setup.md`。

## License

UNLICENSED — internal use only.
