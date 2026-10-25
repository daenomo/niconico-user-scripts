// ==UserScript==
// @name         Niconico 1080p Gear Indicator
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  ニコニコ動画の実際の動画解像度が1080pのときに歯車アイコンに赤い点を表示する
// @match        https://www.nicovideo.jp/watch/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let currentVideo = null;

    function updateGearIndicator() {
        const video = document.querySelector('video');
        if (video !== currentVideo) {
            if (currentVideo) {
                currentVideo.removeEventListener('resize', updateGearIndicator);
                currentVideo.removeEventListener('loadedmetadata', updateGearIndicator);
            }
            currentVideo = video;
            if (currentVideo) {
                currentVideo.addEventListener('resize', updateGearIndicator);
                currentVideo.addEventListener('loadedmetadata', updateGearIndicator);
            }
        }

        // 1. 歯車アイコン（設定ボタン）を取得
        const gearButton = document.querySelector('button[aria-label="設定"]');
        if (!gearButton) return;

        let indicator = gearButton.querySelector('.gear-1080p-indicator');

        // 2. video要素の実際の内部解像度を取得して判定 (1080pは通常横1920以上または縦1080以上)
        const is1080p = video && (video.videoWidth >= 1920 || video.videoHeight >= 1080);

        if (is1080p) {
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'gear-1080p-indicator';
                // 歯車アイコンの右上付近に配置するスタイル
                indicator.style.position = 'absolute';
                indicator.style.top = '4px';
                indicator.style.right = '4px';
                indicator.style.width = '7px';
                indicator.style.height = '7px';
                indicator.style.backgroundColor = '#ff4444';
                indicator.style.borderRadius = '50%';
                indicator.style.pointerEvents = 'none';
                indicator.style.zIndex = '10';

                // 基準位置を確保するために親要素のpositionを設定
                const computedPosition = window.getComputedStyle(gearButton).position;
                if (computedPosition === 'static' || !computedPosition) {
                    gearButton.style.position = 'relative';
                }
                gearButton.appendChild(indicator);
            }
            indicator.style.display = 'block';
        } else {
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    let updateScheduled = false;
    function scheduleUpdate() {
        if (updateScheduled) return;
        updateScheduled = true;
        requestAnimationFrame(() => {
            updateScheduled = false;
            updateGearIndicator();
        });
    }

    const observer = new MutationObserver(() => {
        scheduleUpdate();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    updateGearIndicator();
})();
