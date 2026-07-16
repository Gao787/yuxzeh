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

/** 从 features 中查找区域代码 */
function findCode(name: string): string {
  const f = mapStore.currentFeatures.find(f => f.properties.name === name)
  if (f?.properties.adcode) return String(f.properties.adcode)
  for (const [code, info] of Object.entries(GEO_REGISTRY)) {
    if (info.displayName === name) return code
  }
  return name
}

/** ★ 构建每个区域的 regionHeight 和 itemStyle */
const seriesData = computed(() => {
  if (!mapStore.currentFeatures.length) return []
  const litMap = lightStore.litRegionMap
  const sel = mapStore.selectedRegionCode
  const target = mapStore.searchTarget

  return mapStore.currentFeatures.map(f => {
    const name = f.properties.name
    const code = findCode(name)
    const L = !!litMap[code]
    const S = code === sel
    const T = name === target

    let regionHeight = L && S ? 5 : S ? 4 : L ? 3 : 1
    if (T) regionHeight = Math.max(regionHeight, 4) // 搜索目标闪烁时抬高

    let areaColor: string
    let borderColor: string
    let borderWidth: number

    if (L && S) {
      areaColor = '#FFB6C1'; borderColor = '#D4A574'; borderWidth = 2
    } else if (L) {
      areaColor = '#FFD1DC'; borderColor = '#E8C4D0'; borderWidth = 1.5
    } else if (S) {
      areaColor = '#FFFFFF'; borderColor = '#6BAED6'; borderWidth = 2
    } else {
      areaColor = '#F5F0EB'; borderColor = '#D0C8C0'; borderWidth = 0.5
    }

    return { name, regionHeight, itemStyle: { areaColor, borderColor, borderWidth } }
  })
})

const chartOption = computed(() => ({
  series: [{
    type: 'map3D',
    map: mapStore.currentGeoName,
    roam: true,
    shading: 'realistic',
    realisticMaterial: {
      roughness: 0.4,
      metalness: 0.05,
    },
    light: {
      main: {
        intensity: 1.5,
        shadow: true,
        alpha: 30,
        beta: 55,
      },
      ambient: {
        intensity: 0.8,
      },
    },
    viewControl: {
      distance: mapStore.currentLevel === 'country' ? 130 : 90,
      alpha: 75,  // ★ 接近俯视（90=正上方，75=微微倾斜保留立体感）
      beta: 0,
      center: [0, 0.5, 0],  // 稍微下移让中国居中
      rotateSensitivity: 0.5,
      zoomSensitivity: 1.2,
    },
    groundPlane: {
      show: true,
      color: '#e8e4df',
    },
    regionHeight: 1,
    itemStyle: {
      areaColor: '#F5F0EB',
      borderColor: '#D0C8C0',
      borderWidth: 0.5,
    },
    emphasis: {
      itemStyle: {
        areaColor: '#FFFFFF',
        borderColor: '#A0A0A0',
        borderWidth: 1,
      },
      regionHeight: 2,
      label: {
        show: true,
        fontSize: 18,
        color: '#333',
        fontWeight: 700,
      },
    },
    label: {
      show: true,
      fontSize: mapStore.currentLevel === 'country' ? 13 : 14,
      color: '#555',
      fontWeight: 500,
      textBorderColor: 'rgba(255,255,255,0.8)',
      textBorderWidth: 3,
      distance: 2,
    },
    data: seriesData.value,
  }],
}))

// 点击选中
function handleClick(params: any) {
  if (!params.name) return
  const code = findCode(params.name)
  mapStore.selectRegion(code, params.name)
}

// 双击钻取
function handleDblClick(params: any) {
  if (!params.name) return
  const code = findCode(params.name)
  const info = GEO_REGISTRY[code]
  if (info?.hasChildren) {
    mapStore.drillDown(code)
  }
}

onMounted(() => {
  chart = echarts.init(chartRef.value!)
  chart.on('click', handleClick)
  chart.on('dblclick', handleDblClick)

  watch(chartOption, opt => {
    chart?.setOption(opt as any, { notMerge: false })
  }, { immediate: true })

  // 监听窗口 resize
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => chart?.resize())
  chart?.dispose()
})
</script>
