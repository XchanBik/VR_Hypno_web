<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigationStore } from '@/store/navigation'
import PlaylistManager from '@/components/player/playlist/PlaylistManager.vue'

const nav = useNavigationStore()
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 rounded-xl shadow-lg">
    <!-- Original Content -->
    <div class="p-4 overflow-y-auto flex-1">
      <PlaylistManager v-if="nav.path[1] === 'playlist'" />
    </div>
  </div>
</template>