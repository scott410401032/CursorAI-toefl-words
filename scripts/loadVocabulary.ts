import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { DayVocabulary, Word } from '../src/types/vocabulary'

// 解析 markdown 表格行
function parseMarkdownTableRow(line: string): Word | null {
  // 移除表格分隔符號
  const cleanLine = line.replace(/^\|/, '').replace(/\|$/, '')
  const columns = cleanLine.split('|').map(col => col.trim())

  if (columns.length < 4) {
    return null
  }

  const [word, partOfSpeech, definition, example] = columns

  // 檢查是否為表格標題行
  if (!word || word.includes('---') || word === '單字') {
    return null
  }

  if (!partOfSpeech || !definition || !example) {
    return null
  }

  return {
    id: 0, // 稍後會重新編號
    word: word.trim(),
    partOfSpeech: partOfSpeech.trim(),
    definition: definition.trim(),
    example: example.trim()
  }
}

// 解析單個 markdown 檔案
function parseMarkdownFile(filePath: string): DayVocabulary | null {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // 從檔名提取 day 編號
    const fileName = filePath.split('/').pop() || ''
    const dayMatch = fileName.match(/(\d+)-day_\d+\.md/)
    if (!dayMatch || !dayMatch[1]) {
      console.warn(`無法從檔名 ${fileName} 提取 day 編號`)
      return null
    }

    const day = parseInt(dayMatch[1], 10)
    const words: Word[] = []

    for (const line of lines) {
      const word = parseMarkdownTableRow(line)
      if (word) {
        words.push(word)
      }
    }

    // 重新編號
    words.forEach((word, index) => {
      word.id = index + 1
    })

    return {
      day,
      words
    }
  } catch (error) {
    console.error(`解析檔案 ${filePath} 時發生錯誤:`, error)
    return null
  }
}

// 載入指定資料夾的所有 markdown 檔案
function loadVocabularyFromFolder(folderPath: string): DayVocabulary[] {
  const vocabulary: DayVocabulary[] = []

  if (!existsSync(folderPath)) {
    console.warn(`資料夾 ${folderPath} 不存在`)
    return vocabulary
  }

  const files = readdirSync(folderPath)
  const markdownFiles = files.filter(file => file.endsWith('.md'))

  for (const file of markdownFiles) {
    const filePath = join(folderPath, file)
    const dayVocabulary = parseMarkdownFile(filePath)

    if (dayVocabulary) {
      vocabulary.push(dayVocabulary)
    }
  }

  // 按 day 編號排序
  vocabulary.sort((a, b) => a.day - b.day)

  return vocabulary
}

// 主函數
function main() {
  console.log('開始載入單字資料...')

  // 載入托福單字
  console.log('載入托福單字...')
  const toeflVocabulary = loadVocabularyFromFolder('./toefl')
  console.log(`載入了 ${toeflVocabulary.length} 天的托福單字`)

  // 載入一般單字
  console.log('載入一般單字...')
  const dailyVocabulary = loadVocabularyFromFolder('./daily')
  console.log(`載入了 ${dailyVocabulary.length} 天的一般單字`)

  // 確保 public 資料夾存在
  if (!existsSync('./public')) {
    mkdirSync('./public')
  }

  // 寫入 JSON 檔案
  console.log('寫入 JSON 檔案...')
  writeFileSync('./public/toefl.json', JSON.stringify(toeflVocabulary, null, 2))
  writeFileSync('./public/daily.json', JSON.stringify(dailyVocabulary, null, 2))

  console.log('單字資料載入完成!')
  console.log(`托福單字: ${toeflVocabulary.length} 天`)
  console.log(`一般單字: ${dailyVocabulary.length} 天`)

  // 顯示統計資訊
  const totalToeflWords = toeflVocabulary.reduce((sum, day) => sum + day.words.length, 0)
  const totalDailyWords = dailyVocabulary.reduce((sum, day) => sum + day.words.length, 0)

  console.log(`總計托福單字: ${totalToeflWords} 個`)
  console.log(`總計一般單字: ${totalDailyWords} 個`)
}

// 執行主函數
main()
