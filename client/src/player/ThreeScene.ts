import * as THREE from 'three'
import { WebGLRenderer } from 'three'

export interface ThreeSceneOptions {
  container: HTMLElement
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

    // Initialize renderer
    this.renderer = new WebGLRenderer({ 
      antialias: options.antialias ?? true,
      canvas: document.createElement('canvas')
    })
    this.renderer.setSize(width, height)
    this.container.appendChild(this.renderer.domElement)

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  protected onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  protected animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
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
} 