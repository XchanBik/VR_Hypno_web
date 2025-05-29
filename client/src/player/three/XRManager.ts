import { ThreeScene } from "@/player/three/ThreeScene";
import * as THREE from 'three'

export interface XRStateListener {
    onXRStart(): void;
    onXRStop(): void;
    onXRPending(): void;
}

export default class XRManager {
    private threeScene: ThreeScene
    private renderer: THREE.WebGLRenderer
    private listener: XRStateListener | null = null
    private xrSession: XRSession | null = null
    private inlineSession: XRSession | null = null

    constructor(threeScene: ThreeScene) {
        this.threeScene = threeScene
        this.renderer = this.threeScene.getRenderer()
        if (!navigator.xr || !this.renderer.xr) {
            throw new Error('WebXR not available in this browser.')
        }
        this.renderer.xr.enabled = true
    }

    public async initInlineSession() {        
        if (!navigator.xr) {
            throw new Error('WebXR not available in this browser.')
        }
        this.inlineSession = await navigator.xr.requestSession('inline')
    }

    public async startInlineSession() {
        if (this.listener) {
            this.listener.onXRStop()
        }
        this.xrSession = null
        await this.renderer.xr.setSession(this.inlineSession)
        this.renderer.setAnimationLoop(() => {
            this.threeScene.renderFrame()
        })
    }

    public addXRStateListener(listener: XRStateListener) {
        this.listener = listener
    }

    public async enterVR() {
        if (!this.inlineSession || !navigator.xr) {
            throw new Error('XR not initialized. Cannot enter VR.')

        }
        if (this.listener) {
            this.listener.onXRPending()
        }
        let session: XRSession | null = null
        try {
            //Can take time in oculus need to put headset on
            session = await navigator.xr.requestSession('immersive-vr', {
                optionalFeatures: ['local-floor', 'local'], // it will use the best it can
            });
        } catch (err) {
            alert('Failed to start VR session')
            return
        }
        if (!session) {
            alert('XR session is null')
            return
        }

        //Session handle
        session.addEventListener('end', this.startInlineSession)
        this.xrSession = session
        await this.renderer.xr.setSession(this.xrSession)
        if (this.listener) {
            this.listener.onXRStart()
        }
        this.renderer.setAnimationLoop(() => {
            this.threeScene.renderFrame()
        })
    }
}