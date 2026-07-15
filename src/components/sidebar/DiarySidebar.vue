<template>
  <aside class="diary-sidebar">
    <!-- 状态1：未选中 -->
    <div v-if="!selectedCode" class="empty-state">
      <span class="icon">🗺️</span>
      <p>点击地图上的区域</p>
      <p class="sub">开始你的探索之旅</p>
    </div>

    <!-- 状态2/3/4：已选中 -->
    <template v-else>
      <RegionHeader
        :region-name="regionDisplayName"
        :is-lit="isLit"
        :lit-at="litInfo?.lit_at"
      />

      <!-- 管理员：点亮/取消按钮 -->
      <LightControl
        v-if="authStore.isAdmin"
        :is-lit="isLit"
        @light-up="handleLightUp"
        @unlight="handleUnlight"
      />

      <!-- 已点亮：管理员看日记管理，普通用户看只读 -->
      <template v-if="isLit">
        <div class="section-header" style="padding: 8px 16px;">
          <span>{{ authStore.isAdmin ? '✏️ 旅行日记' : '📝 旅行日记（只读）' }}</span>
        </div>

        <NButton
          v-if="authStore.isAdmin && !showEditor"
          size="small"
          style="margin: 0 16px 8px;"
          @click="showEditor = true"
        >
          + 新增一篇日记
        </NButton>

        <DiaryEditor
          v-if="showEditor && authStore.isAdmin"
          @save="handleSaveDiary"
          @cancel="showEditor = false"
        />

        <DiaryList
          :entries="regionDiaries"
          :readonly="!authStore.isAdmin"
          @delete="handleDeleteDiary"
          @edit="(entry) => { editingEntry = entry; showEditor = true; editContent = entry.content }"
        />
      </template>
    </template>

    <!-- 编辑弹窗 -->
    <NModal v-if="editingEntry" :show="!!editingEntry" @mask-click="editingEntry = null">
      <div class="edit-modal">
        <h3>编辑日记</h3>
        <textarea v-model="editContent" rows="6" />
        <div class="edit-actions">
          <NButton size="small" @click="editingEntry = null">取消</NButton>
          <NButton size="small" type="primary" @click="handleEditSave">保存</NButton>
        </div>
      </div>
    </NModal>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NModal } from 'naive-ui'
import { useMapStore } from '@/stores/mapStore'
import { useLightStore } from '@/stores/lightStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useAuthStore } from '@/stores/authStore'
import RegionHeader from './RegionHeader.vue'
import LightControl from './LightControl.vue'
import DiaryEditor from './DiaryEditor.vue'
import DiaryList from './DiaryList.vue'
import type { DiaryEntry } from '@/types/diary'

const mapStore = useMapStore()
const lightStore = useLightStore()
const diaryStore = useDiaryStore()
const authStore = useAuthStore()

const showEditor = ref(false)
const editingEntry = ref<DiaryEntry | null>(null)
const editContent = ref('')

const selectedCode = computed(() => mapStore.selectedRegionCode)
const regionDisplayName = computed(() => mapStore.selectedRegionName || '')
const isLit = computed(() => selectedCode.value ? lightStore.checkLit(selectedCode.value) : false)
const litInfo = computed(() => selectedCode.value ? lightStore.litRegionMap[selectedCode.value] : null)
const regionDiaries = computed(() => {
  if (!selectedCode.value) return []
  return diaryStore.entries.filter(e => e.region_code === selectedCode.value)
})

async function handleLightUp() {
  if (!selectedCode.value || !regionDisplayName.value) return
  await lightStore.lightUp(selectedCode.value, regionDisplayName.value, mapStore.currentLevel)
  showEditor.value = true
}

async function handleUnlight() {
  if (!selectedCode.value) return
  await lightStore.unlight(selectedCode.value)
}

async function handleSaveDiary(content: string) {
  if (!selectedCode.value || !regionDisplayName.value) return
  await diaryStore.addEntry(selectedCode.value, regionDisplayName.value, content)
  showEditor.value = false
}

async function handleDeleteDiary(entry: DiaryEntry) {
  if (entry.id) await diaryStore.deleteEntry(entry.id)
}

async function handleEditSave() {
  if (editingEntry.value?.id) {
    await diaryStore.updateEntry(editingEntry.value.id, editContent.value)
  }
  editingEntry.value = null
  editContent.value = ''
}
</script>

<style scoped>
.edit-modal {
  width: 420px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}
.edit-modal h3 { margin-bottom: 12px; }
.edit-modal textarea {
  width: 100%;
  border: 1px solid #e8e4df;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  outline: none;
}
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
