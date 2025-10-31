/**
 * Audio Processor
 * Web Audio APIを使用した音声処理を担当
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.sourceNode = null;
        this.gainNode = null;
        this.processedBuffer = null;
        this.isPlaying = false;
        this.isLooping = true; // デフォルトでループ
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1.0; // デフォルト100%
        this.updateInterval = null;
    }

    /**
     * AudioContextを初期化
     */
    initAudioContext() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * ファイルを読み込んでデコード
     * @param {File} file
     * @returns {Promise<AudioBuffer>}
     */
    async loadAudioFile(file) {
        this.initAudioContext();
        
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        this.duration = audioBuffer.duration;
        return audioBuffer;
    }

    /**
     * エコー＋リバーブエフェクトを適用
     * @param {AudioBuffer} inputBuffer
     * @param {number} roomSize - 部屋の広さ (0.0〜1.0)
     * @returns {Promise<AudioBuffer>}
     */
    async applyEffects(inputBuffer, roomSize = CONFIG.EFFECT.REVERB.defaultRoomSize) {
        this.initAudioContext();

        const offlineContext = new OfflineAudioContext(
            inputBuffer.numberOfChannels,
            inputBuffer.length,
            inputBuffer.sampleRate
        );

        // ソースノード作成
        const source = offlineContext.createBufferSource();
        source.buffer = inputBuffer;

        // === エコーエフェクト ===
        const echoDelay = offlineContext.createDelay();
        echoDelay.delayTime.value = CONFIG.EFFECT.ECHO.delayTime;

        const echoFeedback = offlineContext.createGain();
        echoFeedback.gain.value = CONFIG.EFFECT.ECHO.feedback;

        const echoMix = offlineContext.createGain();
        echoMix.gain.value = CONFIG.EFFECT.ECHO.wetMix;

        // エコーのルーティング
        source.connect(echoDelay);
        echoDelay.connect(echoFeedback);
        echoFeedback.connect(echoDelay); // フィードバックループ
        echoDelay.connect(echoMix);

        // === リバーブエフェクト（ConvolverNode使用） ===
        const convolver = offlineContext.createConvolver();
        convolver.buffer = this.createReverbImpulse(
            offlineContext, 
            roomSize, 
            CONFIG.EFFECT.REVERB.decay,
            CONFIG.EFFECT.REVERB.stereoWidth
        );

        const reverbMix = offlineContext.createGain();
        reverbMix.gain.value = CONFIG.EFFECT.REVERB.wetMix;

        // リバーブのルーティング
        source.connect(convolver);
        convolver.connect(reverbMix);

        // === ドライ（原音）ミキシング ===
        const dryGain = offlineContext.createGain();
        dryGain.gain.value = Math.min(
            CONFIG.EFFECT.ECHO.dryMix, 
            CONFIG.EFFECT.REVERB.dryMix
        );
        source.connect(dryGain);

        // === 最終ミックス ===
        const masterGain = offlineContext.createGain();
        masterGain.gain.value = 0.8; // 音割れ防止

        dryGain.connect(masterGain);
        echoMix.connect(masterGain);
        reverbMix.connect(masterGain);
        masterGain.connect(offlineContext.destination);

        // 処理実行
        source.start(0);
        this.processedBuffer = await offlineContext.startRendering();
        
        return this.processedBuffer;
    }

    /**
     * リバーブ用インパルスレスポンスを生成
     * @param {AudioContext} context
     * @param {number} roomSize
     * @param {number} decay
     * @param {number} stereoWidth
     * @returns {AudioBuffer}
     */
    createReverbImpulse(context, roomSize, decay, stereoWidth) {
        const sampleRate = context.sampleRate;
        const length = sampleRate * roomSize * 3; // 部屋の広さに応じた長さ
        const impulse = context.createBuffer(2, length, sampleRate);
        
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / sampleRate;
            const envelope = Math.exp(-n / decay);
            
            // ステレオ幅を適用
            const baseNoise = (Math.random() * 2 - 1) * envelope;
            leftChannel[i] = baseNoise * (1 - stereoWidth / 2);
            rightChannel[i] = baseNoise * (1 + stereoWidth / 2);
        }

        return impulse;
    }

    /**
     * 処理済み音声を再生
     * @param {Function} onTimeUpdate - 再生位置更新時のコールバック
     */
    play(onTimeUpdate) {
        if (!this.processedBuffer) {
            throw new Error('No processed audio available');
        }

        this.stop(); // 既存の再生を停止

        this.initAudioContext();
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.processedBuffer;
        this.sourceNode.loop = this.isLooping; // ループ設定
        
        // 音量ノードを追加
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume || 1.0;
        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        const startTime = this.audioContext.currentTime;
        const startOffset = this.currentTime;
        this.sourceNode.start(0, startOffset);
        this.isPlaying = true;

        // 再生位置の更新
        this.updateInterval = setInterval(() => {
            if (this.isPlaying && this.audioContext) {
                const elapsed = this.audioContext.currentTime - startTime;
                this.currentTime = (startOffset + elapsed) % this.duration;
                
                if (onTimeUpdate) {
                    onTimeUpdate(this.currentTime, this.duration);
                }
            } else {
                clearInterval(this.updateInterval);
            }
        }, 100);

        this.sourceNode.onended = () => {
            if (!this.isLooping) {
                this.isPlaying = false;
                this.currentTime = 0;
                clearInterval(this.updateInterval);
            }
        };
    }

    /**
     * 再生を停止
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (e) {
                // Already stopped
            }
            this.sourceNode = null;
        }
        this.isPlaying = false;
    }

    /**
     * 一時停止
     */
    pause() {
        if (this.isPlaying) {
            this.stop();
        }
    }

    /**
     * 音量を設定（0.0〜5.0 = 0%〜500%）
     * @param {number} volume
     */
    setVolume(volume) {
        this.volume = volume;
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }

    /**
     * 再生位置をシーク
     * @param {number} time - シーク先の時間（秒）
     */
    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        
        if (this.isPlaying) {
            // 再生中の場合は再起動
            const wasPlaying = this.isPlaying;
            this.stop();
            if (wasPlaying) {
                // playメソッドを呼ぶために外部から再度呼び出してもらう必要がある
                return true; // 再生を再開する必要があることを通知
            }
        }
        return false;
    }

    /**
     * 処理済み音声をダウンロード
     * @param {string} originalFileName
     */
    download(originalFileName) {
        if (!this.processedBuffer) {
            throw new Error('No processed audio available');
        }

        const wav = this.audioBufferToWav(this.processedBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `3D_${originalFileName.replace(/\.[^/.]+$/, '')}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * AudioBufferをWAV形式に変換
     * @param {AudioBuffer} buffer
     * @returns {ArrayBuffer}
     */
    audioBufferToWav(buffer) {
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numberOfChannels * bytesPerSample;

        const data = new Float32Array(buffer.length * numberOfChannels);
        
        // インターリーブ
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                data[i * numberOfChannels + channel] = buffer.getChannelData(channel)[i];
            }
        }

        const dataLength = data.length * bytesPerSample;
        const wavBuffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(wavBuffer);

        // WAVヘッダー書き込み
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // PCMデータ書き込み
        const volume = 0.8;
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i])) * volume;
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return wavBuffer;
    }
}
