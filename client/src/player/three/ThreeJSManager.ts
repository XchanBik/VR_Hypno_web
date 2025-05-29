/// <reference types="three" />
import * as THREE from 'three'
import type { PlaylistInfo } from '@shared/playlist/types'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'
import { WebGLRenderer } from 'three'
import { ThreeScene, ThreeSceneOptions } from './ThreeScene'

export interface ThreeJSManagerOptions {
  container: HTMLElement
  background?: number
}

export default class ThreeJSManager {
  private threeScene: ThreeScene | null = null
  private renderer: THREE.WebGLRenderer | null = null

  constructor(private options: ThreeJSManagerOptions) { }

  public async initDemoScene() {
    if (!this.threeScene) {
      this.threeScene = new ThreeScene({
        container: this.options.container,
        background: this.options.background ?? 0x181c26
      })
    }
    this.threeScene.addSpinningCube()
    this.threeScene.start()
    this.renderer = this.threeScene.getRenderer()
    // Try to start with an inline XR session if available
    if (this.renderer && navigator.xr && this.renderer.xr) {
      this.renderer.xr.enabled = true
      try {
        const inlineSession = await navigator.xr.requestSession('inline')
        await this.renderer.xr.setSession(inlineSession)
        this.renderer.setAnimationLoop(() => {
          if (this.threeScene) this.threeScene.renderFrame()
        })
      } catch (err) {
        // Inline session not available, fallback to normal rendering
        this.renderer.setAnimationLoop(() => {
          if (this.threeScene) this.threeScene.renderFrame()
        })
      }
    } else if (this.renderer) {
      // Fallback: just use setAnimationLoop
      this.renderer.setAnimationLoop(() => {
        if (this.threeScene) this.threeScene.renderFrame()
      })
    }
  }

  public async enterVR() {
    if (!this.threeScene) throw new Error('ThreeScene not initialized')
    const renderer = this.threeScene.getRenderer()
    if (!renderer.xr) throw new Error('WebXR not supported in this renderer')
    renderer.xr.enabled = true
    if (!navigator.xr) {
      throw new Error('WebXR not available in this browser')
    }
    let session: XRSession | null = null
    // Try 'local-floor' first
    try {
      session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
      })
    } catch (err) {
      // Fallback to 'local'
      session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local'],
      })
    }
    await renderer.xr.setSession(session)
    renderer.setAnimationLoop(() => {
      if (this.threeScene) this.threeScene.renderFrame()
    })
  }

  public dispose() {
    if (this.threeScene) {
      this.threeScene.dispose()
      this.threeScene = null
    }
  }

  // Additional methods to access Three.js objects if needed
  public getScene(): THREE.Scene | null {
    return this.threeScene?.getScene() ?? null
  }

  public getCamera(): THREE.PerspectiveCamera | null {
    return this.threeScene?.getCamera() ?? null
  }

  public getRenderer(): THREE.WebGLRenderer | null {
    return this.threeScene?.getRenderer() ?? null
  }
}