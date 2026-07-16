<template>
  <header class="header-bar">
    <div class="header-left">
      <span class="logo">🗺️ Yuxzeh</span>
      <GlobalSearch />
      <NButton text size="small" @click="router.push('/messages')">💬 祝福留言板</NButton>
    </div>
    <div class="header-right">
      <template v-if="authStore.isLoggedIn">
        <span style="font-size:13px;color:#888;">{{ authStore.user?.username }}</span>
        <NButton size="small" @click="authStore.signOut()">登出</NButton>
      </template>
      <template v-else>
        <NButton size="small" @click="showLogin = true">登录</NButton>
      </template>
    </div>
  </header>

  <LoginModal v-if="showLogin" @close="showLogin = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import { useAuthStore } from '@/stores/authStore'
import GlobalSearch from '@/components/search/GlobalSearch.vue'
import LoginModal from '@/components/auth/LoginModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const showLogin = ref(false)
</script>
