<template>
  <div class="region-header">
    <div class="region-info">
      <div class="region-name">{{ regionName }}</div>
      <div class="region-status">
        <template v-if="isLit">
          <span class="lit-badge">已点亮</span>
          <span v-if="litAt" class="lit-date">于 {{ formatDate(litAt) }}</span>
        </template>
        <span v-else class="unlit-text">未点亮</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  regionName: string
  isLit: boolean
  litAt?: string
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.region-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e8e4df;
}
.region-icon { font-size: 28px; }
.region-name { font-size: 18px; font-weight: 600; }
.region-status { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; }
.lit-badge { color: #d4888c; font-weight: 500; }
.lit-date { color: #aaa; }
.unlit-text { color: #aaa; }
</style>
