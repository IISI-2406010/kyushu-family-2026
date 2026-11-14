<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ html: { type: String, default: '' } })
const storageKey = 'kyushu-family-2026:preparation'
const checked = ref({})

try {
  const saved = JSON.parse(localStorage.getItem(storageKey))
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) checked.value = saved
} catch {
  // The checklist still works for this visit when browser storage is unavailable.
}

const groups = computed(() => {
  const document = new DOMParser().parseFromString(props.html, 'text/html')
  return [...document.querySelectorAll('h2')].map(heading => {
    const list = heading.nextElementSibling
    const items = [...(list?.querySelectorAll(':scope > li') ?? [])].map(item => ({
      html: item.innerHTML,
      title: item.querySelector('strong')?.textContent ?? item.textContent,
    }))
    return { title: heading.textContent, items }
  })
})

function updateItem(title, complete) {
  checked.value[title] = complete
  try {
    localStorage.setItem(storageKey, JSON.stringify(checked.value))
  } catch {
    // Keep the current selection available until the page is closed.
  }
}
</script>

<template>
  <section v-for="(group, groupIndex) in groups" :key="group.title" class="content-card"
    :aria-labelledby="'checklist-group-' + groupIndex">
    <h2 :id="'checklist-group-' + groupIndex">{{ group.title }}</h2>
    <ul class="checklist">
      <li v-for="(item, itemIndex) in group.items" :key="item.title">
        <input :id="`checklist-${groupIndex}-${itemIndex}`" type="checkbox"
          :checked="checked[item.title] === true"
          @change="updateItem(item.title, $event.target.checked)">
        <label :for="`checklist-${groupIndex}-${itemIndex}`" v-html="item.html"></label>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.checklist { list-style: none; margin: 0; padding: 0; }
.checklist li { display: flex; align-items: flex-start; gap: 10px; }
.checklist li + li { border-top: 1px solid var(--border); }
.checklist input { flex: none; width: 20px; height: 20px; margin: 12px 0 0; accent-color: var(--brown); }
.checklist label { flex: 1; min-height: 44px; padding: 8px 0; cursor: pointer; overflow-wrap: anywhere; }
</style>
