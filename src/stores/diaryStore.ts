import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './authStore'
import type { DiaryEntry } from '@/types/diary'

const DEV_MODE = false
const DIARY_KEY = 'yuxzeh_dev_diary'

function loadDiary(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(DIARY_KEY) || '[]') }
  catch { return [] }
}
function saveDiary(e: DiaryEntry[]) {
  localStorage.setItem(DIARY_KEY, JSON.stringify(e))
}

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<DiaryEntry[]>(DEV_MODE ? loadDiary() : [])
  const loading = ref(false)

  const getByRegion = (regionCode: string) =>
    computed(() => entries.value.filter(e => e.region_code === regionCode))

  async function fetchFromServer() {
    const authStore = useAuthStore()
    if (DEV_MODE || !authStore.user) return
    loading.value = true
    const { data } = await supabase
      .from('diaries')
      .select('*')
      .order('created_at', { ascending: false })
    entries.value = data || []
    loading.value = false
  }

  async function addEntry(regionCode: string, regionName: string, content: string, image = '') {
    if (DEV_MODE) {
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        region_code: regionCode,
        region_name: regionName,
        content,
        image,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      entries.value.unshift(entry)
      saveDiary(entries.value)
      return entry
    }
    const authStore = useAuthStore()
    if (!authStore.user) return null
    const { data, error } = await supabase
      .from('diaries')
      .insert({ user_id: authStore.user.id, region_code: regionCode, region_name: regionName, content, image })
      .select().single()
    if (!error && data) { entries.value.unshift(data); return data }
    return null
  }

  async function updateEntry(id: string, content: string) {
    if (DEV_MODE) {
      const e = entries.value.find(e => e.id === id)
      if (e) { e.content = content; e.updated_at = new Date().toISOString(); saveDiary(entries.value) }
      return
    }
    const { data, error } = await supabase
      .from('diaries')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (!error && data) {
      const idx = entries.value.findIndex(e => e.id === id)
      if (idx !== -1) entries.value[idx] = data
    }
  }

  async function deleteEntry(id: string) {
    if (DEV_MODE) {
      entries.value = entries.value.filter(e => e.id !== id)
      saveDiary(entries.value)
      return
    }
    const { error } = await supabase.from('diaries').delete().eq('id', id)
    if (!error) entries.value = entries.value.filter(e => e.id !== id)
  }

  return { entries, loading, getByRegion, fetchFromServer, addEntry, updateEntry, deleteEntry }
})
