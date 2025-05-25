<template>
  <div class="app">
    <h1>{{ message.content }}</h1>
    <p>Received at: {{ formatDate(message.timestamp) }}</p>

    <div class="write-section">
      <h2>Write to File</h2>
      <div class="form-group">
        <input v-model="filename" placeholder="Filename" class="input" />
      </div>
      <div class="form-group">
        <textarea v-model="content" placeholder="Content" class="textarea"></textarea>
      </div>
      <button @click="writeToFile" class="button">Write to File</button>
      <p v-if="writeStatus" :class="{ 'success': writeSuccess, 'error': !writeSuccess }">
        {{ writeStatus }}
      </p>
    </div>
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

const filename = ref('')
const content = ref('')
const writeStatus = ref('')
const writeSuccess = ref(false)

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

const writeToFile = async () => {
  try {
    const response = await fetch('/api/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename.value,
        content: content.value
      })
    })

    const data = await response.json()
    writeSuccess.value = data.success
    writeStatus.value = data.success ? 'File written successfully!' : data.error
  } catch (error) {
    writeSuccess.value = false
    writeStatus.value = 'Failed to write file'
  }
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

.write-section {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

.input, .textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.button {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #45a049;
}

.success {
  color: #4CAF50;
}

.error {
  color: #f44336;
}
</style> 