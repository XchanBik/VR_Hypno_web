export default class AudioManager {
    // Public    
    public onStateChange: ((isPlaying: boolean) => void) | null = null;
    public onAudioEnded: (() => void) | null = null;
    public isPlaying: boolean = false;

    //Properties
    private audio: HTMLAudioElement;
    private progressBar: HTMLInputElement;
    private volumeSlider: HTMLInputElement;

    // Optional
    private progressTime: HTMLElement | null = null;
    private progressDuration: HTMLElement | null = null;

    //Constructor
    constructor(audio: HTMLAudioElement, progressBar: HTMLInputElement, volumeSlider: HTMLInputElement) {
        this.audio = audio;
        this.progressBar = progressBar;
        this.volumeSlider = volumeSlider;

        this.setEvents();
    }
    
    public setSong(songUri: string) {
        this.audio.pause()
        this.audio.src = songUri
        this.isPlaying = false
        this.audio.currentTime = 0
        this.audio.load()
    }

    public playAudio() {
        this.audio.play()
        this.isPlaying = true
        if (this.onStateChange) {
            this.onStateChange(true)
        }
    }

    public pauseAudio() {
        this.audio.pause()
        this.isPlaying = false
        if (this.onStateChange) {
            this.onStateChange(false)
        }
    }

    public stopAudio() {
        this.audio.pause()
        this.audio.currentTime = 0
        this.isPlaying = false
        if (this.onStateChange) {
            this.onStateChange(false)
        }
    }

    private setEvents() {
        this.audio.ontimeupdate = this.updateProgressBar;
        this.audio.onloadedmetadata = this.updateProgressBar;
        this.audio.onended = this.handleAudioEnded;
        this.progressBar.addEventListener('input', this.onProgessBarSeek)
        this.volumeSlider.addEventListener('input', this.onVolumeInput)
    }
    
    //EventsHandlers
    private handleAudioEnded() {
        if (this.onAudioEnded) {
            this.onAudioEnded();
        }
    }

    private updateProgressBar() {
        if (!this.audio || !this.progressBar) {
            throw new Error('Audio or progress bar not found')
        }        
        this.progressBar.max = this.audio.duration ? this.audio.duration.toString() : '1'
        this.progressBar.value = this.audio.currentTime ? this.audio.currentTime.toString() : '0'
        if (this.progressTime && this.progressDuration) {
            this.progressTime.textContent = formatTime(this.audio.currentTime)
            this.progressDuration.textContent = formatTime(this.audio.duration)
        }
    }

    private onProgessBarSeek() {
        if (!this.audio || !this.progressBar) {
            throw new Error('Audio or progress bar not found')
        }
        this.audio.currentTime = parseFloat(this.progressBar.value)
    }

    private onVolumeInput() {
        if (!this.audio || !this.volumeSlider) {
            throw new Error('Audio or volume slider not found')
        }
        this.audio.volume = parseFloat(this.volumeSlider.value)
    }

    // For display optional
    public setProgressTime(progressTime: HTMLElement) {
        this.progressTime = progressTime;
    }
    public setProgressDuration(progressDuration: HTMLElement) {
        this.progressDuration = progressDuration;
    }
}

function formatTime(sec: number): string {
    if (!isFinite(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}