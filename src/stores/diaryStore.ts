import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './authStore'
import type { DiaryEntry } from '@/types/diary'

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<DiaryEntry[]>([])
  const loading = ref(false)

  /** 从 Supabase 拉取日记 */
  async function fetchFromServer() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    const { data } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })

    entries.value = data || []
    loading.value = false
  }

  /** 获取某个区域的日记 */
  const getByRegion = (regionCode: string) =>
    computed(() => entries.value.filter(e => e.region_code === regionCode))

  /** 新增日记 */
  async function addEntry(regionCode: string, regionName: string, content: string) {
    const authStore = useAuthStore()
    if (!authStore.user) return null

    const { data, error } = await supabase
      .from('diaries')
      .insert({
        user_id: authStore.user.id,
        region_code: regionCode,
        region_name: regionName,
        content,
      })
      .select()
      .single()

    if (!error && data) {
      entries.value.unshift(data)
      return data
    }
    return null
  }

  /** 更新日记 */
  async function updateEntry(id: string, content: string) {
    const { data, error } = await supabase
      .from('diaries')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      const idx = entries.value.findIndex(e => e.id === id)
      if (idx !== -1) entries.value[idx] = data
    }
  }

  /** 删除日记 */
  async function deleteEntry(id: string) {
    const { error } = await supabase
      .from('diaries')
      .delete()
      .eq('id', id)

    if (!error) {
      entries.value = entries.value.filter(e => e.id !== id)
    }
  }

  return { entries, loading, getByRegion, fetchFromServer, addEntry, updateEntry, deleteEntry }
})
