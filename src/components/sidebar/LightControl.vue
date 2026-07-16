<template>
  <div class="light-control">
    <template v-if="!isLit">
      <button class="light-btn confirm" @click="$emit('lightUp')">
        确认点亮
      </button>
      <p class="hint">点亮后可写旅行日记</p>
    </template>
    <template v-else>
      <button class="light-btn cancel" @click="$emit('unlight')">
        取消点亮
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isLit: boolean }>()
defineEmits(['lightUp', 'unlight'])
</script>

<style scoped>
.light-control {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.hint {
  font-size: 12px;
  color: #aaa;
}
</style>
