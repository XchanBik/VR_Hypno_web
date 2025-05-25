<script setup lang="ts">
import { useNavigationStore } from '@/store/navigation'
import SongList from '@/components/editor/song/SongList.vue'
import SongEditor from '@/components/editor/song/SongEditor.vue'

const nav = useNavigationStore()
</script>

<template>
  <div class="p-4 overflow-y-auto h-full">
    <SongList v-if="nav.path[2] === 'list'" />
    <SongEditor v-else-if="nav.path[2] === 'edit'"/>
  </div>
</template>