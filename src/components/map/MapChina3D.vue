<template>
  <div class="map-container">
    <div v-if="mapStore.isLoading" class="map-loading">
      <NSpin size="large" />
    </div>
    <div class="map-glass-panel">
      <div ref="shadowRef" class="map-shadow" />
      <div ref="chartRef" class="map-2d" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { NSpin } from 'naive-ui'
import { useMapStore } from '@/stores/mapStore'
import { useLightStore } from '@/stores/lightStore'
import { GEO_REGISTRY } from '@/services/geo-registry'

const mapStore = useMapStore()
const lightStore = useLightStore()
const chartRef = ref<HTMLDivElement>()
const shadowRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let shadowChart: echarts.ECharts | null = null

function findCode(name: string): string {
  const f = mapStore.currentFeatures.find(f => f.properties.name === name)
  if (f?.properties.adcode) return String(f.properties.adcode)
  for (const [code, info] of Object.entries(GEO_REGISTRY)) {
    if (info.displayName === name) return code
  }
  return name
}

const GOLD_LIT = 'rgba(200,149,108,0.6)'
const GOLD_SELECTED = 'rgba(160,112,64,0.75)'
const WARM_WHITE = 'rgba(245,240,234,0.35)'
const WHITE_SELECTED = 'rgba(255,255,255,0.55)'

const seriesData = computed(() => {
  if (!mapStore.currentFeatures.length) return []
  const litMap = lightStore.litRegionMap
  const sel = mapStore.selectedRegionCode

  return mapStore.currentFeatures.map(f => {
    const name = f.properties.name
    const code = findCode(name)
    const L = !!litMap[code]
    const S = code === sel

    let areaColor: string
    let borderColor: string
    let borderWidth: number

    if (L && S) {
      areaColor = GOLD_SELECTED; borderColor = 'rgba(139,94,60,0.6)'; borderWidth = 2
    } else if (L) {
      areaColor = GOLD_LIT; borderColor = 'rgba(184,149,108,0.5)'; borderWidth = 1.5
    } else if (S) {
      areaColor = WHITE_SELECTED; borderColor = 'rgba(140,180,208,0.6)'; borderWidth = 2
    } else {
      areaColor = WARM_WHITE; borderColor = 'rgba(216,208,200,0.4)'; borderWidth = 0.5
    }

    return { name, itemStyle: { areaColor, borderColor, borderWidth } }
  })
})

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => {
      const code = findCode(p.name)
      const lit = lightStore.checkLit(code)
      return `${p.name}${lit ? ' [已点亮]' : ''}`
    },
  },
  series: [{
    type: 'map',
    map: mapStore.currentGeoName,
    roam: false,
    selectedMode: false,
    label: {
      show: true,
      fontSize: 12,
      color: '#777',
      fontWeight: 500,
    },
    itemStyle: {
      areaColor: WARM_WHITE,
      borderColor: 'rgba(216,208,200,0.4)',
      borderWidth: 0.5,
    },
    emphasis: {
      label: { show: true, fontSize: 16, color: '#444', fontWeight: 700 },
      itemStyle: { areaColor: 'rgba(255,255,255,0.5)', borderColor: 'rgba(192,184,168,0.6)', borderWidth: 1 },
    },
    data: seriesData.value,
  }],
}))

// ★ 阴影层 option（深色 + 无标签 + offset）
const shadowOption = computed(() => ({
  ...chartOption.value,
  series: [{
    ...chartOption.value.series![0],
    label: { show: false },
    itemStyle: {
      areaColor: 'rgba(180,170,155,0.45)',
      borderColor: 'rgba(160,150,135,0.35)',
      borderWidth: 0.5,
    },
    emphasis: {
      itemStyle: { areaColor: 'rgba(180,170,155,0.5)' },
    },
    data: (chartOption.value.series![0] as any).data?.map((d: any) => ({
      ...d,
      itemStyle: {
        ...d.itemStyle,
        areaColor: d.itemStyle.areaColor === GOLD_SELECTED ? 'rgba(130,90,50,0.6)'
          : d.itemStyle.areaColor === GOLD_LIT ? 'rgba(160,120,80,0.5)'
          : 'rgba(180,170,155,0.35)',
      },
    })),
  }],
}))

function handleClick(params: any) {
  if (!params.name) return
  const code = findCode(params.name)
  mapStore.selectRegion(code, params.name)
}

function renderChart() {
  if (!chartRef.value || !shadowRef.value) return
  if (chart) { chart.dispose(); chart = null }
  if (shadowChart) { shadowChart.dispose(); shadowChart = null }

  // 阴影层（底部）
  shadowChart = echarts.init(shadowRef.value!)
  shadowChart.setOption(shadowOption.value as any)

  // 主地图层（顶部）
  chart = echarts.init(chartRef.value!)
  chart.on('click', handleClick)
  chart.setOption(chartOption.value as any)
}

onMounted(() => {
  renderChart()
  watch(chartOption, () => renderChart())
  window.addEventListener('resize', () => { chart?.resize(); shadowChart?.resize() })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => { chart?.resize(); shadowChart?.resize() })
  chart?.dispose()
  shadowChart?.dispose()
})
</script>

<style scoped>
.map-2d { width: 100%; height: 100%; }
</style>
