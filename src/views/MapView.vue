<template>
  <div class="map-page">
    <MapBreadcrumb />
    <div class="map-content">
      <MapChina3D />
      <DiarySidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MapChina3D from '@/components/map/MapChina3D.vue'
import MapBreadcrumb from '@/components/map/MapBreadcrumb.vue'
import DiarySidebar from '@/components/sidebar/DiarySidebar.vue'
import { useMapStore } from '@/stores/mapStore'
import { useLightStore } from '@/stores/lightStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useAuthStore } from '@/stores/authStore'
import { GEO_REGISTRY } from '@/services/geo-registry'
import { loadGeoJSON, registerEChartsMap } from '@/services/geojson-loader'

const route = useRoute()
const router = useRouter()
const mapStore = useMapStore()
const lightStore = useLightStore()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

/** 根据 URL 加载地图 */
async function syncFromRoute() {
  const code = (route.params.regionCode as string) || 'CN'

  const info = GEO_REGISTRY[code]
  if (!info) {
    router.replace('/map/country/CN')
    return
  }

  mapStore.isLoading = true
  try {
    const geoJSON = await loadGeoJSON(code)
    registerEChartsMap(info.name, geoJSON)

    // 重建面包屑路径
    const path: { code: string; name: string; level: any }[] = []
    let cursor: string | undefined = code
    while (cursor && cursor !== 'CN') {
      const g = GEO_REGISTRY[cursor]
      if (!g) break
      path.unshift({ code: cursor, name: g.displayName, level: g.level })
      cursor = g.parentCode
    }

    if (code === 'CN') {
      // 回到中国全国
      mapStore.currentRegionCode = 'CN'
      mapStore.currentGeoName = info.name
      mapStore.currentLevel = info.level
      mapStore.currentDisplayName = info.displayName
      mapStore.currentFeatures = geoJSON.features
      mapStore.breadcrumb = []
    } else {
      const bc = path.slice(0, -1)
      const current = path[path.length - 1]
      if (current) {
        mapStore.currentRegionCode = current.code
        mapStore.currentGeoName = info.name
        mapStore.currentLevel = current.level
        mapStore.currentDisplayName = current.name
        mapStore.currentFeatures = geoJSON.features
        mapStore.breadcrumb = bc
      }
    }
    mapStore.selectRegion(null, null)
  } catch { /* ignore */ }
  mapStore.isLoading = false
}

onMounted(async () => {
  if (authStore.user) {
    await Promise.all([lightStore.fetchFromServer(), diaryStore.fetchFromServer()])
  }
  watch(() => authStore.user, async (u) => {
    if (u) await Promise.all([lightStore.fetchFromServer(), diaryStore.fetchFromServer()])
  })
  await syncFromRoute()
})

// ★ 监听 URL 变化（浏览器前进后退/面包屑点击）
watch(() => [route.params.level, route.params.regionCode], () => syncFromRoute())
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}
.map-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
