// ==UserScript==
// @name         NicoVideo Theater Mode Toggle
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  ニコニコの動画ページにシアターモードを追加（Tで切り替える）
// @author       daenomo
// @match        https://www.nicovideo.jp/watch/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.__nicoFinalToggle = window.__nicoFinalToggle || {
        expanded: false,
        backups: new Map()
    };

    function set(el, props) {
        if (!el) return;
        if (!window.__nicoFinalToggle.backups.has(el)) {
            window.__nicoFinalToggle.backups.set(el, el.getAttribute('style') || "NONE");
        }
        Object.entries(props).forEach(([k, v]) => el.style.setProperty(k, v, 'important'));
    }

    function toggle() {
        const video = document.querySelector('video');
        if (!video) return;

        if (!window.__nicoFinalToggle.expanded) {
            // --- 拡大処理 ---
            document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
            document.body.style.setProperty('overflow-x', 'hidden', 'important');

            let curr = video;
            while (curr && curr !== document.body) {
                set(curr, {
                    'width': '100%',
                    'max-width': '100vw',
                    'height': 'auto',
                    'position': 'relative',
                    'left': '0',
                    'top': '0',
                    'transform': 'none',
                    'display': 'block',
                    'overflow': 'visible',
                    'container-type': 'normal',
                    'z-index': '0',
                    'margin': '0',
                    'padding': '0'
                });
                curr = curr.parentElement;
            }

            // シークバー (floating領域) の修正
            const seekBars = document.querySelectorAll('[class*="SeekBar"], [data-styling-area="floating"]');
            seekBars.forEach(sb => {
                set(sb, {
                    'position': 'absolute',
                    'bottom': '0',
                    'top': 'auto',
                    'left': '0',
                    'width': '100%',
                    'box-sizing': 'border-box',
                    'z-index': '2147483647',
                    'pointer-events': 'auto',
                    'display': 'block',
                    'visibility': 'visible',
                    'opacity': '0', // 非表示のイベントリスナー制御用
                    'transform': 'none'
                });

                // マウスイベントによる表示制御のみを追加
                sb.onmouseenter = () => sb.style.setProperty('opacity', '1', 'important');
                sb.onmouseleave = () => sb.style.setProperty('opacity', '0', 'important');

                sb.querySelectorAll('*').forEach(child => {
                    child.style.setProperty('pointer-events', 'auto', 'important');
                });
            });

            window.__nicoFinalToggle.expanded = true;
            console.log("Nico Theater: Expanded");
        } else {
            // --- 復元処理 ---
            const seekBars = document.querySelectorAll('[class*="SeekBar"], [data-styling-area="floating"]');
            seekBars.forEach(sb => {
                sb.onmouseenter = null;
                sb.onmouseleave = null;
            });

            window.__nicoFinalToggle.backups.forEach((style, el) => {
                if (style === "NONE") el.removeAttribute('style');
                else el.setAttribute('style', style);
            });
            window.__nicoFinalToggle.backups.clear();
            document.documentElement.style.overflowX = '';
            document.body.style.overflowX = '';
            window.__nicoFinalToggle.expanded = false;
            console.log("Nico Theater: Restored");
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.key.toLowerCase() === 't') {
            e.preventDefault();
            e.stopPropagation();
            toggle();
        }
    }, true);

    console.log("NicoVideo Theater Mode Script Loaded. Press 'T' to toggle.");
})();
