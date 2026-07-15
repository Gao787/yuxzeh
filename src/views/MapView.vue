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

/** 根据 URL 参数同步地图层级 */
async function syncFromRoute() {
  const level = route.params.level as string
  const code = route.params.regionCode as string

  if (!code || code === 'CN') {
    // 已是首页：确保回到中国全国（如果 breadcrumb 非空则回退）
    while (mapStore.breadcrumb.length > 0) {
      await mapStore.drillUp()
    }
    return
  }

  // 跳转到指定区域（省份或城市）
  const info = GEO_REGISTRY[code]
  if (!info) {
    router.replace('/map/country/CN')
    return
  }

  try {
    // 加载目标 GeoJSON 并注册
    const geoJSON = await loadGeoJSON(code)
    registerEChartsMap(info.name, geoJSON)

    // 重建面包屑路径（往上回溯父级）
    const pathStack: { code: string; name: string; level: any }[] = []
    let cursor = code
    while (cursor && cursor !== 'CN') {
      const geo = GEO_REGISTRY[cursor]
      if (!geo) break
      pathStack.unshift({ code: cursor, name: geo.displayName, level: geo.level })
      cursor = geo.parentCode
    }

    // 设置面包屑（最后一项是当前区域，不放面包屑）
    const bc = pathStack.slice(0, -1)
    const self = pathStack[pathStack.length - 1]

    mapStore.setMapState(self.code, info.name, self.level, self.name, geoJSON.features, bc)
  } catch {
    console.warn(`无法加载区域: ${code}`)
    router.replace('/map/country/CN')
  }
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

watch(() => [route.params.level, route.params.regionCode], () => {
  syncFromRoute()
})
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
