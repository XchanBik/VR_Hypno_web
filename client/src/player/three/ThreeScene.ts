import * as THREE from 'three'
import { WebGLRenderer } from 'three'

export interface ThreeSceneOptions {
  canvas: HTMLCanvasElement
  background?: number
}

export class ThreeScene {
  private renderer: WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private animationFrameId: number | null = null
  private spinningCube: THREE.Mesh | null = null
  private resizeObserver: ResizeObserver

  constructor(options: ThreeSceneOptions) {
    const canvas = options.canvas
    canvas.removeAttribute('width')
    canvas.removeAttribute('height')
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    this.scene = new THREE.Scene()
    if (options.background !== undefined) {
      this.scene.background = new THREE.Color(options.background)
    }

    const width = canvas.clientWidth
    const height = canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 5

    this.renderer = new WebGLRenderer({ antialias: true, canvas })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.updateRenderSize()

    this.resizeObserver = new ResizeObserver(() => this.updateRenderSize())
    this.resizeObserver.observe(canvas)
  }

  private updateRenderSize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate)
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
    this.resizeObserver.disconnect()
    this.renderer.dispose()
  }

  public addSpinningCube() {
    if (this.spinningCube) return
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: 0x4f8cff })
    this.spinningCube = new THREE.Mesh(geometry, material)
    this.scene.add(this.spinningCube)
    if (!this.scene.children.some(obj => obj.type === 'AmbientLight')) {
      this.scene.add(new THREE.AmbientLight(0xffffff, 1))
    }
  }
}