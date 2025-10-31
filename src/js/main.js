/**
 * Main Application
 * すべてのモジュールを統合してアプリケーションを起動
 */

class App {
    constructor() {
        this.uiManager = new UIManager();
        this.stateManager = new StateManager();
        this.audioProcessor = new AudioProcessor();
        
        this.init();
    }

    /**
     * アプリケーション初期化
     */
    init() {
        this.uiManager.setupInitialState();
        this.setupEventListeners();
    }

    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // 規約同意
        this.uiManager.elements.termsAgreeBtn.addEventListener('click', () => {
            StorageManager.setTermsAgreed();
            this.uiManager.hideTermsModal();
        });

        // 規約再確認
        this.uiManager.elements.termsRecheckLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.uiManager.showTermsModal();
        });

        // パスワードボタン
        this.uiManager.elements.passwordBtn.addEventListener('click', () => {
            this.uiManager.showPasswordModal();
        });

        // パスワード送信
        this.uiManager.elements.passwordSubmitBtn.addEventListener('click', () => {
            this.handlePasswordSubmit();
        });

        // パスワードキャンセル
        this.uiManager.elements.passwordCancelBtn.addEventListener('click', () => {
            this.uiManager.hidePasswordModal();
        });

        // パスワード入力でEnterキー
        this.uiManager.elements.passwordModalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePasswordSubmit();
            }
        });

        // ファイル選択
        this.uiManager.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // ドラッグ&ドロップ
        this.uiManager.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uiManager.setDragOverState(true);
        });

        this.uiManager.elements.uploadArea.addEventListener('dragleave', () => {
            this.uiManager.setDragOverState(false);
        });

        this.uiManager.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uiManager.setDragOverState(false);
            this.handleFileSelect(e.dataTransfer.files);
        });

        // 音量スライダー変更
        this.uiManager.elements.volumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.audioProcessor.setVolume(value);
            this.uiManager.updateVolumeValue(value);
        });

        // 音量パーセント表示をクリックで直接入力
        this.uiManager.elements.volumeValue.addEventListener('click', () => {
            this.handleVolumeDirectInput();
        });

        // 処理ボタン
        this.uiManager.elements.processBtn.addEventListener('click', () => {
            this.processAudio();
        });

        // 再生ボタン
        this.uiManager.elements.playBtn.addEventListener('click', () => {
            this.playAudio();
        });

        // 一時停止ボタン
        this.uiManager.elements.pauseBtn.addEventListener('click', () => {
            this.pauseAudio();
        });

        // プログレスバークリックでシーク
        this.uiManager.elements.progressBar.addEventListener('click', (e) => {
            this.handleProgressBarClick(e);
        });
    }

    /**
     * ファイル選択ハンドラ
     * @param {FileList} files
     */
    handleFileSelect(files) {
        if (files.length === 0) return;

        const file = files[0];

        // ファイル形式チェック
        if (!this.isValidAudioFile(file)) {
            this.uiManager.showError(
                '対応していないファイル形式です。\n' +
                'MP3, WAV, M4A, OGG, WebM, FLACをご使用ください。'
            );
            return;
        }

        // 状態更新
        this.stateManager.setFile(file);

        // UI更新
        this.uiManager.addFileToList(file, () => {
            this.stateManager.reset();
            this.uiManager.hideElement(this.uiManager.elements.volumeSection);
            this.uiManager.hideElement(this.uiManager.elements.controlSection);
            this.uiManager.hideElement(this.uiManager.elements.playbackSection);
        });

        this.uiManager.showFileUploadedState();
    }

    /**
     * ファイル形式バリデーション
     * @param {File} file
     * @returns {boolean}
     */
    isValidAudioFile(file) {
        return CONFIG.SUPPORTED_FORMATS.includes(file.type);
    }

    /**
     * 音声処理を実行
     */
    async processAudio() {
        if (!this.stateManager.hasFile()) {
            this.uiManager.showError('ファイルが選択されていません。');
            return;
        }

        if (this.stateManager.isProcessing) {
            return; // 処理中は無視
        }

        try {
            this.stateManager.setProcessing(true);
            this.uiManager.setProcessButtonDisabled(true);

            // ファイルを読み込み
            const audioBuffer = await this.audioProcessor.loadAudioFile(
                this.stateManager.currentFile
            );

            // エフェクト適用（部屋の広さ0.8固定）
            await this.audioProcessor.applyEffects(
                audioBuffer, 
                0.8
            );

            // 処理完了
            this.stateManager.setProcessed();
            this.uiManager.setProcessButtonDisabled(false);
            this.uiManager.showProcessedState();

        } catch (error) {
            console.error('Audio processing error:', error);
            this.uiManager.showError('音声処理中にエラーが発生しました。');
            this.stateManager.setProcessing(false);
            this.uiManager.setProcessButtonDisabled(false);
        }
    }

    /**
     * 音声を再生
     */
    playAudio() {
        if (!this.stateManager.isProcessed) {
            this.uiManager.showError('先にエフェクトを適用してください。');
            return;
        }

        try {
            this.uiManager.togglePlayPauseButton(true);
            this.uiManager.toggleProgress(true);

            
            this.audioProcessor.play((currentTime, duration) => {
                this.uiManager.updateProgress(currentTime, duration);

                // 再生終了時
                if (currentTime >= duration) {
                    this.uiManager.togglePlayPauseButton(false);
                }
            });

        } catch (error) {
            console.error('Playback error:', error);
            this.uiManager.showError('再生中にエラーが発生しました。');
            this.uiManager.togglePlayPauseButton(false);
        }
    }

    /**
     * 音声を一時停止
     */
    pauseAudio() {
        this.audioProcessor.pause();
        this.uiManager.togglePlayPauseButton(false);
    }

    /**
     * パスワード送信処理（Phase 3実装予定）
     */
    handlePasswordSubmit() {
        const password = this.uiManager.elements.passwordModalInput.value;
        
        if (password.length !== 4 || !/^\d{4}$/.test(password)) {
            this.uiManager.showError('4桁の数字を入力してください。');
            return;
        }

        // Phase 3で実装予定：Netlify Functionsで認証
        this.uiManager.showError('パスワード機能はPhase 3で実装予定です。');
        this.uiManager.hidePasswordModal();
    }

    /**
     * 音量の直接入力ハンドラー
     */
    handleVolumeDirectInput() {
        const currentVolume = this.audioProcessor.volume * 100;
        const input = prompt(`音量を入力してください（0〜500）`, Math.round(currentVolume));
        
        if (input === null) return; // キャンセル
        
        const value = parseInt(input, 10);
        if (isNaN(value) || value < 0 || value > 500) {
            this.uiManager.showError('0〜500の数値を入力してください。');
            return;
        }
        
        const volumeValue = value / 100;
        this.audioProcessor.setVolume(volumeValue);
        this.uiManager.elements.volumeSlider.value = volumeValue;
        this.uiManager.updateVolumeValue(volumeValue);
    }

    /**
     * プログレスバークリックでシーク
     * @param {MouseEvent} e
     */
    handleProgressBarClick(e) {
        if (!this.stateManager.isProcessed) return;
        
        const rect = this.uiManager.elements.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const seekTime = percentage * this.audioProcessor.duration;
        
        const shouldRestart = this.audioProcessor.seek(seekTime);
        if (shouldRestart) {
            this.playAudio();
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
