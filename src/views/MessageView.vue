<template>
  <div class="msg-page">
    <h2>💬 祝福留言板</h2>

    <!-- 发留言 -->
    <div class="msg-input-area">
      <NInput
        v-model:value="content"
        type="textarea"
        placeholder="说点什么..."
        :autosize="{ minRows: 2, maxRows: 4 }"
      />
      <NButton type="primary" :disabled="!content.trim()" @click="handleSend(null)">
        发送
      </NButton>
    </div>

    <!-- 留言列表 -->
    <div v-if="topMessages.length === 0" class="empty-hint">
      暂无留言，来抢沙发吧~
    </div>
    <div v-for="msg in topMessages" :key="msg.id" class="msg-card">
      <!-- 主留言 -->
      <div class="msg-header">
        <span class="msg-user">{{ msg.username }}</span>
        <span class="msg-time">{{ fmt(msg.created_at) }}</span>
      </div>
      <div class="msg-content">{{ msg.content }}</div>
      <div class="msg-actions">
        <NButton text size="tiny" @click="replyingTo = msg.id; replyContent = ''">
          💬 回复
        </NButton>
        <NButton
          v-if="canDelete(msg)"
          text size="tiny" style="color:#e88;"
          @click="handleDelete(msg)"
        >
          删除
        </NButton>
      </div>

      <!-- 回复输入框 -->
      <div v-if="replyingTo === msg.id" class="reply-input">
        <NInput v-model:value="replyContent" type="textarea" placeholder="写下你的回复..." :autosize="{ minRows: 1, maxRows: 3 }" size="small" />
        <NButton size="tiny" type="primary" @click="handleSend(msg.id)">回复</NButton>
        <NButton size="tiny" @click="replyingTo = null">取消</NButton>
      </div>

      <!-- 回复列表 -->
      <div v-if="getReplies(msg.id!).length > 0" class="replies">
        <div v-for="reply in getReplies(msg.id!)" :key="reply.id" class="reply-card">
          <div class="msg-header">
            <span class="msg-user">{{ reply.username }}</span>
            <span class="msg-time">{{ fmt(reply.created_at) }}</span>
          </div>
          <div class="msg-content">{{ reply.content }}</div>
          <NButton
            v-if="canDelete(reply)"
            text size="tiny" style="color:#e88;"
            @click="handleDelete(reply)"
          >
            删除
          </NButton>
        </div>
      </div>
    </div>

    <NButton style="margin-top:16px;width:100%;" @click="router.push('/')">
      返回地图
    </NButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton } from 'naive-ui'
import { useMessageStore } from '@/stores/messageStore'
import { useAuthStore } from '@/stores/authStore'
import type { Message } from '@/stores/messageStore'

const router = useRouter()
const msgStore = useMessageStore()
const authStore = useAuthStore()
const content = ref('')
const replyingTo = ref<string | null>(null)
const replyContent = ref('')

onMounted(async () => { await msgStore.fetchMessages() })

// 顶级留言（没有 parent_id）
const topMessages = computed(() =>
  msgStore.messages.filter(m => !m.parent_id)
)

function getReplies(parentId: string) {
  return msgStore.messages.filter(m => m.parent_id === parentId)
}

async function handleSend(parentId: string | null) {
  const text = parentId ? replyContent.value.trim() : content.value.trim()
  if (!text) return
  await msgStore.addMessage(text, parentId || undefined)
  if (parentId) {
    replyingTo.value = null
    replyContent.value = ''
  } else {
    content.value = ''
  }
}

function canDelete(msg: Message) {
  return authStore.isAdmin || authStore.user?.username === msg.username
}

async function handleDelete(msg: Message) {
  if (msg.id) await msgStore.deleteMessage(msg.id)
}

function fmt(d: string) {
  return new Date(d).toLocaleString('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
.msg-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; height: calc(100vh - 64px); overflow-y: auto; }
.msg-page h2 { font-size: 20px; margin-bottom: 16px; }
.msg-input-area { display: flex; gap: 8px; margin-bottom: 20px; }
.msg-input-area :deep(.n-input) { flex: 1; }
.msg-card { background: #fafaf8; border: 1px solid #eee; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; }
.msg-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.msg-user { font-weight: 600; font-size: 14px; color: #555; }
.msg-time { font-size: 12px; color: #aaa; }
.msg-content { font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap; }
.msg-actions { display: flex; gap: 12px; margin-top: 6px; }
.reply-input { display: flex; gap: 6px; margin-top: 8px; align-items: flex-end; }
.replies { margin-top: 8px; padding-left: 16px; border-left: 2px solid #eee; }
.reply-card { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; }
.empty-hint { text-align: center; color: #bbb; padding: 40px 0; }
</style>
