<template>
  <div class="mem-layout">
    <!-- ★ 左侧：新增回忆（仅管理员） -->
    <aside v-if="authStore.isAdmin" class="mem-sidebar">
      <h3>新增回忆</h3>
      <div class="image-upload" @click="triggerUpload">
        <template v-if="previewUrl">
          <img :src="previewUrl" alt="预览" />
          <span class="change-tip">点击更换</span>
        </template>
        <template v-else>
          <span class="upload-icon">+</span>
          <span>点击上传照片</span>
        </template>
      </div>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFile" />
      <NInput
        v-model:value="description"
        type="textarea"
        placeholder="写下这段回忆..."
        :autosize="{ minRows: 2, maxRows: 5 }"
        style="margin-bottom:10px;"
      />
      <label class="field-label">回忆日期</label>
      <NDatePicker v-model:value="memDateVal" type="date" style="margin-bottom:10px;" placeholder="选择日期" />
      <label class="field-label">地点</label>
      <NInput v-model:value="memLocation" placeholder="在哪拍的？" style="margin-bottom:14px;" />
      <NButton type="primary" block :disabled="!previewUrl || !description.trim()" @click="handleAdd">
        保存回忆
      </NButton>
    </aside>

    <!-- ★ 右侧：回忆墙 -->
    <main class="mem-main">
      <div class="mem-toolbar">
        <h2>我们的回忆</h2>
        <div class="filter-row">
          <span class="filter-label">筛选日期：</span>
          <NDatePicker v-model:value="filterDateVal" type="date" placeholder="全部" clearable />
          <span class="count-badge">{{ filteredMemories.length }} 张</span>
        </div>
      </div>

      <div v-if="filteredMemories.length === 0" class="empty-hint">
        还没有回忆，去左边添加吧~
      </div>

      <div class="mem-grid">
        <div v-for="mem in filteredMemories" :key="mem.id" class="mem-card">
          <div class="card-frame">
            <img :src="mem.image" alt="回忆" @click="viewImage = mem.image" />
            <div class="card-border" />
          </div>
          <div class="card-body">
            <div class="mem-desc">{{ mem.description }}</div>
            <div class="mem-meta">
              <span v-if="mem.location" class="mem-loc">{{ mem.location }}</span>
              <span class="mem-date">{{ mem.date || fmtDate(mem.created_at) }}</span>
              <NButton
                v-if="authStore.isAdmin"
                text size="tiny" style="color:#e88;"
                @click="handleDelete(mem)"
              >
                删除
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 大图预览 -->
    <div v-if="viewImage" class="image-overlay" @click="viewImage = null">
      <img :src="viewImage" alt="大图" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NInput, NButton, NDatePicker } from 'naive-ui'
import { useMemoryStore } from '@/stores/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import type { Memory } from '@/stores/memoryStore'

const memStore = useMemoryStore()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const base64Data = ref('')
const description = ref('')
const memDateVal = ref<number | null>(null)
const memLocation = ref('')
const filterDateVal = ref<number | null>(null)
const viewImage = ref<string | null>(null)

onMounted(async () => { await memStore.fetchMemories() })

// 日期戳 → YYYY-MM-DD 字符串
function toDateStr(ts: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const filteredMemories = computed(() => {
  if (!filterDateVal.value) return memStore.memories
  const s = toDateStr(filterDateVal.value)
  return memStore.memories.filter(m => (m.date || '').startsWith(s))
})

function triggerUpload() { fileInput.value?.click() }
function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    base64Data.value = reader.result as string
    previewUrl.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

async function handleAdd() {
  if (!previewUrl.value || !description.value.trim()) return
  await memStore.addMemory(base64Data.value, description.value.trim(), toDateStr(memDateVal.value), memLocation.value.trim())
  previewUrl.value = ''; base64Data.value = ''; description.value = ''; memDateVal.value = null; memLocation.value = ''
}
function canDelete(mem: Memory) {
  return authStore.isAdmin || authStore.user?.username === mem.username
}
async function handleDelete(mem: Memory) {
  if (mem.id) await memStore.deleteMemory(mem.id)
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<style scoped>
.mem-layout {
  display: flex;
  height: calc(100vh - 64px);
}
/* 左侧新增 */
.mem-sidebar {
  width: 340px; min-width: 340px; padding: 20px; overflow-y: auto;
  background: rgba(255,255,255,.3);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border-right: 1px solid rgba(255,255,255,.35);
}
.mem-sidebar h3 { font-size: 17px; margin-bottom: 14px; }
.image-upload {
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255,255,255,.5);
  border-radius: 10px; background: rgba(255,255,255,.15);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; margin-bottom: 12px; overflow: hidden; position: relative;
  transition: border-color .2s;
}
.image-upload:hover { border-color: #aaa; }
.image-upload img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.change-tip { position: absolute; bottom: 8px; background: rgba(0,0,0,.5); color: #fff; padding: 4px 12px; border-radius: 10px; font-size: 12px; }
.upload-icon { font-size: 40px; opacity: .4; margin-bottom: 4px; }
.field-label { font-size: 13px; color: #888; display: block; margin-bottom: 4px; }

/* 右侧展示 */
.mem-main {
  flex: 1; overflow-y: auto; padding: 24px;
  background: rgba(255,255,255,.15);
}
.mem-toolbar { margin-bottom: 20px; }
.mem-toolbar h2 { font-size: 22px; margin-bottom: 12px; }
.filter-row { display: flex; align-items: center; gap: 10px; }
.filter-label { font-size: 14px; color: #666; white-space: nowrap; }
.count-badge { font-size: 13px; color: #777; background: rgba(255,255,255,.3); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,.3); padding: 4px 12px; border-radius: 20px; }

/* 回忆卡片网格 */
.mem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.mem-card {
  border-radius: 12px; overflow: hidden;
  background: rgba(255,255,255,.25);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.35);
  transition: transform .2s, box-shadow .2s;
}
.mem-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,.1); }
.card-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: rgba(255,255,255,.2);
}
.card-frame img {
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  object-fit: cover;
  margin: 6px;
  cursor: pointer;
}
.card-border {
  position: absolute;
  inset: 0;
  border: 6px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.08);
  pointer-events: none;
}
.card-body {
  padding: 12px 8px 8px;
}
.mem-desc {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mem-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #aaa;
}

.image-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.85); z-index: 9999;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.image-overlay img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
.empty-hint { text-align: center; color: #bbb; padding: 60px 0; font-size: 15px; }
</style>
