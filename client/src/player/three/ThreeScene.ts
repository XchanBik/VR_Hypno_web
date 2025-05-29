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
    const width = options.width || window.innerWidth
    const height = options.height || window.innerHeight

    // Initialize scene
    this.scene = new THREE.Scene()
    if (options.background !== undefined) {
      this.scene.background = new THREE.Color(options.background)
    }

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 5

    // Use the provided canvas for the renderer
    this.renderer = new WebGLRenderer({
      antialias: options.antialias ?? true,
      canvas: options.canvas
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height, false)
    // Do NOT append the canvas again if it's already in the DOM
    // (Assume it's already present)

    // Handle window resize - use ResizeObserver for better canvas size detection
    this.setupResizeObserver()
  }

  private setupResizeObserver() {
    const canvas = this.renderer.domElement

    // Use ResizeObserver to watch for canvas size changes
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect

        // Only update if size actually changed
        if (width !== this.lastCanvasWidth || height !== this.lastCanvasHeight) {
          this.lastCanvasWidth = width
          this.lastCanvasHeight = height
          this.updateViewport(width, height)
        }
      }
    })

    resizeObserver.observe(canvas)

    // Fallback for window resize (in case ResizeObserver isn't supported)
    window.addEventListener('resize', () => {
      const rect = canvas.getBoundingClientRect()
      this.updateViewport(rect.width, rect.height)
    })
  }

  private updateViewport(width: number, height: number) {
    // Update camera aspect ratio
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    // Update renderer size but DON'T change canvas CSS size
    // The `false` parameter prevents Three.js from setting canvas.style.width/height
    this.renderer.setSize(width, height, false)
  }

  // Legacy method for backward compatibility
  protected onWindowResize() {
    const canvas = this.renderer.domElement
    const rect = canvas.getBoundingClientRect()
    this.updateViewport(rect.width, rect.height)
  }



  protected animate() {
    // --- Responsive resize: check if canvas size changed ---
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width !== this.lastCanvasWidth || height !== this.lastCanvasHeight) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
      this.lastCanvasWidth = width;
      this.lastCanvasHeight = height;
    }
    // ---
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
    window.removeEventListener('resize', this.onWindowResize.bind(this))
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
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