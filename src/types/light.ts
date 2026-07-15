import type { DrillLevel } from './map'

/** 点亮区域记录 */
export interface LitRegion {
  id?: string
  region_code: string
  region_name: string
  level: DrillLevel
  lit_at: string
}

/** 点亮状态映射：key = region_code */
export type LitRegionMap = Record<string, LitRegion>
