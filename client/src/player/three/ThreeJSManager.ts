/// <reference types="three" />
import * as THREE from 'three'
import type { PlaylistInfo } from '@shared/playlist/types'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'
import { WebGLRenderer } from 'three'
import { ThreeScene, ThreeSceneOptions } from './ThreeScene'

export interface ThreeJSManagerOptions {
  canvas: HTMLCanvasElement
  background?: number
}

export default class ThreeJSManager {
  private threeScene: ThreeScene | null = null

  constructor(private options: ThreeJSManagerOptions) {}

  public initDemoScene() {
    if (!this.threeScene) {
      this.threeScene = new ThreeScene({
        canvas: this.options.canvas,
        background: this.options.background ?? 0x181c26
      })
    }
    this.threeScene.addSpinningCube()
    this.threeScene.start()
  }

  public dispose() {
    if (this.threeScene) {
      this.threeScene.dispose()
      this.threeScene = null
    }
  }
}