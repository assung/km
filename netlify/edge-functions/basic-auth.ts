// 免費 HTTP Basic Auth —— Netlify Edge Function(free 方案即可用)。
//
// 為何用這個:Netlify free 方案「不執行」`_headers` 裡的 Basic-Auth(2026-06 實測:
// `_headers` 被當設定吃掉但不擋,curl 回 200);dashboard Password Protection 又是 Pro
// $20/mo 付費。Edge Function 是跑「你自己的程式」,free 方案含,所以能真正擋住。
//
// 帳密來源:Netlify 環境變數 BASIC_AUTH_USER / BASIC_AUTH_PASSWORD
//   (在 Netlify dashboard → Site configuration → Environment variables 設,不進 repo)。
//   兩者其一未設 → 放行(避免把自己鎖在門外)。

declare const Netlify: { env: { get(key: string): string | undefined } }

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const user = Netlify.env.get('BASIC_AUTH_USER')
  const pass = Netlify.env.get('BASIC_AUTH_PASSWORD')

  // 未設定帳密 → 不擋(站台公開),避免誤鎖
  if (!user || !pass) return context.next()

  const expected = 'Basic ' + btoa(`${user}:${pass}`)
  if (request.headers.get('authorization') !== expected) {
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"' },
    })
  }

  return context.next()
}

// path 在這宣告 + netlify.toml 的 [[edge_functions]] 雙重保險(CLI --dir 部署較穩)
export const config = { path: '/*' }
