import { WebXRManager, WebGLRenderer } from 'three';

export class XRManager {
  private xrManager: WebXRManager | null = null;
  private session: XRSession | null = null;

  constructor(renderer: WebGLRenderer) {
    this.xrManager = renderer.xr;
    this.setupVisibilityListener();
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      console.log('Visibility changed:', document.hidden);
      if (document.hidden) {
        this.endSession();
      }
    });
  }

  public async startSession(): Promise<void> {
    if (!this.xrManager) {
      console.error('XRManager not initialized');
      return;
    }
    try {
      this.session = await this.xrManager.getSession();
      console.log('XR session started');
    } catch (error) {
      console.error('Failed to start XR session:', error);
    }
  }

  public endSession(): void {
    if (this.session) {
      this.session.end();
      this.session = null;
      console.log('XR session ended');
    }
  }

  public isSessionActive(): boolean {
    return this.session !== null;
  }
} 