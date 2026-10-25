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
