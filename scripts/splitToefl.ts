import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

// 參數設定
const TOEFL_DIR = './toefl'
const MIN_PER_DAY = 28
const MAX_PER_DAY = 35

function isDataRow(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|')) return false
  if (trimmed.includes('---')) return false
  if (trimmed.includes('單字') && trimmed.toLowerCase().includes('詞性')) return false
  return trimmed.split('|').filter(Boolean).length >= 4
}

function collectAllRows(): string[] {
  const files = readdirSync(TOEFL_DIR).filter(f => f.endsWith('.md'))
  const rows: string[] = []
  for (const file of files) {
    const content = readFileSync(join(TOEFL_DIR, file), 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      if (isDataRow(line)) {
        rows.push(line.trim())
      }
    }
  }
  return rows
}

function chunkRows(rows: string[]): string[][] {
  const chunks: string[][] = []
  let i = 0
  while (i < rows.length) {
    // 盡量平均但不超過 MAX_PER_DAY
    const remaining = rows.length - i
    let size = Math.min(MAX_PER_DAY, Math.max(MIN_PER_DAY, Math.floor(remaining / Math.ceil(remaining / MAX_PER_DAY))))
    if (remaining < MIN_PER_DAY) {
      // 最後不足最小值，併入前一組
      if (chunks.length > 0) {
        const last = chunks[chunks.length - 1]
        if (last) {
          last.push(...rows.slice(i))
        } else {
          chunks.push(rows.slice(i))
        }
      } else {
        chunks.push(rows.slice(i))
      }
      break
    }
    chunks.push(rows.slice(i, i + size))
    i += size
  }
  // 若最後一組超過 MAX，或不足 MIN，嘗試與前一組調整
  for (let k = chunks.length - 1; k > 0; k--) {
    const cur = chunks[k]
    const prev = chunks[k - 1]
    if (!cur || !prev) continue
    while (cur.length < MIN_PER_DAY && prev.length > MIN_PER_DAY) {
      const moved = prev.pop()
      if (moved) cur.unshift(moved)
      else break
    }
    while (cur.length > MAX_PER_DAY && prev.length < MAX_PER_DAY) {
      const moved = cur.shift()
      if (moved) prev.push(moved)
      else break
    }
  }
  return chunks
}

function buildMarkdown(dayIndex: number, rows: string[]): string {
  const header = '| 單字 | 詞性 | 中文解釋 | 英文例句 |\n| --- | --- | --- | --- |'
  return `${header}\n${rows.join('\n')}\n`
}

function main() {
  if (!existsSync(TOEFL_DIR)) {
    throw new Error(`找不到資料夾: ${TOEFL_DIR}`)
  }

  console.log('蒐集所有 TOEFL 單字列...')
  const rows = collectAllRows()
  console.log(`共蒐集 ${rows.length} 列`)
  if (rows.length === 0) {
    console.log('沒有可分割的資料，結束。')
    return
  }

  console.log('依 28-35 筆分組...')
  const groups = chunkRows(rows)
  console.log(`將產生 ${groups.length} 天`)

  // 清空原有 md 檔案
  const files = readdirSync(TOEFL_DIR).filter(f => f.endsWith('.md'))
  for (const f of files) {
    rmSync(join(TOEFL_DIR, f))
  }

  // 寫入新檔
  groups.forEach((g, idx) => {
    const day = (idx + 1).toString().padStart(2, '0')
    const file = join(TOEFL_DIR, `${day}-day_${day}.md`)
    writeFileSync(file, buildMarkdown(idx + 1, g))
  })

  console.log('分割完成。')
}

main()


