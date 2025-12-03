<script setup lang="ts">
import { ref, onMounted } from 'vue'
// Import the engine directly from the Beast2D project
import { Engine } from 'beast2d/core/Engine'

const containerRef = ref<HTMLElement | null>(null)
const isPaused = ref(false)
let engine: Engine | null = null

onMounted(async () => {
  engine = new Engine()
  if (containerRef.value) {
    // Use the demo bootstrap that registers and loads a level
    engine.bootstrap(containerRef.value)
  }
})

function pause() {
  if (!engine) return
  engine.pause()
  isPaused.value = true
}

function resume() {
  if (!engine) return
  engine.resume()
  isPaused.value = false
}
</script>

<template>
  <header>
    <h1>Beast2D Editor</h1>
    <div class="controls">
      <button @click="pause" :disabled="isPaused">Pause</button>
      <button @click="resume" :disabled="!isPaused">Resume</button>
    </div>
  </header>
  <main>
    <div class="runner-container">
      <div ref="containerRef" class="viewport" />
    </div>
  </main>
</template>

<style scoped>
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
