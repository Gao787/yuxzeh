<template>
  <div class="diary-list">
    <div v-if="entries.length === 0" class="empty-hint">
      暂无日记，点击上方按钮开始记录
    </div>
    <div v-for="entry in entries" :key="entry.id" class="diary-card">
      <div class="diary-date">{{ formatDate(entry.created_at) }}</div>
      <div class="diary-content">{{ entry.content }}</div>
      <img v-if="entry.image" :src="entry.image" class="diary-img" />
      <div v-if="!readonly" class="diary-actions">
        <NButton text size="tiny" type="primary" @click="$emit('edit', entry)">编辑</NButton>
        <NButton text size="tiny" style="color:#e88;" @click="$emit('delete', entry)">删除</NButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import type { DiaryEntry } from '@/types/diary'

defineProps<{
  entries: DiaryEntry[]
  readonly?: boolean
}>()

defineEmits(['edit', 'delete'])

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>

<style scoped>
.diary-list {
  padding: 8px 16px 16px;
}
.diary-img { max-width: 100%; max-height: 160px; border-radius: 8px; margin-top: 8px; }
.empty-hint { text-align: center; color: #bbb; font-size: 13px; padding: 24px 0; }
</style>
