<template>
  <div class="diary-editor">
    <textarea
      v-model="content"
      placeholder="写下你的旅行日记..."
      rows="4"
    />
    <!-- 图片上传 -->
    <div class="image-upload-row">
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFile" />
      <NButton size="tiny" @click="($refs.fileInput as any)?.click()">+ 上传图片</NButton>
      <span v-if="preview" class="img-preview-name">已选图片</span>
    </div>
    <img v-if="preview" :src="preview" class="img-preview" />
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
const preview = ref('')
const imageBase64 = ref('')
const fileInput = ref()

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    imageBase64.value = reader.result as string
    preview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function handleSave() {
  if (!content.value.trim()) return
  emit('save', content.value, imageBase64.value)
  content.value = ''
  preview.value = ''
  imageBase64.value = ''
}
</script>

<style scoped>
.diary-editor { padding: 16px; }
.diary-editor textarea {
  width: 100%; border: 1px solid rgba(255,255,255,.4); border-radius: 8px;
  padding: 10px; font-size: 14px; resize: vertical; font-family: inherit;
  outline: none; background: rgba(255,255,255,.3);
}
.image-upload-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.img-preview-name { font-size: 12px; color: #999; }
.img-preview { max-width: 100%; max-height: 120px; margin-top: 8px; border-radius: 8px; }
.editor-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
</style>
