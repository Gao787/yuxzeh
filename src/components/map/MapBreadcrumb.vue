<template>
  <div class="breadcrumb-bar">
    <template v-for="(item, idx) in crumbs" :key="item.code">
      <span v-if="idx > 0" class="sep">&gt;</span>
      <span
        class="crumb"
        :class="{ current: idx === crumbs.length - 1 }"
        @click="idx < crumbs.length - 1 && goTo(item)"
      >
        {{ item.name }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/mapStore'
import { GEO_REGISTRY } from '@/services/geo-registry'

const mapStore = useMapStore()
const router = useRouter()

const crumbs = computed(() => [
  { code: 'CN', name: '中国' },
  ...mapStore.breadcrumb,
  { code: mapStore.currentRegionCode, name: mapStore.currentDisplayName },
])

function goTo(item: { code: string }) {
  const info = GEO_REGISTRY[item.code]
  if (!info) return
  // 根据层级确定 URL
  const levelMap: Record<string, string> = {
    country: 'country',
    province: 'province',
    city: 'city',
  }
  const level = levelMap[info.level] || 'country'
  router.push(`/map/${level}/${item.code}`)
}
</script>
