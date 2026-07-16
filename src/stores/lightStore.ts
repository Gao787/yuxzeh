import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './authStore'
import type { LitRegion, LitRegionMap } from '@/types/light'
import type { DrillLevel } from '@/types/map'

// ★ 开发模式（跟 authStore 同步，后面一起改成 false）
const DEV_MODE = true

// ★ 开发模式：从 localStorage 恢复
const STORAGE_KEY = 'yuxzeh_dev_lit'

function loadFromStorage(): LitRegionMap {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}
function saveToStorage(map: LitRegionMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export const useLightStore = defineStore('light', () => {
  const litRegionMap = ref<LitRegionMap>(DEV_MODE ? loadFromStorage() : {})
  const loading = ref(false)

  function checkLit(code: string): boolean {
    return !!litRegionMap.value[code]
  }

  const litCodes = computed(() => Object.keys(litRegionMap.value))
  const litCount = computed(() => litCodes.value.length)

  /** 从 Supabase 拉取点亮数据 */
  async function fetchFromServer() {
    const authStore = useAuthStore()
    if (DEV_MODE || !authStore.user) return
    loading.value = true
    const { data } = await supabase
      .from('lit_regions')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('lit_at', { ascending: false })
    const map: LitRegionMap = {}
    data?.forEach(r => {
      map[r.region_code] = {
        id: r.id, region_code: r.region_code, region_name: r.region_name,
        level: r.level as DrillLevel, lit_at: r.lit_at,
      }
    })
    litRegionMap.value = map
    loading.value = false
  }

  /** 点亮区域 */
  async function lightUp(regionCode: string, regionName: string, level: DrillLevel) {
    // 开发模式：直接用本地数据
    if (DEV_MODE) {
      litRegionMap.value[regionCode] = {
        region_code: regionCode, region_name: regionName, level, lit_at: new Date().toISOString(),
      }
      saveToStorage(litRegionMap.value)
      return
    }
    const authStore = useAuthStore()
    if (!authStore.user) return
    const { data, error } = await supabase
      .from('lit_regions')
      .insert({ user_id: authStore.user.id, region_code: regionCode, region_name: regionName, level })
      .select().single()
    if (!error && data) {
      litRegionMap.value[regionCode] = {
        id: data.id, region_code: data.region_code, region_name: data.region_name,
        level: data.level, lit_at: data.lit_at,
      }
    }
  }

  /** 取消点亮 */
  async function unlight(regionCode: string) {
    if (DEV_MODE) {
      delete litRegionMap.value[regionCode]
      saveToStorage(litRegionMap.value)
      return
    }
    const authStore = useAuthStore()
    if (!authStore.user) return
    const { error } = await supabase
      .from('lit_regions')
      .delete()
      .eq('user_id', authStore.user.id)
      .eq('region_code', regionCode)
    if (!error) delete litRegionMap.value[regionCode]
  }

  return { litRegionMap, loading, litCodes, litCount, checkLit, fetchFromServer, lightUp, unlight }
})
