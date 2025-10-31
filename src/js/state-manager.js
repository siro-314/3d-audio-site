/**
 * State Manager
 * アプリケーション全体の状態管理
 */

class StateManager {
    constructor() {
        this.currentFile = null;
        this.currentFileName = '';
        this.isProcessing = false;
        this.isProcessed = false;
    }

    /**
     * ファイルをセット
     * @param {File} file
     */
    setFile(file) {
        this.currentFile = file;
        this.currentFileName = file.name;
        this.isProcessed = false;
    }

    /**
     * 処理中状態をセット
     * @param {boolean} isProcessing
     */
    setProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    /**
     * 処理完了状態をセット
     */
    setProcessed() {
        this.isProcessed = true;
        this.isProcessing = false;
    }

    /**
     * 状態をリセット
     */
    reset() {
        this.currentFile = null;
        this.currentFileName = '';
        this.isProcessed = false;
        this.isProcessing = false;
    }

    /**
     * ファイルが選択されているか
     * @returns {boolean}
     */
    hasFile() {
        return this.currentFile !== null;
    }
}
