<script setup lang="ts">
import { ref } from 'vue'
import { DockviewApi } from 'dockview'
import PanelComponent from './components/PanelComponent.vue'

// track instance
const api = ref<DockviewApi | null>(null)

function onReady(e: DockviewApi) {
  api.value = e

  // Create three panels once the Dockview instance is ready
  api.value.addPanel({
    id: 'panel1',
    component: 'example-view',
    title: 'Panel 1',
    params: { title: 'Panel 1' },
  })

  api.value.addPanel({
    id: 'panel2',
    component: 'example-view',
    title: 'Panel 2',
    params: { title: 'Panel 2' },
  })

  api.value.addPanel({
    id: 'panel3',
    component: 'example-view',
    title: 'Panel 3',
    params: { title: 'Panel 3' },
  })
}
</script>

<template>
  <dockview-default-tabsbar class="dockview-container" @ready="onReady">
    <template #example-view="{ params }">
      <PanelComponent :title="params.title" />
    </template>
  </dockview-default-tabsbar>
</template>

<style>
.dockview-container {
  width: 100vw;
  height: 100vh;
}
</style>
