const areas = {
  d1: ['450000', '宮崎縣', '宮崎'],
  d2: ['430000', '熊本縣', '熊本'],
  d3: ['440000', '大分縣', '大分'],
  d4: ['400000', '福岡縣', '福岡'],
  d5: ['400000', '福岡縣', '福岡'],
  d6: ['400000', '福岡縣', '福岡'],
}

export async function regionalForecast(day, signal) {
  const [office] = areas[day.id]
  const response = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${office}.json`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
  })
  if (!response.ok) throw new Error('Regional forecast unavailable')

  const [, weekly] = await response.json()
  return readForecast(day, weekly)
}

export function savedForecast(day) {
  return readForecast(day, snapshot[areas[day.id][0]])
}

function readForecast(day, weekly) {
  const [office, region, station] = areas[day.id]
  const [weather, temperatures] = weekly.timeSeries
  const weatherIndex = weather.timeDefines.findIndex(time => time.startsWith(day.isoDate))
  if (weatherIndex < 0) return null
  const temperatureIndex = temperatures.timeDefines.findIndex(time => time.startsWith(day.isoDate))
  const conditions = weather.areas[0]
  const readings = temperatures.areas[0]
  const code = conditions.weatherCodes[weatherIndex]
  const [icon, label] = {
    1: ['☀️', '以晴天為主'],
    2: ['☁️', '以陰天為主'],
    3: ['🌧️', '以雨天為主'],
    4: ['🌨️', '以雪天為主'],
  }[code?.[0]] ?? ['🌡️', '暫無天氣概況']
  return {
    icon, label,
    place: region,
    station,
    issued: weekly.reportDatetime.slice(0, 16).replace('T', ' '),
    low: readings.tempsMin[temperatureIndex],
    high: readings.tempsMax[temperatureIndex],
    probability: conditions.pops[weatherIndex],
    source: '日本氣象廳',
    sourceUrl: `https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=${office}`,
  }
}
import snapshot from './weatherSnapshot.json' with { type: 'json' }

