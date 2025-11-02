/**
 * tabs.js - タブ切り替え機能
 * 
 * 責務：
 * - タブボタンのクリックイベント処理
 * - タブコンテンツの表示/非表示切り替え
 */

(function() {
    'use strict';

    // DOM要素の取得
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    /**
     * タブを切り替える
     * @param {string} tabId - 表示するタブのID（例: 'tool', 'about'）
     */
    function switchTab(tabId) {
        // すべてのタブボタンとコンテンツから active クラスを削除
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 指定されたタブをアクティブ化
        const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`${tabId}-tab`);

        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
        }
    }

    /**
     * 初期化処理
     */
    function init() {
        // 各タブボタンにクリックイベントを設定
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // デフォルトで「ツール」タブを表示
        switchTab('tool');
    }

    // DOM読み込み完了後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
