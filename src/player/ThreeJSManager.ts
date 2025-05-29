import { WebGLRenderer } from 'three';
import { XRManager } from './XRManager';

export class ThreeJSManager {
  private xrManager: XRManager;

  constructor(renderer: WebGLRenderer) {
    this.xrManager = new XRManager(renderer);
  }

  public async startXRSession(): Promise<void> {
    await this.xrManager.startSession();
  }

  public endXRSession(): void {
    this.xrManager.endSession();
  }

  public isXRSessionActive(): boolean {
    return this.xrManager.isSessionActive();
  }
} 