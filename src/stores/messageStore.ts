import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './authStore'

const DEV_MODE = false
const MSG_KEY = 'yuxzeh_dev_messages'

export interface Message {
  id?: string
  user_id?: string
  username: string
  content: string
  parent_id?: string
  created_at: string
}

function loadMsgs(): Message[] {
  try { return JSON.parse(localStorage.getItem(MSG_KEY) || '[]') }
  catch { return [] }
}
function saveMsgs(msgs: Message[]) {
  localStorage.setItem(MSG_KEY, JSON.stringify(msgs))
}

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>(DEV_MODE ? loadMsgs() : [])
  const loading = ref(false)

  async function fetchMessages() {
    if (DEV_MODE) return
    loading.value = true
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    messages.value = data || []
    loading.value = false
  }

  async function addMessage(content: string, parentId?: string) {
    const authStore = useAuthStore()
    const username = authStore.user?.username || '匿名'
    const userId = authStore.user?.id

    if (DEV_MODE) {
      const msg: Message = {
        id: Date.now().toString(),
        username,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString(),
      }
      messages.value.unshift(msg)
      saveMsgs(messages.value)
      return msg
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ user_id: userId, username, content, parent_id: parentId })
      .select().single()
    if (!error && data) {
      messages.value.unshift(data)
    }
    return data
  }

  async function deleteMessage(id: string) {
    if (DEV_MODE) {
      messages.value = messages.value.filter(m => m.id !== id)
      saveMsgs(messages.value)
      return
    }
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (!error) messages.value = messages.value.filter(m => m.id !== id)
  }

  return { messages, loading, fetchMessages, addMessage, deleteMessage }
})
