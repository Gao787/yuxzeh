import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DrillLevel, BreadcrumbItem, GeoFeature } from '@/types/map'
import { GEO_REGISTRY } from '@/services/geo-registry'
import { loadGeoJSON, registerEChartsMap } from '@/services/geojson-loader'

export const useMapStore = defineStore('map', () => {
  const currentLevel = ref<DrillLevel>('country')
  const currentRegionCode = ref('CN')
  const currentGeoName = ref('china')
  const currentDisplayName = ref('中国')
  const selectedRegionCode = ref<string | null>(null)
  const selectedRegionName = ref<string | null>(null)
  const breadcrumb = ref<BreadcrumbItem[]>([])
  const isLoading = ref(false)
  const currentFeatures = ref<GeoFeature[]>([])
  const searchTarget = ref<string | null>(null)

  const canDrillUp = computed(() => breadcrumb.value.length > 0)
  const canDrillDown = computed(() => currentLevel.value !== 'city' && currentLevel.value !== 'district')

  /** 选中区域 */
  function selectRegion(code: string | null, name: string | null = null) {
    selectedRegionCode.value = code
    selectedRegionName.value = name
  }

  /** 钻取到下级 */
  async function drillDown(code: string) {
    const info = GEO_REGISTRY[code]
    if (!info || !info.hasChildren) return

    isLoading.value = true
    try {
      const geoJSON = await loadGeoJSON(code)
      registerEChartsMap(info.name, geoJSON)

      breadcrumb.value.push({
        code: currentRegionCode.value,
        name: currentDisplayName.value,
        level: currentLevel.value,
      })

      currentRegionCode.value = code
      currentGeoName.value = info.name
      currentLevel.value = info.level
      currentDisplayName.value = info.displayName
      currentFeatures.value = geoJSON.features
      selectedRegionCode.value = null
      selectedRegionName.value = null
    } finally {
      isLoading.value = false
    }
  }

  /** 回退到上级 */
  async function drillUp(targetCode?: string) {
    if (!canDrillUp.value) return

    let prev: BreadcrumbItem | undefined

    if (targetCode) {
      // 回到指定面包屑层级
      const idx = breadcrumb.value.findIndex(b => b.code === targetCode)
      if (idx === -1) return
      breadcrumb.value = breadcrumb.value.slice(0, idx)
    }

    prev = breadcrumb.value.pop()
    if (!prev) return

    isLoading.value = true
    try {
      const info = GEO_REGISTRY[prev.code]
      const geoJSON = await loadGeoJSON(prev.code)
      registerEChartsMap(info.name, geoJSON)

      currentRegionCode.value = prev.code
      currentGeoName.value = info.name
      currentLevel.value = prev.level
      currentDisplayName.value = prev.name
      currentFeatures.value = geoJSON.features
      selectedRegionCode.value = null
      selectedRegionName.value = null
    } finally {
      isLoading.value = false
    }
  }

  /** 初始化：加载中国全国地图 */
  async function initChina() {
    isLoading.value = true
    try {
      const geoJSON = await loadGeoJSON('CN')
      registerEChartsMap('china', geoJSON)
      // 防止覆盖已经钻取到的下级地图数据
      if (currentRegionCode.value === 'CN') {
        currentFeatures.value = geoJSON.features
      }
    } finally {
      isLoading.value = false
    }
  }

  /** 直接设置地图状态（用于 URL 同步） */
  function setMapState(
    code: string,
    geoName: string,
    level: DrillLevel,
    displayName: string,
    features: GeoFeature[],
    newBreadcrumb: BreadcrumbItem[],
  ) {
    currentRegionCode.value = code
    currentGeoName.value = geoName
    currentLevel.value = level
    currentDisplayName.value = displayName
    currentFeatures.value = features
    breadcrumb.value = newBreadcrumb
    selectedRegionCode.value = null
    selectedRegionName.value = null
    isLoading.value = false
  }

  /** 设置搜索目标（用于闪烁动画） */
  function setSearchTarget(name: string | null) {
    searchTarget.value = name
  }

  return {
    currentLevel, currentRegionCode, currentGeoName, currentDisplayName,
    selectedRegionCode, selectedRegionName, breadcrumb,
    isLoading, currentFeatures, searchTarget,
    canDrillUp, canDrillDown,
    selectRegion, drillDown, drillUp, initChina, setMapState, setSearchTarget,
  }
})
