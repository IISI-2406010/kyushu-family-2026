<script setup>
import { computed, ref, watch } from 'vue'
import { regionalForecast, savedForecast } from './jmaWeather'
import { condition, summarizeHours } from './openMeteo'

const props = defineProps({ day: { type: Object, required: true } })

const locations = {
  高千穗: [32.706, 131.307, '450000'],
  阿蘇山: [32.885, 131.087, '430000'],
  阿蘇: [32.936, 131.081, '430000'],
  由布院: [33.267, 131.361, '440000'],
  '福岡・天神': [33.590, 130.401, '400000'],
  太宰府: [33.522, 130.535, '400000'],
}
const schedule = {
  d1: [['高千穗']],
  d2: [['阿蘇山']],
  d3: [['阿蘇', '上午', [0, 12]], ['由布院', '下午', [12, 24]]],
  d4: [['由布院', '上午', [0, 12]], ['福岡・天神', '下午', [12, 24]]],
  d5: [['太宰府']],
  d6: [['福岡・天神']],
}
const dayFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })
const stops = computed(() => schedule[props.day.id] ?? [])
const forecasts = ref({})
const statuses = ref({})

function dailySummary(daily, date) {
  const index = daily?.time?.indexOf(date) ?? -1
  const code = daily?.weather_code?.[index]
  const low = daily?.temperature_2m_min?.[index]
  const high = daily?.temperature_2m_max?.[index]
  const probability = daily?.precipitation_probability_max?.[index]
  if (![code, low, high].every(Number.isFinite)) return null
  const [icon, label] = condition(code)
  return {
    weather: { icon, label },
    temperature: `${Math.round(low)}–${Math.round(high)} °C`,
    probability: Number.isFinite(probability) ? probability + '%' : '暫無資料',
  }
}

function regionalSummary(report) {
  if (!report) return null
  const { icon, label, low, high, station, probability } = report
  return {
    ...report,
    weather: { icon, label },
    temperature: low != null && low !== '' && high != null && high !== ''
      ? `${Math.round(low)}–${Math.round(high)} °C（${station}測站）`
      : '暫無氣溫資料',
    probability: probability != null && probability !== '' ? probability + '%' : '暫無資料',
  }
}

watch(() => props.day, (day, _, onCleanup) => {
  const date = day.isoDate
  const daysAhead = (Date.parse(date) - Date.parse(dayFormat.format(new Date()))) / 86400000
  forecasts.value = {}
  statuses.value = {}
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  for (const [place, , hours] of stops.value) {
    if (daysAhead < 0 || daysAhead >= 16) {
      statuses.value[place] = daysAhead < 0 ? '已過預報日期' : '尚未進入預報範圍'
      continue
    }
    loadForecast(day, place, hours, controller.signal)
  }
}, { immediate: true })

async function loadForecast(day, place, hours, signal) {
  const [latitude, longitude, office] = locations[place]
  const date = day.isoDate
  statuses.value[place] = '載入預報中…'
  forecasts.value[place] = regionalSummary(savedForecast(day, office))
  const query = new URLSearchParams({ latitude, longitude, timezone: 'Asia/Tokyo', start_date: date, end_date: date })
  if (hours) query.set('hourly', 'weather_code,temperature_2m,precipitation_probability')
  else query.set('daily', 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max')

  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?' + query, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(3500)]),
    })
    if (!response.ok) throw new Error('Forecast unavailable')
    const { daily, hourly } = await response.json()
    const forecast = hours ? summarizeHours(hourly, date, ...hours) : dailySummary(daily, date)
    if (signal.aborted) return
    if (!forecast?.weather || forecast.temperature === '—') throw new Error('Incomplete forecast')
    forecasts.value[place] = { ...forecast, source: 'Open-Meteo', sourceUrl: 'https://open-meteo.com/' }
  } catch {
    if (signal.aborted) return
    try {
      const regional = await regionalForecast(day, office, signal)
      if (signal.aborted) return
      if (regional) forecasts.value[place] = regionalSummary(regional)
      else if (!forecasts.value[place]) statuses.value[place] = '區域預報尚未涵蓋此日期'
    } catch {
      if (!signal.aborted) statuses.value[place] = '暫時無法取得預報'
    }
  }
}
</script>

<template>
  <aside v-if="stops.length" class="day-weather-group" aria-label="當日天氣預報" aria-live="polite">
    <div v-for="[place, period] in stops" :key="place" class="day-weather">
      <div class="weather-place">
        <span v-if="forecasts[place]" class="weather-icon" role="img"
          :aria-label="forecasts[place].weather.label" :title="forecasts[place].weather.label">{{ forecasts[place].weather.icon }}</span>
        <strong>{{ period ? period + '・' : '' }}{{ period ? place : (forecasts[place]?.place ?? place) }}預報</strong>
      </div>
      <template v-if="forecasts[place]">
        <div v-if="period && forecasts[place].station" class="weather-source">{{ forecasts[place].place }}全天區域預報</div>
        <div class="weather-temperature">{{ forecasts[place].temperature }}</div>
        <div>{{ forecasts[place].station ? '降雨機率' : '最高降雨機率' }} {{ forecasts[place].probability }}</div>
        <a class="weather-source" :href="forecasts[place].sourceUrl">{{ forecasts[place].source }}</a>
        <div v-if="forecasts[place].issued" class="weather-source">發布於 {{ forecasts[place].issued }}（日本時間）</div>
      </template>
      <div v-else>{{ statuses[place] }}</div>
    </div>
  </aside>
</template>
