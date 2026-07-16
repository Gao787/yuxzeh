<template>
  <div class="search-wrapper">
    <NInput
      v-model:value="query"
      placeholder="搜索省市..."
      clearable
      @input="handleSearch"
      @focus="showDropdown = true"
      @blur="handleBlur"
    />
    <div v-if="showDropdown && results.length > 0" class="search-dropdown">
      <div
        v-for="item in results"
        :key="item.code"
        class="search-item"
        @mousedown.prevent="selectItem(item)"
      >
        <span>{{ item.name }}</span>
        <span class="region-level">{{ item.level === 'province' ? '省' : '市' }}</span>
        <span style="font-size:12px;color:#aaa;">{{ item.parentName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NInput } from 'naive-ui'
import { useMapStore } from '@/stores/mapStore'
import { PROVINCE_SEARCH_INDEX, type SearchItem } from '@/data/search-index'

const mapStore = useMapStore()
const query = ref('')
const showDropdown = ref(false)
const results = ref<SearchItem[]>([])

// 简易模糊匹配
function handleSearch() {
  if (!query.value.trim()) {
    results.value = []
    return
  }
  const q = query.value.toLowerCase()
  results.value = PROVINCE_SEARCH_INDEX
    .filter(item =>
      item.name.includes(q) ||
      item.pinyin.includes(q) ||
      item.pinyinAbbr.includes(q)
    )
    .slice(0, 8)
}

function selectItem(item: SearchItem) {
  showDropdown.value = false
  query.value = ''
  results.value = ''

  if (item.level === 'province') {
    mapStore.drillDown(item.code)
  }
}

function handleBlur() {
  // 延迟关闭，让 mousedown 先触发
  setTimeout(() => { showDropdown.value = false }, 200)
}
</script>
