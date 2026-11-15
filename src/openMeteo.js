export function condition(code) {
  if (code === 0) return ['☀️', '晴天']
  if (code === 1 || code === 2) return ['⛅', '晴時多雲']
  if (code === 3) return ['☁️', '陰天']
  if (code === 45 || code === 48) return ['🌫️', '有霧']
  if (code >= 95) return ['⛈️', '雷雨']
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['🌨️', '下雪']
  return ['🌧️', '有雨']
}

export function summarizeHours(hourly, date, start, end) {
  const temperatures = []
  const probabilities = []
  const conditions = new Map()
  for (const [index, time] of (hourly?.time ?? []).entries()) {
    const hour = Number(time.slice(11, 13))
    if (time.slice(0, 10) !== date || hour < start || hour >= end) continue
    const code = hourly.weather_code?.[index]
    const temperature = hourly.temperature_2m?.[index]
    const probability = hourly.precipitation_probability?.[index]
    if (Number.isFinite(temperature)) temperatures.push(temperature)
    if (Number.isFinite(probability)) probabilities.push(probability)
    if (!Number.isFinite(code)) continue
    const [icon, label] = condition(code)
    const entry = conditions.get(label) ?? { icon, label, count: 0 }
    entry.count += 1
    conditions.set(label, entry)
  }

  if (!temperatures.length && !probabilities.length && !conditions.size) return null
  const [mostCommon] = [...conditions.values()].sort((a, b) => b.count - a.count)
  return {
    weather: mostCommon,
    temperature: temperatures.length
      ? `${Math.round(Math.min(...temperatures))}–${Math.round(Math.max(...temperatures))} °C`
      : '—',
    probability: probabilities.length ? `${Math.max(...probabilities)}%` : '—',
  }
}
