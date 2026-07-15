/** 地图层级 */
export type DrillLevel = 'country' | 'province' | 'city' | 'district'

/** 面包屑项 */
export interface BreadcrumbItem {
  code: string
  name: string
  level: DrillLevel
}

/** GeoJSON Feature */
export interface GeoFeature {
  type: 'Feature'
  properties: {
    name: string
    adcode?: number
    childrenNum?: number
    [key: string]: any
  }
  geometry: {
    type: string
    coordinates: any[]
  }
}

/** GeoJSON FeatureCollection */
export interface GeoJSONData {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

/** Geo 注册项 */
export interface GeoInfo {
  name: string
  file: string
  parentCode: string
  level: DrillLevel
  hasChildren: boolean
  displayName: string
}

/** 地图状态 */
export interface MapState {
  currentLevel: DrillLevel
  currentRegionCode: string
  currentGeoName: string
  selectedRegionCode: string | null
  selectedRegionName: string | null
  breadcrumb: BreadcrumbItem[]
  isLoading: boolean
  currentFeatures: GeoFeature[]
  searchTarget: string | null  // 搜索目标闪烁
}
