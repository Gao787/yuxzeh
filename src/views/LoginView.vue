<template>
  <div class="login-page">
    <div class="login-card">
      <h2>🗺️ Yuxzeh</h2>
      <p class="subtitle">{{ isLogin ? '登录你的账号' : '创建新账号' }}</p>

      <NInput v-model:value="email" placeholder="邮箱" size="large" style="margin-bottom:12px;" />
      <NInput v-model:value="password" type="password" placeholder="密码" size="large" style="margin-bottom:12px;" />
      <NInput v-if="!isLogin" v-model:value="username" placeholder="用户名" size="large" style="margin-bottom:12px;" />

      <NButton type="primary" size="large" block :loading="authStore.loading" @click="handleSubmit">
        {{ isLogin ? '登录' : '注册' }}
      </NButton>

      <p v-if="error" style="color:#e74c3c;font-size:13px;margin-top:8px;text-align:center;">{{ error }}</p>

      <p style="text-align:center;margin-top:16px;font-size:13px;color:#888;">
        {{ isLogin ? '没有账号？' : '已有账号？' }}
        <NButton text type="primary" @click="isLogin = !isLogin; error = ''">
          {{ isLogin ? '去注册' : '去登录' }}
        </NButton>
      </p>

      <NButton text style="margin-top:8px;width:100%;" @click="router.push('/')">
        先随便看看
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton } from 'naive-ui'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  try {
    if (isLogin.value) {
      await authStore.signIn(email.value, password.value)
    } else {
      if (!username.value) { error.value = '请输入用户名'; return }
      await authStore.signUp(email.value, password.value, username.value)
    }
    router.push('/')
  } catch (e: any) {
    error.value = e.message || '操作失败'
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  background: #f0ece6;
}
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
.login-card h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 4px;
}
.subtitle {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 24px;
}
</style>
