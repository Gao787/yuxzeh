<template>
  <div class="msg-layout">
    <!-- ★ 左半：发留言 + 我的留言 -->
    <aside class="msg-left">
      <h2>祝福留言板</h2>

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

      <!-- 我的留言 -->
      <div class="my-msgs">
        <h3>我的留言</h3>
        <div v-if="myMessages.length === 0" class="empty-mini">暂无留言</div>
        <div v-for="msg in myMessages" :key="msg.id" class="my-msg-item">
          <div class="my-msg-content">{{ msg.content }}</div>
          <div class="my-msg-footer">
            <span class="my-msg-date">{{ fmt(msg.created_at) }}</span>
            <NButton text size="tiny" style="color:#e88;" @click="handleDelete(msg)">删除</NButton>
          </div>
          <!-- 回复该留言的 -->
          <div v-if="getReplies(msg.id!).length > 0" class="mini-replies">
            <span class="reply-count">{{ getReplies(msg.id!).length }} 条回复</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- ★ 右半：所有留言滚动 -->
    <main class="msg-right">
      <div class="msg-right-header">
        <span>全部留言</span>
        <span class="count-badge">{{ topMessages.length }} 条</span>
      </div>

      <div v-if="topMessages.length === 0" class="empty-hint">暂无留言，来抢沙发吧~</div>

      <div v-for="msg in topMessages" :key="msg.id" class="msg-card">
        <div class="msg-header">
          <span class="msg-user">{{ msg.username }}</span>
          <span class="msg-time">{{ fmt(msg.created_at) }}</span>
        </div>
        <div class="msg-content">{{ msg.content }}</div>
        <div class="msg-actions">
          <NButton text size="tiny" @click="replyingTo = msg.id; replyContent = ''">回复</NButton>
          <NButton v-if="canDelete(msg)" text size="tiny" style="color:#e88;" @click="handleDelete(msg)">删除</NButton>
        </div>

        <!-- 回复输入 -->
        <div v-if="replyingTo === msg.id" class="reply-input">
          <NInput v-model:value="replyContent" size="small" type="textarea" placeholder="回复..." :autosize="{ minRows: 1, maxRows: 2 }" />
          <NButton size="tiny" type="primary" @click="handleSend(msg.id)">发送</NButton>
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
            <NButton v-if="canDelete(reply)" text size="tiny" style="color:#e88;" @click="handleDelete(reply)">删除</NButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NInput, NButton } from 'naive-ui'
import { useMessageStore } from '@/stores/messageStore'
import { useAuthStore } from '@/stores/authStore'
import type { Message } from '@/stores/messageStore'

const msgStore = useMessageStore()
const authStore = useAuthStore()
const content = ref('')
const replyingTo = ref<string | null>(null)
const replyContent = ref('')

onMounted(async () => { await msgStore.fetchMessages() })

const myUsername = computed(() => authStore.user?.username || '')
const myMessages = computed(() =>
  msgStore.messages.filter(m => !m.parent_id && m.username === myUsername.value)
)
const topMessages = computed(() => msgStore.messages.filter(m => !m.parent_id))

function getReplies(parentId: string) {
  return msgStore.messages.filter(m => m.parent_id === parentId)
}

async function handleSend(parentId: string | null) {
  const text = parentId ? replyContent.value.trim() : content.value.trim()
  if (!text) return
  await msgStore.addMessage(text, parentId || undefined)
  if (parentId) { replyingTo.value = null; replyContent.value = '' }
  else { content.value = '' }
}

function canDelete(msg: Message) {
  return authStore.isAdmin || authStore.user?.username === msg.username
}
async function handleDelete(msg: Message) {
  if (msg.id) await msgStore.deleteMessage(msg.id)
}
function fmt(d: string) {
  return new Date(d).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.msg-layout { display: flex; height: calc(100vh - 64px); }

/* 左半 */
.msg-left {
  width: 380px; min-width: 380px;
  padding: 24px;
  background: rgba(255,255,255,.25);
  backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
  border-right: 1px solid rgba(255,255,255,.3);
  display: flex; flex-direction: column; gap: 20px;
  overflow-y: auto;
}
.msg-left h2 { font-size: 20px; font-weight: 700; }
.msg-input-area {
  display: flex; flex-direction: column; gap: 8px;
  background: rgba(255,255,255,.2); border-radius: 12px; padding: 12px;
  border: 1px solid rgba(255,255,255,.3);
}
.my-msgs { flex: 1; overflow-y: auto; }
.my-msgs h3 { font-size: 15px; font-weight: 600; color: #666; margin-bottom: 10px; }
.my-msg-item {
  background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3);
  border-radius: 10px; padding: 10px 12px; margin-bottom: 8px;
}
.my-msg-content { font-size: 13px; line-height: 1.5; color: #444; white-space: pre-wrap; }
.my-msg-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.my-msg-date { font-size: 11px; color: #aaa; }
.mini-replies { margin-top: 4px; }
.reply-count { font-size: 11px; color: #999; }

/* 右半 */
.msg-right {
  flex: 1; overflow-y: auto; padding: 24px;
  background: rgba(255,255,255,.1);
}
.msg-right-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  font-size: 18px; font-weight: 700;
}
.count-badge { font-size: 12px; color: #777; background: rgba(255,255,255,.3); border-radius: 20px; padding: 3px 12px; }

.msg-card { background: rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.3); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; }
.msg-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.msg-user { font-weight: 600; font-size: 14px; color: #555; }
.msg-time { font-size: 12px; color: #aaa; }
.msg-content { font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap; }
.msg-actions { display: flex; gap: 12px; margin-top: 6px; }

.reply-input { display: flex; gap: 6px; margin-top: 8px; align-items: flex-end; background: rgba(255,255,255,.15); border-radius: 10px; padding: 8px; }
.replies { margin-top: 8px; padding-left: 16px; border-left: 2px solid rgba(255,255,255,.4); }
.reply-card { background: rgba(255,255,255,.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.25); border-radius: 10px; padding: 10px 12px; margin-bottom: 6px; }

.empty-hint { text-align: center; color: #999; padding: 60px 0; font-size: 15px; }
.empty-mini { text-align: center; color: #bbb; font-size: 13px; padding: 20px 0; }
</style>
