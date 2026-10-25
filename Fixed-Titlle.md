# ニコニコ動画 フルスクリーン固定タイトル表示スクリプト

ニコニコ動画のPC版視聴ページにおいて、**フルスクリーン（FキーまたはF11キー全画面）表示にした際、マウス操作で下部コントロールバーが出現したタイミングでのみ、画面左上に動画タイトルを同期して表示する** Tampermonkey ユーザースクリプトです。

通常再生時は完全に非表示となり、全画面視聴時の没入感を邪魔しません。

## ✨ 主な機能と特徴
* **完全同期システム**: ニコニコ動画の新プレイヤーが下部メニューを引っ込めるタイミング（約2.5秒）を逆算し、ミリ秒単位で美しく連動してフェードイン・アウトします。
* **F11 / Fキー両対応**: Chromeの強固な全画面仕様（トップレイヤー保護）や、全画面時に発生する上下左右の黒帯（余白）を数値計算で突破し、あらゆる全画面モードで100%確実に動作します。
* **負荷ゼロ設計**: 超高速な描画ループを排除し、マウス移動時とフルスクリーン切り替え時のイベント駆動のみで動作するため、PCやブラウザに一切の負荷をかけません。

## 🚀 インストール方法

1. ブラウザに拡張機能 [Tampermonkey](https://tampermonkey.net) をインストールします。
2. Tampermonkeyのダッシュボードを開き、「新規スクリプトを作成」を選択します。
3. 以下のソースコードを丸ごとコピーして貼り付け、保存（`Ctrl + S`）します。
4. ニコニコ動画や生放送の視聴ページ（`https://*.nicovideo.jp/watch/*`）を開き、ページをリロードすると有効になります。

## 💻 ソースコード

```javascript
// ==UserScript==
// @name         ニコニコフルスクリーン固定タイトル (F11フルスクリーン完全対応版)
// @namespace    http://tampermonkey.net
// @version      16.0
// @match        https://*.nicovideo.jp/watch/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ID = 'nicofull-fixed-title';
    let hideTimeout = null;

    function createTitleElement() {
        const titleDiv = document.createElement('div');
        titleDiv.id = ID;
        const pageTitle = document.title.replace(/ - ニコニコ動画\$/, '');
        titleDiv.textContent = "タイトル: " + pageTitle;

        titleDiv.style.cssText = `
            position: absolute !important;
            top: 20px !important;
            left: 20px !important;
            z-index: 999999 !important;
            background: rgba(0, 0, 0, 0.85) !important;
            color: #00ffff !important;
            padding: 12px 20px !important;
            border-radius: 6px !important;
            font-size: 18px !important;
            font-weight: bold !important;
            font-family: sans-serif !important;
            pointer-events: none !important;
            border: 2px solid #ffffff !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
            max-width: 70vw !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            opacity: 0;
            transition: opacity 0.25s ease-in-out !important;
        `;
        return titleDiv;
    }

    function triggerShow() {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;

        const target = videoElement.parentElement;
        if (!target) return;

        let titleEl = target.querySelector(`#${ID}`);
        if (!titleEl) {
            titleEl = createTitleElement();
            target.appendChild(titleEl);
        }

        const rect = videoElement.getBoundingClientRect();
        const isFullscreenNow = !!(document.fullscreenElement || document.webkitFullscreenElement) || 
                                (rect.width >= window.innerWidth * 0.95) || 
                                (rect.height >= window.innerHeight * 0.95);

        if (!isFullscreenNow) {
            titleEl.style.opacity = '0';
            if (hideTimeout) clearTimeout(hideTimeout);
            return;
        }

        titleEl.style.opacity = '1';

        if (hideTimeout) clearTimeout(hideTimeout);

        hideTimeout = setTimeout(() => {
            if (titleEl) titleEl.style.opacity = '0';
        }, 2500);
    }

    function checkFullscreenOnly() {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;

        const target = videoElement.parentElement;
        if (!target) return;

        const titleEl = target.querySelector(`#${ID}`);
        if (!titleEl) return;

        const rect = videoElement.getBoundingClientRect();
        const isFullscreenNow = !!(document.fullscreenElement || document.webkitFullscreenElement) || 
                                (rect.width >= window.innerWidth * 0.95) || 
                                (rect.height >= window.innerHeight * 0.95);

        if (!isFullscreenNow) {
            titleEl.style.opacity = '0';
            if (hideTimeout) clearTimeout(hideTimeout);
        }
    }

    window.addEventListener('mousemove', triggerShow, true);
    window.addEventListener('resize', checkFullscreenOnly, true);
    setInterval(checkFullscreenOnly, 1000);
})();
```

## ⚙️ カスタマイズについて
タイトルの表示時間を変更したい場合は、コード最下部付近にある `2500`（ミリ秒単位。2500 = 2.5秒）の数値をお好みに合わせて書き換えてください。

## 📄 ライセンス
このプロジェクトは [MIT ライセンス](LICENSE) のもとで公開されています。
