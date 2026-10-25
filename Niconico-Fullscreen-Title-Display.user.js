// ==UserScript==
// @name         Niconico Fullscreen Title Display
// @namespace    http://tampermonkey.net
// @version      16.1
// @description  ニコニコ動画を全画面表示したとき、操作中に動画タイトルを表示します
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
        const pageTitle = document.title.replace(/ - ニコニコ動画$/, '');
        titleDiv.textContent = `タイトル: ${pageTitle}`;

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

    function isFullscreen(videoElement) {
        const rect = videoElement.getBoundingClientRect();
        return !!(document.fullscreenElement || document.webkitFullscreenElement) ||
               rect.width >= window.innerWidth * 0.95 ||
               rect.height >= window.innerHeight * 0.95;
    }

    function getTitleElement(videoElement, create = false) {
        const target = videoElement.parentElement;
        if (!target) return null;

        let titleEl = target.querySelector(`#${ID}`);
        if (!titleEl && create) {
            titleEl = createTitleElement();
            target.appendChild(titleEl);
        }
        return titleEl;
    }

    function hideTitle(titleEl) {
        if (titleEl) titleEl.style.opacity = '0';
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }

    function triggerShow() {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;

        const titleEl = getTitleElement(videoElement, true);
        if (!titleEl) return;

        if (!isFullscreen(videoElement)) {
            hideTitle(titleEl);
            return;
        }

        titleEl.style.opacity = '1';
        if (hideTimeout) clearTimeout(hideTimeout);

        hideTimeout = setTimeout(() => {
            titleEl.style.opacity = '0';
            hideTimeout = null;
        }, 2500);
    }

    function checkFullscreenOnly() {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;

        const titleEl = getTitleElement(videoElement);
        if (!titleEl) return;

        if (!isFullscreen(videoElement)) {
            hideTitle(titleEl);
        }
    }

    window.addEventListener('mousemove', triggerShow, true);
    window.addEventListener('resize', checkFullscreenOnly, true);
    setInterval(checkFullscreenOnly, 1000);
})();
