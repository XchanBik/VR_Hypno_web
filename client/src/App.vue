<template>
  <div class="app">
    <h1>{{ message.content }}</h1>
    <p>Received at: {{ formatDate(message.timestamp) }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@shared/types'

const message = ref<Message>({
  id: 0,
  content: 'Loading...',
  timestamp: new Date()
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  try {
    const response = await fetch('/api/message')
    const data = await response.json()
    if (data.success && data.data) {
      message.value = data.data
    }
  } catch (error) {
    console.error('Failed to fetch message:', error)
  }
})
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #2c3e50;
}
</style> 