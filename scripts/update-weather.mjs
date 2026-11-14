import { readFile, writeFile } from 'node:fs/promises'

const snapshot = new URL('../src/weatherSnapshot.json', import.meta.url)
const reports = JSON.parse(await readFile(snapshot, 'utf8'))
await Promise.all(Object.keys(reports).map(async office => {
  try {
    const response = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${office}.json`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const [, weekly] = await response.json()
    if (!weekly?.reportDatetime || weekly.timeSeries?.length !== 2) throw new Error('Unexpected forecast format')
    reports[office] = weekly
  } catch (error) {
    console.warn(`JMA ${office}: ${error.message}. Keeping the saved forecast.`)
  }
}))
await writeFile(snapshot, JSON.stringify(reports) + '\n')
