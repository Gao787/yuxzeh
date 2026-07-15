import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { UserProfile } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const session = ref<any>(null)
  const loading = ref(false)

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLoggedIn = computed(() => !!user.value)

  /** 初始化：检查现有 session */
  async function init() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      session.value = data.session
      await fetchProfile(data.session.user.id)
    }

    // 监听认证状态变化
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session.value = newSession
      if (newSession) {
        await fetchProfile(newSession.user.id)
      } else {
        user.value = null
      }
    })
  }

  /** 获取用户 profile */
  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      user.value = { id: data.id, username: data.username, role: data.role }
    }
  }

  /** 注册 */
  async function signUp(email: string, password: string, username: string) {
    loading.value = true
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) { loading.value = false; throw error }

    // 创建 profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        role: 'user',
      })
      await fetchProfile(data.user.id)
    }
    loading.value = false
  }

  /** 登录 */
  async function signIn(email: string, password: string) {
    loading.value = true
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { loading.value = false; throw error }

    if (data.user) {
      await fetchProfile(data.user.id)
    }
    loading.value = false
  }

  /** 登出 */
  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
  }

  return { user, session, loading, isAdmin, isLoggedIn, init, signUp, signIn, signOut }
})
