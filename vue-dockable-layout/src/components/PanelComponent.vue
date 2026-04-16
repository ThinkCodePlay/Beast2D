<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="panel-content">
    <h2>{{ title }}</h2>
    <p>This is the content for {{ title }}</p>
    <p>You can drag tabs to rearrange panels and customize your layout.</p>
  </div>
</template>

<style scoped>
.panel-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

h2 {
  margin: 0;
  color: #333;
}

p {
  margin: 5px 0;
  color: #666;
}
</style>
