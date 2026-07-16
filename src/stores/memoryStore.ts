import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './authStore'

const DEV_MODE = false
const MEM_KEY = 'yuxzeh_dev_memories'

export interface Memory {
  id?: string
  user_id?: string
  username: string
  image: string
  description: string
  date: string        // YYYY-MM-DD
  created_at: string
}

function load(): Memory[] {
  try { return JSON.parse(localStorage.getItem(MEM_KEY) || '[]') }
  catch { return [] }
}
function save(mems: Memory[]) {
  localStorage.setItem(MEM_KEY, JSON.stringify(mems))
}

export const useMemoryStore = defineStore('memory', () => {
  const memories = ref<Memory[]>(DEV_MODE ? load() : [])
  const loading = ref(false)

  async function fetchMemories() {
    if (DEV_MODE) return
    loading.value = true
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    console.log('[memory] fetch result:', data?.length, 'memories, error:', error)
    memories.value = data || []
    loading.value = false
  }

  async function addMemory(imageBase64: string, description: string, date: string) {
    const authStore = useAuthStore()
    const username = authStore.user?.username || '我们'
    const userId = authStore.user?.id

    if (DEV_MODE) {
      const m: Memory = {
        id: Date.now().toString(),
        username,
        image: imageBase64,
        description,
        date: date || new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
      }
      memories.value.unshift(m)
      save(memories.value)
      return m
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({ user_id: userId, username, image: imageBase64, description, date })
      .select().single()
    if (!error && data) memories.value.unshift(data)
    return data
  }

  async function deleteMemory(id: string) {
    if (DEV_MODE) {
      memories.value = memories.value.filter(m => m.id !== id)
      save(memories.value)
      return
    }
    const { error } = await supabase.from('memories').delete().eq('id', id)
    if (!error) memories.value = memories.value.filter(m => m.id !== id)
  }

  return { memories, loading, fetchMemories, addMemory, deleteMemory }
})
