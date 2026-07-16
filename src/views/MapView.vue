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
import MapChina3D from '@/components/map/MapChina3D.vue'
import MapBreadcrumb from '@/components/map/MapBreadcrumb.vue'
import DiarySidebar from '@/components/sidebar/DiarySidebar.vue'
import { useMapStore } from '@/stores/mapStore'
import { useLightStore } from '@/stores/lightStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useAuthStore } from '@/stores/authStore'

const mapStore = useMapStore()
const lightStore = useLightStore()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

onMounted(async () => {
  // 默认加载中国全国地图
  if (!mapStore.currentFeatures.length) {
    await mapStore.initChina()
  }
  if (authStore.user) {
    await Promise.all([lightStore.fetchFromServer(), diaryStore.fetchFromServer()])
  }
  watch(() => authStore.user, async (u) => {
    if (u) await Promise.all([lightStore.fetchFromServer(), diaryStore.fetchFromServer()])
  })
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
