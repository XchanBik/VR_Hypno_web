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

  constructor(private options: ThreeJSManagerOptions) { }

  public initDemoScene() {
    if (!this.threeScene) {
      this.threeScene = new ThreeScene({
        container: this.options.container,
        background: this.options.background ?? 0x181c26
      })
    }
    this.threeScene.addSpinningCube()
    this.threeScene.start()
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

    // Try 'local-floor'
    try {
      session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
      })
    } catch (err) {
      console.warn('Failed to request session with local-floor:', err)
    }

    // Fallback to 'local' if needed
    if (!session) {
      try {
        session = await navigator.xr.requestSession('immersive-vr', {
          requiredFeatures: ['local'],
        })
      } catch (err) {
        console.error('Failed to request session with local fallback:', err)
        alert('Failed to start VR session: your device may not support required tracking modes.')
        return
      }
    }

    await renderer.xr.setSession(session)

    renderer.setAnimationLoop(() => {
      if (this.threeScene) {
        this.threeScene.renderFrame()
      }
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

  public getRenderer(): WebGLRenderer | null {
    return this.threeScene?.getRenderer() ?? null
  }
}