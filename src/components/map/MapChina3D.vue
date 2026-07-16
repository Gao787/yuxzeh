<template>
  <div class="map-container">
    <div v-if="mapStore.isLoading" class="map-loading">
      <NSpin size="large" />
    </div>
    <div ref="chartRef" class="map-3d" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'
import { NSpin } from 'naive-ui'
import { useMapStore } from '@/stores/mapStore'
import { useLightStore } from '@/stores/lightStore'
import { GEO_REGISTRY } from '@/services/geo-registry'

const mapStore = useMapStore()
const lightStore = useLightStore()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function findCode(name: string): string {
  const f = mapStore.currentFeatures.find(f => f.properties.name === name)
  if (f?.properties.adcode) return String(f.properties.adcode)
  for (const [code, info] of Object.entries(GEO_REGISTRY)) {
    if (info.displayName === name) return code
  }
  return name
}

// ★ 深金色配色方案
const GOLD_LIT = '#9B6E00'        // 已点亮深金
const GOLD_SELECTED = '#7A5500'   // 选中+点亮深棕金
const WARM_WHITE = '#F5F0EB'      // 默认暖白
const WHITE_SELECTED = '#FFFFFF'   // 选中纯白

const seriesData = computed(() => {
  if (!mapStore.currentFeatures.length) return []
  const litMap = lightStore.litRegionMap
  const sel = mapStore.selectedRegionCode

  return mapStore.currentFeatures.map(f => {
    const name = f.properties.name
    const code = findCode(name)
    const L = !!litMap[code]
    const S = code === sel

    // regionHeight: 点亮+选中(5) > 选中(4) > 点亮(3) > 默认(1)
    const regionHeight = L && S ? 5 : S ? 4 : L ? 3 : 1

    let areaColor: string
    let borderColor: string
    let borderWidth: number

    if (L && S) {
      areaColor = GOLD_SELECTED; borderColor = '#9A6B0C'; borderWidth = 2
    } else if (L) {
      areaColor = GOLD_LIT; borderColor = '#B8860B'; borderWidth = 1.5
    } else if (S) {
      areaColor = WHITE_SELECTED; borderColor = '#6BAED6'; borderWidth = 2
    } else {
      areaColor = WARM_WHITE; borderColor = '#D0C8C0'; borderWidth = 0.5
    }

    return { name, regionHeight, itemStyle: { areaColor, borderColor, borderWidth } }
  })
})

const chartOption = computed(() => ({
  series: [{
    type: 'map3D',
    map: mapStore.currentGeoName,
    roam: 'move',         // ★ 只允许平移，禁止缩放
    shading: 'realistic',
    realisticMaterial: {
      roughness: 0.7,    // ★ 更粗糙 → 减少反光 → 颜色更显
      metalness: 0.1,
    },
    light: {
      main: {
        intensity: 1.5,
        shadow: true,
        alpha: 30,
        beta: 55,
      },
      ambient: { intensity: 0.8 },
    },
    viewControl: {
      distance: mapStore.currentLevel === 'country' ? 130 : 90,
      alpha: 75,
      beta: 0,
      center: [0, 0.5, 0],
      rotateSensitivity: 0.5,
      zoomSensitivity: 0,          // ★ 禁用滚轮缩放
      minDistance: 120,            // ★ 锁定距离
      maxDistance: 140,
    },
    groundPlane: {
      show: true,
      color: '#ffffff',
    },
    regionHeight: 1,
    // ★ 禁用 ECharts 内置选中（蓝色），由我们自己控制样式
    selectedMode: false,
    itemStyle: {
      areaColor: WARM_WHITE,
      borderColor: '#D0C8C0',
      borderWidth: 0.5,
    },
    // ★ hover 浅卡其色，只凸出
    emphasis: {
      itemStyle: {
        areaColor: '#F2ECD8',
        borderColor: '#C8B89A',
        borderWidth: 1,
      },
      regionHeight: 2,
      label: {
        show: true,
        fontSize: 18,
        color: '#5C4F3A',
        fontWeight: 700,
      },
    },
    label: {
      show: true,
      fontSize: mapStore.currentLevel === 'country' ? 13 : 14,
      color: '#555',
      fontWeight: 500,
      textBorderColor: 'rgba(255,255,255,0.85)',
      textBorderWidth: 3,
      distance: 2,
    },
    data: seriesData.value,
  }],
}))

// ★ 单击：选中区域（不钻取）
function handleClick(params: any) {
  if (!params.name) return
  const code = findCode(params.name)
  mapStore.selectRegion(code, params.name)
}

function renderChart() {
  if (!chartRef.value) return
  // 销毁旧实例
  if (chart) { chart.dispose(); chart = null }
  // 创建新实例
  chart = echarts.init(chartRef.value!)
  chart.on('click', handleClick)
  chart.setOption(chartOption.value as any)
}

onMounted(() => {
  renderChart()
  watch(chartOption, () => renderChart())
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => chart?.resize())
  chart?.dispose()
})
</script>
