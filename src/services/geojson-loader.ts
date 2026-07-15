import type { GeoJSONData } from '@/types/map'
import { GEO_REGISTRY } from './geo-registry'
import * as echarts from 'echarts'

/** GeoJSON 加载缓存 */
const geoCache = new Map<string, GeoJSONData>()

/** 加载 GeoJSON 文件 */
export async function loadGeoJSON(code: string): Promise<GeoJSONData> {
  const info = GEO_REGISTRY[code]
  if (!info) throw new Error(`未找到区域代码: ${code}`)

  // 检查缓存
  const cached = geoCache.get(code)
  if (cached) return cached

  const url = import.meta.env.BASE_URL + info.file.replace(/^\//, '')
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`加载 GeoJSON 失败: ${url}`)
  const data: GeoJSONData = await resp.json()

  geoCache.set(code, data)
  return data
}

/** 注册 ECharts 地图 */
export function registerEChartsMap(geoName: string, geoJSON: GeoJSONData) {
  const registered = echarts.getMap(geoName)
  if (registered) return // 已注册则跳过

  echarts.registerMap(geoName, geoJSON as any)
}

/** 获取当前 GeoJSON 中的所有区域名称和代码 */
export function extractRegionList(geoJSON: GeoJSONData): { name: string; code: string }[] {
  return geoJSON.features.map(f => ({
    name: f.properties.name,
    code: f.properties.adcode ? String(f.properties.adcode) : f.properties.name,
  }))
}

/** 清除缓存 */
export function clearGeoCache() {
  geoCache.clear()
}
