<template>
  <div class="breadcrumb-bar">
    <template v-for="(item, idx) in crumbs" :key="item.code">
      <span v-if="idx > 0" class="sep">&gt;</span>
      <span
        class="crumb"
        :class="{ current: idx === crumbs.length - 1 }"
        @click="idx < crumbs.length - 1 && mapStore.drillUp(item.code)"
      >
        {{ item.name }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()

const crumbs = computed(() => [
  { code: 'CN', name: '中国' },
  ...mapStore.breadcrumb,
  { code: mapStore.currentRegionCode, name: mapStore.currentDisplayName },
])
</script>
