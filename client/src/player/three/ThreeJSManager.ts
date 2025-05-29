/// <reference types="three" />
import * as THREE from 'three'
import type { PlaylistInfo } from '@shared/playlist/types'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'
import { WebGLRenderer } from 'three'
import { ThreeScene, ThreeSceneOptions } from './ThreeScene'

interface ThreeJSManagerOptions {
    canvas: HTMLCanvasElement
    playlist: PlaylistInfo | null
    sessions: SessionInfo[]
    songs: SongInfo[]
    vr?: boolean
    debug?: boolean
}

export default class ThreeJSManager {
    private canvas: HTMLCanvasElement
    private playlist: PlaylistInfo | null
    private sessions: SessionInfo[]
    private songs: SongInfo[]
    private vr: boolean
    private renderer: THREE.WebGLRenderer
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private animationId: number | null = null
    // --- Gaze Button State ---
    private playButton: THREE.Object3D | null = null
    private raycaster = new THREE.Raycaster()
    private gazeTimer = 0
    private gazeDuration = 2 // seconds to trigger play
    private isSessionStarted = false
    private lastFrameTime: number | null = null
    private isInVR = false
    private debug: boolean
    private frameCount = 0
    private lastFpsTime = performance.now()
    private threeScene: ThreeScene | null = null
    private lastCanvasWidth: number = 0
    private lastCanvasHeight: number = 0
    private resizeObserver: ResizeObserver | null = null

  constructor(options: ThreeJSManagerOptions) {
    this.canvas = options.canvas
    this.playlist = options.playlist
    this.sessions = options.sessions
    this.songs = options.songs
    this.vr = !!options.vr
    this.debug = !!options.debug
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas })
    this.renderer.setClearColor(0x111111)
    
    // CRITICAL: Lock canvas CSS size to prevent Three.js from interfering
    this.lockCanvasSize()
    this.setupTailwindFriendlyResize()
    
    if (this.vr) {
      this.renderer.xr.enabled = true
      // Optionally: navigator.xr.requestSession('immersive-vr')
    }
  }

  /**
   * Lock canvas CSS size and remove dimension attributes - let Tailwind control sizing
   */
  private lockCanvasSize() {
    // LOCK the canvas CSS size - Tailwind controls this, not Three.js
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.removeAttribute('width')
    this.canvas.removeAttribute('height')
  }

  /**
   * Setup resize handling that works with Tailwind CSS
   */
  private setupTailwindFriendlyResize() {
    // Watch for canvas size changes using ResizeObserver
    this.resizeObserver = new ResizeObserver(() => {
      this.updateInternalRenderSize()
    })
    
    this.resizeObserver.observe(this.canvas)
    
    // Set initial size
    this.updateInternalRenderSize()
  }

  /**
   * Update Three.js internal rendering size WITHOUT touching canvas DOM size
   */
  private updateInternalRenderSize() {
    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    // Skip if no change
    if (width === this.lastCanvasWidth && height === this.lastCanvasHeight) {
      return
    }
    
    this.lastCanvasWidth = width
    this.lastCanvasHeight = height
    
    // Update camera aspect ratio
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    // Update internal rendering resolution WITHOUT touching canvas DOM size
    this.renderer.setDrawingBufferSize(
      width * window.devicePixelRatio, 
      height * window.devicePixelRatio, 
      window.devicePixelRatio
    )
    
    this.renderer.setViewport(0, 0, width, height)
    
    if (this.debug) {
      console.log(`[ThreeJSManager] Canvas resized to: ${width}x${height}`)
    }
  }

  /**
   * @deprecated - Use setupTailwindFriendlyResize instead
   */
  resize() {
    // Keep this method for backward compatibility but don't use the old logic
    this.updateInternalRenderSize()
  }

  init() {
    // Basic scene setup
    this.camera.position.set(0, 1.6, 3)
    this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    // Add a 3D gaze play button in front of the camera
    this.addGazePlayButton()
    this.animate()
  }

  /**
   * Adds a 3D play button (circle + triangle) in front of the camera.
   */
  private addGazePlayButton() {
    // Circle background
    const circleGeom = new THREE.CircleGeometry(0.25, 64)
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xff69b4 })
    const circle = new THREE.Mesh(circleGeom, circleMat)
    circle.position.set(0, 1.6, -2)
    // Triangle (play icon)
    const triShape = new THREE.Shape()
    triShape.moveTo(-0.08, -0.12)
    triShape.lineTo(0.14, 0)
    triShape.lineTo(-0.08, 0.12)
    triShape.lineTo(-0.08, -0.12)
    const triGeom = new THREE.ShapeGeometry(triShape)
    const triMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const triangle = new THREE.Mesh(triGeom, triMat)
    triangle.position.set(0, 1.6, -1.99)
    // Group them
    const group = new THREE.Group()
    group.add(circle)
    group.add(triangle)
    this.playButton = group
    this.scene.add(group)
  }

  /**
   * Main animation loop: checks gaze and triggers session start if needed.
   */
  animate = () => {
    this.animationId = requestAnimationFrame(this.animate)
    const now = performance.now()
    let delta = 1 / 60
    if (this.lastFrameTime !== null) {
      delta = (now - this.lastFrameTime) / 1000
    }
    this.lastFrameTime = now
    if (!this.isSessionStarted && this.playButton && this.isInVR && this.renderer.xr.isPresenting) {
      // Raycast from camera forward
      this.raycaster.set(this.camera.getWorldPosition(new THREE.Vector3()), this.camera.getWorldDirection(new THREE.Vector3()))
      const intersects = this.raycaster.intersectObject(this.playButton, true)
      if (intersects.length > 0) {
        this.gazeTimer += delta
        // Optionally: add a visual progress indicator
        if (this.gazeTimer >= this.gazeDuration) {
          this.startSession(this.sessions[0])
        }
      } else {
        this.gazeTimer = 0
      }
    }
    this.renderer.render(this.scene, this.camera)
    // Debug FPS
    if (this.debug) {
      this.frameCount++
      if (now - this.lastFpsTime > 1000) {
        const fps = this.frameCount / ((now - this.lastFpsTime) / 1000)
        console.log(`[ThreeJSManager] FPS: ${fps.toFixed(1)}`)
        this.frameCount = 0
        this.lastFpsTime = now
      }
    }
  }

  /**
   * Show a waiting scene (e.g., before playback starts)
   */
  public async showWaitingScene() {
    // Remove play button if present, reset scene to waiting state
    if (this.playButton) {
      this.scene.remove(this.playButton)
      this.playButton = null
    }
    // Optionally add a waiting visual or reset camera
    // For now, just log
    console.log('Waiting scene shown')
  }

  /**
   * Start a session (show session visuals, etc)
   */
  public async startSession(session: SessionInfo) {
    this.isSessionStarted = true
    if (this.playButton) {
      this.scene.remove(this.playButton)
      this.playButton = null
    }
    // TODO: Load session-specific 3D objects, update scene
    console.log('Session started:', session)
  }

  /**
   * Jump to a specific time in the session (for editor mode)
   */
  public async jumpToTime(time: number) {
    // TODO: Update 3D scene to reflect the given time
    console.log('Jumped to time:', time)
  }

  async enterVR() {
    if (!this.vr) return
    if (navigator.xr && this.renderer.xr) {
      try {
        const session = await navigator.xr.requestSession('immersive-vr')
        await this.renderer.xr.setSession(session)
        this.isInVR = true
      } catch (e) {
        this.isInVR = false
        throw e
      }
    }
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    // TODO: Dispose Three.js objects, listeners, etc.
  }

  public initDemoScene() {
    if (!this.threeScene) {
      const canvas = this.canvas || document.getElementById('vr-canvas') as HTMLCanvasElement | null
      if (!canvas) return
      const container = canvas.parentElement as HTMLElement
      this.threeScene = new ThreeScene({ 
        container, 
        canvas, 
        width: container.clientWidth, 
        height: container.clientHeight, 
        background: 0x181c26 
      })
    }
    this.threeScene.addSpinningCube()
    this.threeScene.start()
  }
}