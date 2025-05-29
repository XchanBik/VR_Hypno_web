import * as THREE from 'three'
import { WebGLRenderer } from 'three'

export interface ThreeSceneOptions {
  container: HTMLElement
  canvas: HTMLCanvasElement
  width?: number
  height?: number
  antialias?: boolean
  background?: number
}

export class ThreeScene {
  protected renderer: WebGLRenderer
  protected scene: THREE.Scene
  protected camera: THREE.PerspectiveCamera
  protected container: HTMLElement
  private animationFrameId: number | null = null
  private spinningCube: THREE.Mesh | null = null
  private lastCanvasWidth: number = 0;
  private lastCanvasHeight: number = 0;

  constructor(options: ThreeSceneOptions) {
    this.container = options.container
    const canvas = options.canvas

    // Get the actual canvas size from CSS/Tailwind
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Initialize scene
    this.scene = new THREE.Scene()
    if (options.background !== undefined) {
      this.scene.background = new THREE.Color(options.background)
    }

    // Initialize camera with actual canvas dimensions
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 5

    // Create renderer - NEVER let it change canvas size
    this.renderer = new WebGLRenderer({
      antialias: options.antialias ?? true,
      canvas: canvas
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    
    // LOCK the canvas CSS size - Tailwind controls this, not Three.js
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.removeAttribute('width')
    canvas.removeAttribute('height')
    
    // Set initial internal render size
    this.updateInternalRenderSize()
    
    // Watch for canvas size changes
    this.setupResizeObserver()
  }

  private setupResizeObserver() {
    const canvas = this.renderer.domElement
    
    const resizeObserver = new ResizeObserver(() => {
      this.updateInternalRenderSize()
    })
    
    resizeObserver.observe(canvas)
  }

  private updateInternalRenderSize() {
    const canvas = this.renderer.domElement
    const rect = canvas.getBoundingClientRect()
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
  }

  protected animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
    
    if (this.spinningCube) {
      this.spinningCube.rotation.x += 0.01
      this.spinningCube.rotation.y += 0.01
    }
    
    this.renderer.render(this.scene, this.camera)
  }

  public start() {
    if (!this.animationFrameId) {
      this.animate()
    }
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  public dispose() {
    this.stop()
    this.renderer.dispose()
  }

  public addSpinningCube() {
    if (this.spinningCube) return
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: 0x4f8cff })
    this.spinningCube = new THREE.Mesh(geometry, material)
    this.scene.add(this.spinningCube)
    
    // Add a light if not present
    if (!this.scene.children.some(obj => obj.type === 'AmbientLight')) {
      this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    }
  }
}