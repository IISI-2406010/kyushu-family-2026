<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { summarizeHours } from './openMeteo'

const props = defineProps({ days: { type: Array, required: true } })
const locations = {
  熊本機場: [32.834, 130.855],
  阿蘇: [32.936, 131.081],
  南阿蘇: [32.827, 131.057],
  '宮崎・高千穗': [32.706, 131.307],
  阿蘇山: [32.885, 131.087],
  由布院: [33.267, 131.361],
  福岡: [33.590, 130.401],
}
const windows = {
  上午: [0, 12],
  下午: [12, 24],
  全天: [0, 24],
}
const schedule = [
  ['d1', '上午', '熊本機場'],
  ['d1', '下午', '宮崎・高千穗', '晚上回阿蘇，可備一件外套。'],
  ['d2', '全天', '南阿蘇', '火山周邊活動可備防風外套。', '阿蘇山'],
  ['d3', '上午', '阿蘇'],
  ['d3', '下午', '由布院'],
  ['d4', '上午', '由布院', '清晨前往金鱗湖，可備保暖衣物。'],
  ['d4', '下午', '福岡'],
  ['d5', '全天', '福岡'],
  ['d6', '全天', '福岡'],
]
const rows = computed(() => schedule.map(([id, period, place, note, morningPlace]) => ({
  day: props.days.find(day => day.id === id),
  period, place, note, morningPlace,
})).filter(row => row.day))
const forecast = ref({})
const updatedAt = ref(null)
const status = ref('載入預報中…')
const dateFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', dateStyle: 'short' })
const timestampFormat = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const refreshInterval = 30 * 60 * 1000
let timer
let controller

function rowKey({ day, period }) {
  return `${day.id}-${period}`
}

async function refresh() {
  if (controller) return
  const now = new Date()
  const today = dateFormat.format(now)
  const upcoming = rows.value.filter(({ day }) => {
    const daysAhead = (Date.parse(day.isoDate) - Date.parse(today)) / 86400000
    return daysAhead >= 0 && daysAhead < 16
  })
  if (!upcoming.length) {
    status.value = rows.value.every(({ day }) => day.isoDate < today)
      ? '行程日期已過' : '行程尚未進入預報範圍'
    return
  }

  const places = [...new Set(upcoming.flatMap(({ place, morningPlace }) => morningPlace ? [place, morningPlace] : [place]))]
  const coordinates = places.map(place => locations[place])
  const query = new URLSearchParams({
    latitude: coordinates.map(([latitude]) => latitude).join(','),
    longitude: coordinates.map(([, longitude]) => longitude).join(','),
    timezone: 'Asia/Tokyo',
    start_date: upcoming[0].day.isoDate,
    end_date: upcoming.at(-1).day.isoDate,
    hourly: 'weather_code,temperature_2m,precipitation_probability',
  })
  const request = new AbortController()
  controller = request
  const timeout = setTimeout(() => request.abort(), 8000)
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?' + query, { signal: request.signal })
    if (!response.ok) throw new Error('Forecast unavailable')
    const data = await response.json()
    const reports = Array.isArray(data) ? data : [data]
    const results = Object.fromEntries(upcoming.map(row => {
      const summarize = (place, period) =>
        summarizeHours(reports[places.indexOf(place)]?.hourly, row.day.isoDate, ...windows[period])
      return [rowKey(row), {
        main: summarize(row.place, row.period),
        morning: row.morningPlace ? summarize(row.morningPlace, '上午') : null,
      }]
    }))
    if (!Object.values(results).some(({ main, morning }) => main || morning)) throw new Error('Forecast unavailable')
    forecast.value = results
    updatedAt.value = new Date()
    status.value = ''
  } catch {
    status.value = updatedAt.value ? '暫時無法更新，顯示上次取得的預報。' : '暫時無法取得預報。'
  } finally {
    clearTimeout(timeout)
    controller = null
  }
}

onMounted(() => {
  refresh()
  timer = setInterval(refresh, refreshInterval)
})
onUnmounted(() => {
  clearInterval(timer)
  controller?.abort()
})
</script>

<template>
  <div class="markdown overview-weather">
    <div class="table-wrap">
      <table role="table">
        <thead>
          <tr>
            <th scope="col">日期</th>
            <th scope="col">地名</th>
            <th scope="col">天氣</th>
            <th scope="col">時段低溫–高溫</th>
            <th scope="col">最高降雨機率</th>
            <th scope="col">備註</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="rowKey(row)">
            <td><span class="cell-label" aria-hidden="true">日期</span><div>
              {{ row.day.date }}（{{ row.day.weekday }}）{{ row.period }}
            </div></td>
            <td><span class="cell-label" aria-hidden="true">地名</span><div>{{ row.place }}</div></td>
            <td><span class="cell-label" aria-hidden="true">天氣</span><div>
              <template v-if="forecast[rowKey(row)]?.main?.weather">
                <span aria-hidden="true">{{ forecast[rowKey(row)].main.weather.icon }}</span>
                {{ forecast[rowKey(row)].main.weather.label }}
              </template>
              <template v-else>—</template>
            </div></td>
            <td><span class="cell-label" aria-hidden="true">時段低溫–高溫</span><div>{{ forecast[rowKey(row)]?.main?.temperature ?? '—' }}</div></td>
            <td><span class="cell-label" aria-hidden="true">最高降雨機率</span><div>{{ forecast[rowKey(row)]?.main?.probability ?? '—' }}</div></td>
            <td><span class="cell-label" aria-hidden="true">備註</span><div>
              <template v-if="forecast[rowKey(row)]?.morning?.temperature && forecast[rowKey(row)].morning.temperature !== '—'">
                {{ row.morningPlace }}上午 {{ forecast[rowKey(row)].morning.temperature }}。<br>
              </template>
              {{ row.note ?? '—' }}
            </div></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="weather-source">
      時段以日本時間為準。上午 00:00–11:59，下午 12:00–23:59。
      氣溫為時段內逐時預報的最低與最高值，上午和全天的低溫可能出現在清晨。
      天氣顯示時段內最常見的狀況，降雨機率取該時段最高值。
      <a href="https://open-meteo.com/en/docs">資料來源 Open-Meteo</a>
    </p>
    <p class="weather-source" role="status">
      <template v-if="updatedAt">最近取得 {{ timestampFormat.format(updatedAt) }}（日本時間）。</template>
      {{ status }}
    </p>
  </div>
</template>
