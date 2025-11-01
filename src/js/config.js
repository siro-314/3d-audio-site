/**
 * Configuration Constants
 * アプリケーション全体の設定値
 */

const CONFIG = {
    // エフェクトパラメータ（はやえもん準拠）
    EFFECT: {
        ECHO: {
            dryMix: 0.84,      // 原音
            wetMix: 0.12,      // 反響音
            feedback: 0.60,    // フィードバック
            delayTime: 0.05    // 遅延時間（秒）
        },
        REVERB: {
            dryMix: 0.95,      // 原音
            wetMix: 1.15,      // 残響音
            decay: 0.35,       // 減衰
            stereoWidth: 0.95, // ステレオ度合い
            // 部屋の広さは動的（スライダーで調整）
            defaultRoomSize: 0.8
        }
    },

    // ファイル対応形式（音声＋動画）
    SUPPORTED_FORMATS: [
        // 音声形式
        'audio/mpeg',      // MP3
        'audio/wav',       // WAV
        'audio/mp4',       // M4A
        'audio/x-m4a',     // M4A (alternative)
        'audio/aac',       // AAC
        'audio/ogg',       // OGG
        'audio/webm',      // WebM Audio
        'audio/flac',      // FLAC
        'audio/opus',      // Opus
        // 動画形式（音声トラックを抽出）
        'video/mp4',       // MP4
        'video/webm',      // WebM Video
        'video/quicktime', // MOV
        'video/x-msvideo', // AVI
        'video/x-matroska' // MKV
    ],

    // LocalStorage keys
    STORAGE_KEYS: {
        TERMS_AGREED: 'termsAgreed',
        AD_FREE_TOKEN: 'adFreeToken',  // Phase 3用
        PLAY_COUNT: 'playCount'         // Phase 2用
    },

    // Phase 2/3用（未実装）
    AD: {
        ENABLED: false,
        FREE_PLAYS: 1,
        AD_DURATION: 15
    },

    // UI表示設定
    UI: {
        SLIDER_MARKER_POSITION: 0.8
    }
};

// Freeze to prevent modifications
Object.freeze(CONFIG);
