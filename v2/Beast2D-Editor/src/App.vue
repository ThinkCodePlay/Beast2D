<script setup lang="ts">
import { ref, onMounted } from 'vue'
// Import the engine directly from the Beast2D project
import { Engine } from 'beast2d/core/Engine'
import LeftPanel from './components/LeftPanel/LeftPanel.vue'
import { useEngineStore } from './stores/engine'

const containerRef = ref<HTMLElement | null>(null)
const isPaused = ref(false)
const engineStore = useEngineStore()

onMounted(async () => {
  const engine = new Engine()
  engineStore.setEngine(engine)
  if (containerRef.value) {
    // Use the demo bootstrap that registers and loads a level
    engine.bootstrap(containerRef.value)
    
    // Refresh hierarchy after level loads
    setTimeout(() => {
      engineStore.refreshHierarchy()
    }, 1000)
  }
})

const pause = () => {
  if (!engineStore.engine) return
  engineStore.engine.pause()
  isPaused.value = true
}

const resume = () => {
  if (!engineStore.engine) return
  engineStore.engine.resume()
  isPaused.value = false
}

const togglePlay = () => {
  if (isPaused.value) {
    resume()
  } else {
    pause()
  }
}
</script>

<template>
  <div class="app-container">
    <div class="left-panel">
      <LeftPanel />
    </div>
    <div class="center-panel">
      <h2>Game Runner</h2>
      <button @click="togglePlay">{{ isPaused ? 'Play' : 'Pause' }}</button>
      <div class="runner-container">
        <div ref="containerRef" class="viewport" />
      </div>
    </div>
    <div class="right-panel">
      <h2>Inspector</h2>
      <!-- ...existing code... -->
    </div>
  </div>
</template>


<style scoped>
.app-container {
  display: flex;
}
.left-panel, .center-panel, .right-panel {
  flex: 1;
  padding: 10px;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.controls button {
  padding: 0.5rem 1rem;
}

.runner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.viewport {
  width: 800px;
  height: 600px;
  border: 1px solid #ccc;
  background: #222;
  margin-top: 1rem;
}
</style>
