import { Session } from "@shared/session/types";
import XRManager, { XRStateListener } from "@/player/three/XRManager";
import AudioManager from "../ui/AudioManager";
import { ThreeScene } from "./ThreeScene";

export default class SessionPlayer {
    //Properties
    private container: HTMLElement
    private xrManager: XRManager
    private threeScene: ThreeScene
    private session: Session | null = null;
    private audioManager: AudioManager | null = null;

    //Constructor
    constructor(container: HTMLElement) {
        this.container = container;
        this.threeScene = new ThreeScene({ container: this.container, background: 0xddaaff });        
        this.threeScene.addSpinningCube()
        
        this.xrManager = new XRManager(this.threeScene);
    }

    public loadSession(session: Session, audioManager: AudioManager) {
        this.session = session
        this.audioManager = audioManager

        const wasPlaying = audioManager.isPlaying
        audioManager.setSong(this.getSongStreamUrl())
        if (wasPlaying) {
            audioManager.playAudio()
        }
    }

    public addXRStateListener(listener: XRStateListener) {
        this.xrManager.addXRStateListener(listener)
    }

    public getSongStreamUrl(): string {
        if (!this.session) {
            throw new Error('Session not loaded')
        }
        return `/api/songs/${this.session.info.song_uid}/stream`
    }
}