# DS Upgrade Flow

`@qijenchen/design-system` 升新版的流程。

## 自動 / 手動 2 條路

### 路 A:Dependabot daily PR(autonomous)

`.github/dependabot.yml` 已配 daily check。每天 0 UTC 檢測 npm 新版本 → 自動開 PR 含 version bump + diff。

Review steps:
1. PR notification 進來
2. 看 PR description / commit history(對應 DS release notes — https://github.com/ajenchen/design-system/releases)
3. CI 跑完綠 → merge

### 路 B:手動 npm update(immediate)

```
npm update @qijenchen/design-system @qijenchen/storybook-config --legacy-peer-deps
git diff package-lock.json | head
# 看 version 確認對
git add package-lock.json && git commit -m "chore(deps): bump DS"
git push
```

## Breaking change(major version bump)

DS 升 major(e.g. `v0.x` → `v1.0`)時:

1. 看 CHANGELOG.md(自動 generate via changesets)中 breaking 段
2. 跑 codemod(若 DS 提供):
   ```
   npx @qijenchen/design-system-codemod v0-to-v1 apps/<name>/src
   ```
3. 手動 review + 修剩餘
4. `npm run build` verify

## 緊急 rollback

```
# 鎖回特定版本
npm install @qijenchen/design-system@0.1.0-beta.13 --save-exact --legacy-peer-deps
```

## 同步 SSOT canonical(skills / hooks / CLAUDE.md)

`npx qijenchen-ds-init` 一次跑後,`.claude/design-system/` symlink 永遠指向 `node_modules/.../ds-canonical/`。`npm update` 後 symlink 自動跟新版 canonical(per Phase 4.12 cli-init.mjs)。

Re-run init(若 symlink 損壞):
```
rm -rf .claude/design-system CLAUDE.design-system.md
npx qijenchen-ds-init
```

## Next

→ `docs/05-troubleshooting.md` 常見問題
