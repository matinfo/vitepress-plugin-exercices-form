// Manual check only: runs the dev server, fills the form on a page, saves the generated PDF.
// Usage: npm run pdf [-- /complex-exercise out.pdf]
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { chromium } from 'playwright-core'

const page = process.argv[2] ?? '/complex-exercise'
const out = process.argv[3] ?? 'exercise.pdf'
const port = 5199
const base = `http://localhost:${port}`

const server = spawn('npx', ['vitepress', 'dev', '--port', String(port)], { stdio: 'ignore', detached: true })
function stop() {
  try {
    process.kill(-server.pid, 'SIGTERM')
  }
  catch {}
}
process.on('exit', stop)

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok)
        return
    }
    catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error('dev server did not start')
}

try {
  await waitForServer()
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext()
  const tab = await ctx.newPage()
  tab.on('dialog', d => d.dismiss())
  await tab.goto(base + page, { waitUntil: 'networkidle' })
  await tab.waitForSelector('#student-name', { timeout: 60000 })
  await tab.fill('#student-name', 'Test Student')
  await tab.fill('#student-class', 'T1')
  const [popup] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 60000 }),
    tab.click('.vpe-btn-pdf'),
  ])
  const url = popup.url()
  const data = await tab.evaluate(async (u) => {
    const buf = await (await fetch(u)).arrayBuffer()
    return Array.from(new Uint8Array(buf))
  }, url)
  await writeFile(out, Buffer.from(data))
  console.log(`PDF written: ${out}`)
  await browser.close()
}
finally {
  stop()
}
