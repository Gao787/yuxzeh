import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { UserProfile } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const session = ref<any>(null)
  const loading = ref(false)

  // ★ 开发模式：暂时释放所有权限（后面改回 false）
  const DEV_MODE = false

  const isAdmin = computed(() => DEV_MODE || user.value?.role === 'admin')
  const isLoggedIn = computed(() => DEV_MODE || !!user.value)

  async function init() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      session.value = data.session
      await fetchProfile(data.session.user.id)
    }
    supabase.auth.onAuthStateChange(async (_e, s) => {
      session.value = s
      if (s) await fetchProfile(s.user.id)
      else user.value = null
    })
  }

  async function fetchProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data) user.value = { id: data.id, username: data.username, role: data.role }
  }

  /** 注册 */
  async function signUp(email: string, password: string, username: string) {
    loading.value = true
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) { loading.value = false; throw error }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, username, email, role: 'user' })
      await fetchProfile(data.user.id)
    }
    loading.value = false
  }

  /** 邮箱登录 */
  async function signIn(email: string, password: string) {
    loading.value = true
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { loading.value = false; throw error }
    if (data.user) await fetchProfile(data.user.id)
    loading.value = false
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
  }

  return { user, session, loading, isAdmin, isLoggedIn, init, signUp, signIn, signOut }
})
