<script setup lang="ts">
import { useNavigationStore } from '@/store/navigation'
import SessionList from '@/components/editor/session/SessionList.vue'
import SessionEditor from '@/components/editor/session/SessionEditor.vue'

const nav = useNavigationStore()
</script>

<template>
  <div class="p-4 overflow-y-auto h-full">
    <SessionList v-if="nav.path[2] === 'list'" />
    <SessionEditor v-else-if="nav.path[2] === 'edit'"/>
  </div>
</template>