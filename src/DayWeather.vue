<script setup>
import { computed, ref, watch } from 'vue'
import { regionalForecast, savedForecast } from './jmaWeather'

const props = defineProps({ day: { type: Object, required: true } })

// Representative forecast point for each day's itinerary.
const locations = {
  d1: ['高千穗', 32.706, 131.307],
  d2: ['阿蘇山', 32.885, 131.087],
  d3: ['由布院', 33.267, 131.361],
  d4: ['福岡・天神', 33.590, 130.401],
  d5: ['太宰府', 33.522, 130.535],
  d6: ['福岡・天神', 33.590, 130.401],
}
const dayFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })
const location = computed(() => locations[props.day.id])
const forecast = ref(null)
const status = ref('')
const temperature = computed(() => {
  const { low, high, station } = forecast.value
  const value = low != null && low !== '' && high != null && high !== '' ? `${Math.round(low)}–${Math.round(high)} °C` : '暫無氣溫資料'
  return station ? `${value}（${station}測站）` : value
})

function condition(code) {
  if (code === 0) return ['☀️', '晴天']
  if (code === 1 || code === 2) return ['⛅', '晴時多雲']
  if (code === 3) return ['☁️', '陰天']
  if (code === 45 || code === 48) return ['🌫️', '有霧']
  if (code >= 95) return ['⛈️', '雷雨']
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['🌨️', '下雪']
  return ['🌧️', '有雨']
}

watch(() => props.day.isoDate, async (date, _, onCleanup) => {
  forecast.value = null
  if (!location.value) return
  const daysAhead = (Date.parse(date) - Date.parse(dayFormat.format(new Date()))) / 86400000
  if (daysAhead < 0 || daysAhead >= 16) {
    status.value = daysAhead < 0 ? '已過預報日期' : '尚未進入預報範圍'
    return
  }

  status.value = '載入預報中…'
  forecast.value = savedForecast(props.day)
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  const [, latitude, longitude] = location.value
  const query = new URLSearchParams({
    latitude, longitude, timezone: 'Asia/Tokyo', start_date: date, end_date: date,
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
  })
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?' + query, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(3500)]),
    })
    if (!response.ok) throw new Error('Forecast unavailable')
    const { daily } = await response.json()
    const index = daily?.time?.indexOf(date) ?? -1
    const code = daily?.weather_code?.[index]
    const low = daily?.temperature_2m_min?.[index]
    const high = daily?.temperature_2m_max?.[index]
    const precipitation = daily?.precipitation_probability_max?.[index]
    if (controller.signal.aborted) return
    if (![code, low, high].every(Number.isFinite)) throw new Error('Incomplete forecast')
    const [icon, label] = condition(code)
    forecast.value = {
      icon, label, low, high,
      probability: Number.isFinite(precipitation) ? precipitation : null,
      place: location.value[0],
      source: 'Open-Meteo', sourceUrl: 'https://open-meteo.com/',
    }
  } catch {
    if (controller.signal.aborted) return
    try {
      const regional = await regionalForecast(props.day, controller.signal)
      if (controller.signal.aborted) return
      if (regional) forecast.value = regional
      else if (!forecast.value) status.value = '區域預報尚未涵蓋此日期'
    } catch {
      if (!controller.signal.aborted) status.value = '暫時無法取得預報'
    }
  }
}, { immediate: true })
</script>

<template>
  <aside v-if="location" class="day-weather" aria-label="當日天氣預報" aria-live="polite">
    <div class="weather-place">
      <span v-if="forecast" class="weather-icon" role="img" :aria-label="forecast.label" :title="forecast.label">{{ forecast.icon }}</span>
      <strong>{{ forecast?.place ?? location[0] }}預報</strong>
    </div>
    <template v-if="forecast">
      <div class="weather-temperature">{{ temperature }}</div>
      <div>{{ forecast.station ? '降雨機率' : '最高降雨機率' }} {{ forecast.probability != null && forecast.probability !== '' ? forecast.probability + '%' : '暫無資料' }}</div>
    </template>
    <div v-else>{{ status }}</div>
    <a v-if="forecast" class="weather-source" :href="forecast.sourceUrl">{{ forecast.source }}</a>
    <div v-if="forecast?.issued" class="weather-source">發布於 {{ forecast.issued }}（日本時間）</div>
  </aside>
</template>
