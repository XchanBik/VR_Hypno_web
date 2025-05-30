import * as THREE from 'three'
import { WebGLRenderer } from 'three'

export interface ThreeSceneOptions {
  container: HTMLElement
  background?: number
}

export class ThreeScene {
  public isVR: boolean = false
  private renderer: WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
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
    this.camera.position.set(0, 1.6, 3)

    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.container.appendChild(this.renderer.domElement)

    this.updateRenderSize()
    this.resizeObserver = new ResizeObserver(() => this.updateRenderSize())
    this.resizeObserver.observe(this.container)
  }

  private updateRenderSize() {
    if (this.isVR) {
      return
    }
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public getScene(): THREE.Scene {
    return this.scene
  }
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }
  public getRenderer(): WebGLRenderer {
    return this.renderer
  }

  public dispose() {
    this.resizeObserver.disconnect()
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    this.renderer.dispose()
  }

  public renderFrame() {
    if (this.spinningCube) {
      this.spinningCube.rotation.x += 0.01
      this.spinningCube.rotation.y += 0.01
    }
    this.renderer.render(this.scene, this.camera)
  }

  public addSpinningCube() {
    if (this.spinningCube) return
    const geometry = new THREE.TorusGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: 0x4f8cff })
    this.spinningCube = new THREE.Mesh(geometry, material)
    this.spinningCube.position.set(0, 1.6, -2)
    this.scene.add(this.spinningCube)
    if (!this.scene.children.some(obj => obj.type === 'AmbientLight')) {
      this.scene.add(new THREE.AmbientLight(0xffdff3, 1))
    }
  }
}
