/**
 * UI Manager
 * UI要素の表示/非表示と段階的表示ロジックを担当
 */

class UIManager {
    constructor() {
        this.elements = {
            // モーダル
            termsModal: document.getElementById('terms-modal'),
            termsAgreeBtn: document.getElementById('terms-agree-btn'),
            termsRecheckLink: document.getElementById('terms-recheck-link'),
            
            // パスワードモーダル
            passwordModal: document.getElementById('password-modal'),
            passwordBtn: document.getElementById('password-btn'),
            passwordModalInput: document.getElementById('password-modal-input'),
            passwordSubmitBtn: document.getElementById('password-submit-btn'),
            passwordCancelBtn: document.getElementById('password-cancel-btn'),
            
            // アップロード
            fileInput: document.getElementById('file-input'),
            uploadArea: document.getElementById('upload-area'),
            fileList: document.getElementById('file-list'),
            
            // 音量スライダー
            volumeSection: document.getElementById('volume-section'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeValue: document.getElementById('volume-value'),
            
            // コントロール
            controlSection: document.getElementById('control-section'),
            processBtn: document.getElementById('process-btn'),
            
            // 再生
            playbackSection: document.getElementById('playback-section'),
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            
            // プログレスバー
            progressWrapper: document.getElementById('progress-wrapper'),
            progressBar: document.getElementById('progress-bar'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text')
        };
    }

    /**
     * 初期表示状態をセットアップ
     */
    setupInitialState() {
        // 規約同意済みかチェック
        if (!StorageManager.isTermsAgreed()) {
            this.showTermsModal();
        }

        // 初期状態: 音量スライダー、処理ボタン、再生エリアは非表示
        this.hideElement(this.elements.volumeSection);
        this.hideElement(this.elements.controlSection);
        this.hideElement(this.elements.playbackSection);
        this.hideElement(this.elements.progressWrapper);
    }

    /**
     * 規約モーダルを表示
     */
    showTermsModal() {
        this.elements.termsModal.classList.add('active');
    }

    /**
     * 規約モーダルを閉じる
     */
    hideTermsModal() {
        this.elements.termsModal.classList.remove('active');
    }

    /**
     * パスワードモーダルを表示
     */
    showPasswordModal() {
        this.elements.passwordModal.classList.add('active');
        this.elements.passwordModalInput.value = '';
        this.elements.passwordModalInput.focus();
    }

    /**
     * パスワードモーダルを閉じる
     */
    hidePasswordModal() {
        this.elements.passwordModal.classList.remove('active');
        this.elements.passwordModalInput.value = '';
    }

    /**
     * ファイル選択後のUI表示
     * - 音量スライダー表示
     * - 処理ボタン表示
     */
    showFileUploadedState() {
        this.showElement(this.elements.volumeSection);
        this.showElement(this.elements.controlSection);
        this.hideElement(this.elements.playbackSection);
    }

    /**
     * 処理完了後のUI表示
     * - 再生ボタン表示
     * - ダウンロードボタン表示
     */
    showProcessedState() {
        this.showElement(this.elements.playbackSection);
        this.elements.pauseBtn.classList.add('hidden');
        this.elements.playBtn.classList.remove('hidden');
    }

    /**
     * 要素を表示
     * @param {HTMLElement} element
     */
    showElement(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    /**
     * 要素を非表示
     * @param {HTMLElement} element
     */
    hideElement(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * ファイルリストに追加
     * @param {File} file
     * @param {Function} onRemove
     */
    addFileToList(file, onRemove) {
        this.elements.fileList.innerHTML = ''; // 1ファイルのみ対応

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = file.name;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            this.elements.fileList.innerHTML = '';
            if (onRemove) onRemove();
        };

        fileItem.appendChild(fileName);
        fileItem.appendChild(removeBtn);
        this.elements.fileList.appendChild(fileItem);
    }

    /**
     * 音量スライダーの値を更新
     * @param {number} value - 0〜5（0%〜500%）
     */
    updateVolumeValue(value) {
        const percentage = Math.round(value * 100);
        this.elements.volumeValue.textContent = `${percentage}%`;
    }

    /**
     * 処理ボタンを無効化/有効化
     * @param {boolean} disabled
     */
    setProcessButtonDisabled(disabled) {
        this.elements.processBtn.disabled = disabled;
        
        if (disabled) {
            this.elements.processBtn.textContent = '処理中...';
            this.elements.processBtn.classList.add('processing');
        } else {
            this.elements.processBtn.textContent = 'エフェクトを適用';
            this.elements.processBtn.classList.remove('processing');
        }
    }

    /**
     * 再生/一時停止ボタンを切り替え
     * @param {boolean} isPlaying
     */
    togglePlayPauseButton(isPlaying) {
        if (isPlaying) {
            this.elements.playBtn.classList.add('hidden');
            this.elements.pauseBtn.classList.remove('hidden');
        } else {
            this.elements.playBtn.classList.remove('hidden');
            this.elements.pauseBtn.classList.add('hidden');
        }
    }

    /**
     * プログレスバーを更新
     * @param {number} currentTime
     * @param {number} duration
     */
    updateProgress(currentTime, duration) {
        if (!this.elements.progressWrapper.classList.contains('hidden')) {
            const progress = (currentTime / duration) * 100;
            this.elements.progressFill.style.width = `${progress}%`;

            const formatTime = (seconds) => {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            };

            this.elements.progressText.textContent = 
                `${formatTime(currentTime)} / ${formatTime(duration)}`;
        }
    }

    /**
     * プログレスバーを表示/非表示
     * @param {boolean} show
     */
    toggleProgress(show) {
        if (show) {
            this.showElement(this.elements.progressWrapper);
        } else {
            this.hideElement(this.elements.progressWrapper);
        }
    }

    /**
     * エラーメッセージを表示
     * @param {string} message
     */
    showError(message) {
        alert(message); // Phase 1ではシンプルにalert
    }

    /**
     * ドラッグ&ドロップのビジュアルフィードバック
     * @param {boolean} isDragging
     */
    setDragOverState(isDragging) {
        if (isDragging) {
            this.elements.uploadArea.classList.add('drag-over');
        } else {
            this.elements.uploadArea.classList.remove('drag-over');
        }
    }
}
