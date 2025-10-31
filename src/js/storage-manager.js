/**
 * Storage Manager
 * LocalStorageの管理を担当
 */

class StorageManager {
    /**
     * 規約同意状態を取得
     * @returns {boolean}
     */
    static isTermsAgreed() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TERMS_AGREED) === 'true';
    }

    /**
     * 規約同意状態を保存
     */
    static setTermsAgreed() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TERMS_AGREED, 'true');
    }

    /**
     * 広告免除トークンを取得（Phase 3用）
     * @returns {string|null}
     */
    static getAdFreeToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AD_FREE_TOKEN);
    }

    /**
     * 広告免除トークンを保存（Phase 3用）
     * @param {string} token
     */
    static setAdFreeToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AD_FREE_TOKEN, token);
    }

    /**
     * 再生回数を取得（Phase 2用）
     * @returns {number}
     */
    static getPlayCount() {
        const count = localStorage.getItem(CONFIG.STORAGE_KEYS.PLAY_COUNT);
        return count ? parseInt(count, 10) : 0;
    }

    /**
     * 再生回数を増やす（Phase 2用）
     */
    static incrementPlayCount() {
        const count = this.getPlayCount();
        localStorage.setItem(CONFIG.STORAGE_KEYS.PLAY_COUNT, String(count + 1));
    }

    /**
     * すべてのデータをクリア
     */
    static clearAll() {
        localStorage.clear();
    }
}
