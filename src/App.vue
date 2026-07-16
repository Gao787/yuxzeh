<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <AppHeader />
    <router-view />
  </NConfigProvider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { NConfigProvider } from 'naive-ui'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { useMapStore } from '@/stores/mapStore'

const authStore = useAuthStore()
const mapStore = useMapStore()

const themeOverrides = {
  common: {
    primaryColor: '#B8956C',
    primaryColorHover: '#A07850',
    primaryColorPressed: '#8B6040',
    primaryColorSuppl: '#C8A882',
  },
  Button: {
    colorPrimary: '#B8956C',
    colorPrimaryHover: '#A07850',
    colorPrimaryPressed: '#8B6040',
    borderPrimary: '1px solid rgba(200,160,100,.5)',
    borderHoverPrimary: '1px solid rgba(200,160,100,.6)',
  },
}

onMounted(async () => {
  await authStore.init()
  await mapStore.initChina()
})
</script>
