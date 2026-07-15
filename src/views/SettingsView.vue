<template>
  <div class="settings-page">
    <h2>设置</h2>
    <p v-if="!authStore.isLoggedIn" style="color:#999;">请先<a href="/login" style="color:#FFB6C1;">登录</a></p>

    <template v-if="authStore.isLoggedIn">
      <div class="info-card">
        <p><strong>用户名：</strong>{{ authStore.user?.username }}</p>
        <p><strong>角色：</strong>{{ authStore.isAdmin ? '管理员' : '普通用户' }}</p>
        <p><strong>已点亮区域：</strong>{{ lightStore.litCount }} 个</p>
        <p><strong>旅行日记：</strong>{{ diaryStore.entries.length }} 篇</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useLightStore } from '@/stores/lightStore'
import { useDiaryStore } from '@/stores/diaryStore'

const authStore = useAuthStore()
const lightStore = useLightStore()
const diaryStore = useDiaryStore()
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
}
.settings-page h2 {
  margin-bottom: 20px;
}
.info-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  line-height: 2;
}
</style>
