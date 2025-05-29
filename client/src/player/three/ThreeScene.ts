import * as THREE from 'three'
import { WebGLRenderer } from 'three'

export interface ThreeSceneOptions {
  container: HTMLElement
  background?: number
}

export class ThreeScene {
  private renderer: WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private animationFrameId: number | null = null
  private spinningCube: THREE.Mesh | null = null
  private resizeObserver: ResizeObserver
  private container: HTMLElement

  constructor(options: ThreeSceneOptions) {
    this.container = options.container

    this.scene = new THREE.Scene()
    if (options.background !== undefined) {
      this.scene.background = new THREE.Color(options.background)
    }

    // Get container dimensions
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 5

    // Create renderer without specifying canvas - Three.js will create one
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // Style the canvas that Three.js created
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'

    // Append the canvas to container
    this.container.appendChild(this.renderer.domElement)

    this.updateRenderSize()

    // Observe container for resize changes
    this.resizeObserver = new ResizeObserver(() => this.updateRenderSize())
    this.resizeObserver.observe(this.container)
  }

  private updateRenderSize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    // Update renderer size
    this.renderer.setSize(width, height, false)

    // Update camera aspect ratio
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public renderFrame() {
    if (this.spinningCube) {
      this.spinningCube.rotation.x += 0.01
      this.spinningCube.rotation.y += 0.01
    }

    this.renderer.render(this.scene, this.camera)
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate)
    this.renderFrame()
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
    this.resizeObserver.disconnect()

    // Remove canvas from container
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }

    this.renderer.dispose()
  }

  public addSpinningCube() {
    if (this.spinningCube) return

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: 0x4f8cff })
    this.spinningCube = new THREE.Mesh(geometry, material)
    this.scene.add(this.spinningCube)

    // Add ambient light if not already present
    if (!this.scene.children.some(obj => obj.type === 'AmbientLight')) {
      this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    }
  }

  // Additional methods for scene management
  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  public getRenderer(): WebGLRenderer {
    return this.renderer
  }
}
