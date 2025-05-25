<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigationStore } from '@/store/navigation'
import PlaylistManager from '@/components/player/playlist/PlaylistManager.vue'

const nav = useNavigationStore()

// XR Variables
const canvasRef = ref<HTMLCanvasElement | null>(null)
const xrSupported = ref(false)
const xrSession = ref<XRSession | null>(null)
const isXRActive = ref(false)

let gl: WebGL2RenderingContext | null = null
let xrRefSpace: XRReferenceSpace | null = null

const initXR = async () => {
  if (!navigator.xr) {
    console.log('WebXR not supported')
    return
  }

  try {
    const supported = await navigator.xr.isSessionSupported('inline')
    xrSupported.value = supported
    console.log('XR Inline supported:', supported)
  } catch (err) {
    console.error('Error checking XR support:', err)
  }
}

const startXR = async (mode: 'inline' | 'immersive-vr' = 'inline') => {
  if (!navigator.xr || !canvasRef.value) return

  try {
    const session = await navigator.xr.requestSession(mode, {
      optionalFeatures: ['local-floor'],
    })
    xrSession.value = session
    isXRActive.value = true

    // Setup WebGL context
    gl = canvasRef.value.getContext('webgl2', { xrCompatible: true })
    if (!gl) throw new Error('WebGL2 not supported')

    // Setup XR layer
    const layer = new XRWebGLLayer(session, gl)
    await session.updateRenderState({ baseLayer: layer })

    // Get reference space
    xrRefSpace = await session.requestReferenceSpace('viewer')

    // Start render loop
    session.requestAnimationFrame(onXRFrame)

    session.addEventListener('end', () => {
      xrSession.value = null
      isXRActive.value = false
    })

    console.log('XR session started')
  } catch (err) {
    console.error('Failed to start XR session:', err)
  }
}

const stopXR = () => {
  if (xrSession.value) {
    xrSession.value.end()
  }
}

const onXRFrame = (time: number, frame: XRFrame) => {
  const session = frame.session
  if (!gl || !xrRefSpace) return

  const pose = frame.getViewerPose(xrRefSpace)
  if (pose) {
    const layer = session.renderState.baseLayer!
    gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer)
    
    // Clear with a nice gradient color
    gl.clearColor(0.1, 0.2, 0.4, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    // Simple rotating cube or whatever you want to render
    renderScene(time)
  }

  session.requestAnimationFrame(onXRFrame)
}

const renderScene = (time: number) => {
  if (!gl) return
  
  // Very basic rendering - just clear with animated color
  const r = Math.sin(time * 0.001) * 0.5 + 0.5
  const g = Math.cos(time * 0.002) * 0.5 + 0.5
  const b = Math.sin(time * 0.003) * 0.5 + 0.5
  
  gl.clearColor(r * 0.3, g * 0.3, b * 0.3, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

onMounted(() => {
  initXR()
})

onUnmounted(() => {
  stopXR()
})
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 rounded-xl shadow-lg">
    <!-- XR Test Section -->
    <div class="p-4 border-b border-brand-300">
      <h3 class="text-lg font-semibold mb-2">WebXR Inline Test</h3>
      <div class="flex gap-2 mb-4">
        <button 
          @click="() => startXR('inline')" 
          :disabled="!xrSupported || isXRActive"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start XR Inline
        </button>
        <button 
          @click="() => startXR('immersive-vr')" 
          :disabled="!xrSupported || isXRActive"
          class="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          Start XR Immersive 🥽
        </button>
        <button 
          @click="stopXR" 
          :disabled="!isXRActive"
          class="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop XR
        </button>
      </div>
      
      <div class="text-sm space-y-1">
        <div>XR Supported: {{ xrSupported ? '✅' : '❌' }}</div>
        <div>XR Active: {{ isXRActive ? '✅' : '❌' }}</div>
      </div>
      
      <!-- XR Canvas -->
      <canvas 
        ref="canvasRef"
        class="w-full h-64 bg-black rounded mt-4 border"
        width="800" 
        height="600"
      ></canvas>
    </div>

    <!-- Original Content -->
    <div class="p-4 overflow-y-auto flex-1">
      <PlaylistManager v-if="nav.path[1] === 'playlist'" />
    </div>
  </div>
</template>