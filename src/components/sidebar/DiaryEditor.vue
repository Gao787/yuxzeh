<template>
  <div class="diary-editor">
    <textarea
      v-model="content"
      placeholder="写下你的旅行日记..."
      rows="5"
    />
    <div class="editor-actions">
      <NButton size="small" @click="$emit('cancel')">取消</NButton>
      <NButton size="small" type="primary" :disabled="!content.trim()" @click="handleSave">
        保存日记
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'

const emit = defineEmits(['save', 'cancel'])
const content = ref('')

function handleSave() {
  if (!content.value.trim()) return
  emit('save', content.value)
  content.value = ''
}
</script>

<style scoped>
.diary-editor {
  padding: 16px;
}
.diary-editor textarea {
  width: 100%;
  border: 1px solid #e8e4df;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.diary-editor textarea:focus {
  border-color: #FFB6C1;
}
.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
