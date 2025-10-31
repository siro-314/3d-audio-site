# 立体音響byフクロウ

ブラウザ上で音源に立体音響エフェクト（エコー＋リバーブ）を適用できるWebアプリケーション

## 特徴

- **完全ブラウザ完結**: サーバーに音源をアップロードせず、ブラウザ内で処理
- **はやえもん準拠**: 人気アプリ「はやえもん」のエフェクト設定を再現
- **シンプルUI**: 使わない機能は表示しない段階的UI
- **対応形式**: MP3, WAV, M4A, OGG, WebM, FLAC

## 技術スタック

- **フロントエンド**: HTML/CSS/JavaScript (Vanilla JS)
- **音声処理**: Web Audio API
- **ホスティング**: Netlify
- **データベース**: Netlify Blob Store (Phase 3実装予定)

## プロジェクト構成

```
3d-audio-site/
├── index.html              # メインHTML
├── netlify.toml           # Netlify設定
├── README.md
└── src/
    ├── css/
    │   └── main.css       # スタイルシート
    └── js/
        ├── config.js              # 設定定数
        ├── storage-manager.js     # LocalStorage管理
        ├── audio-processor.js     # 音声処理エンジン
        ├── ui-manager.js          # UI制御
        ├── state-manager.js       # 状態管理
        └── main.js                # アプリケーションエントリー
```

## エフェクトパラメータ

### エコー
- 原音: 0.84
- 反響音: 0.12
- フィードバック: 0.60
- 遅延時間: 0.05秒

### リバーブ
- 原音: 0.95
- 残響音: 1.15
- 部屋の広さ: 0.0〜1.0 (デフォルト: 0.8、スライダーで調整可能)
- 減衰: 0.35
- ステレオ度合い: 0.95

## デプロイ方法

### Netlifyでのデプロイ

1. Netlifyにログイン
2. 「Add new site」→「Import an existing project」
3. GitHubリポジトリを接続（または手動アップロード）
4. Build settingsはデフォルトのまま
5. Deploy

または、Netlify CLIを使用:

```bash
npm install -g netlify-cli
cd 3d-audio-site
netlify deploy --prod
```

## ローカル開発

任意のHTTPサーバーで起動:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# VS Code Live Server拡張機能
```

ブラウザで `http://localhost:8000` を開く

## 開発フェーズ

### Phase 1 (現在) ✅
- 基本機能実装
- 広告なし
- 無料利用

### Phase 2 (予定)
- Google AdSense実装
- 1曲目無料、2曲目以降広告表示
- ダウンロード時広告

### Phase 3 (予定)
- 課金システム（Patreon連携）
- 4桁パスワードで広告スキップ
- Netlify Blob Storeで認証管理

## ライセンス

MIT License

## 作者

フクロウ（YouTube立体音響チャンネル運営）
