<template>
  <NModal :show="true" @mask-click="$emit('close')">
    <div class="login-modal">
      <span class="close-btn" @click="$emit('close')">✕</span>
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <NInput v-model:value="email" placeholder="邮箱" style="margin-bottom:12px;" />
      <NInput v-model:value="password" type="password" placeholder="密码" show-password-toggle style="margin-bottom:12px;" />
      <NInput v-if="!isLogin" v-model:value="username" placeholder="设置用户名" style="margin-bottom:12px;" />
      <NButton type="primary" block :loading="authStore.loading" @click="handleSubmit">
        {{ isLogin ? '登录' : '注册' }}
      </NButton>
      <p v-if="error" style="color:#e74c3c;font-size:13px;margin-top:8px;">{{ error }}</p>
      <p style="text-align:center;margin-top:12px;font-size:13px;color:#888;">
        {{ isLogin ? '没有账号？' : '已有账号？' }}
        <NButton text type="primary" @click="isLogin = !isLogin; error = ''">
          {{ isLogin ? '去注册' : '去登录' }}
        </NButton>
      </p>
    </div>
  </NModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NModal, NInput, NButton } from 'naive-ui'
import { useAuthStore } from '@/stores/authStore'

defineEmits(['close'])
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
      if (!email.value || !email.value.includes('@')) { error.value = '请输入正确的邮箱'; return }
      await authStore.signUp(email.value, password.value, username.value)
    }
    // 登录成功，关闭弹窗
    location.reload() // 简易刷新
  } catch (e: any) {
    error.value = e.message || '操作失败'
  }
}
</script>

<style scoped>
.login-modal {
  width: 380px; padding: 32px; position: relative;
  background: rgba(255,255,255,.55);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255,255,255,.4);
  border-radius: 16px;
}
.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  cursor: pointer;
  font-size: 20px;
  color: #aaa;
  line-height: 1;
}
.close-btn:hover {
  color: #666;
}
.login-modal h2 {
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
}
</style>
