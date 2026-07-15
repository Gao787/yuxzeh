<template>
  <AppHeader />
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { useMapStore } from '@/stores/mapStore'

const authStore = useAuthStore()
const mapStore = useMapStore()

onMounted(async () => {
  await authStore.init()
  await mapStore.initChina()
})
</script>
