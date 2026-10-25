// ==UserScript==
// @name         NicoVideo Theater Mode Toggle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  ニコニコの動画ページにシアターモードを追加（Tで切り替える）
// @author       daenomo
// @match        https://www.nicovideo.jp/watch/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const originalStyles = new Map();
    const seekBarHandlers = new Map();
    let expanded = false;

    function rememberStyle(el, property) {
        let snapshot = originalStyles.get(el);
        if (!snapshot) {
            snapshot = {
                hadStyleAttribute: el.hasAttribute('style'),
                properties: new Map()
            };
            originalStyles.set(el, snapshot);
        }

        if (!snapshot.properties.has(property)) {
            snapshot.properties.set(property, {
                value: el.style.getPropertyValue(property),
                priority: el.style.getPropertyPriority(property)
            });
        }
    }

    function setStyles(el, properties) {
        Object.entries(properties).forEach(([property, value]) => {
            rememberStyle(el, property);
            el.style.setProperty(property, value, 'important');
        });
    }

    function restoreStyles() {
        originalStyles.forEach((snapshot, el) => {
            snapshot.properties.forEach(({ value, priority }, property) => {
                if (value) el.style.setProperty(property, value, priority);
                else el.style.removeProperty(property);
            });

            if (!snapshot.hadStyleAttribute && !el.getAttribute('style')) {
                el.removeAttribute('style');
            }
        });
        originalStyles.clear();
    }

    function setSeekBarHandlers(seekBar) {
        const show = () => seekBar.style.setProperty('opacity', '1', 'important');
        const hide = () => seekBar.style.setProperty('opacity', '0', 'important');
        seekBar.addEventListener('mouseenter', show);
        seekBar.addEventListener('mouseleave', hide);
        seekBarHandlers.set(seekBar, { show, hide });
    }

    function removeSeekBarHandlers() {
        seekBarHandlers.forEach(({ show, hide }, seekBar) => {
            seekBar.removeEventListener('mouseenter', show);
            seekBar.removeEventListener('mouseleave', hide);
        });
        seekBarHandlers.clear();
    }

    function toggle() {
        const video = document.querySelector('video');
        if (!video) return;

        if (!expanded) {
            // --- 拡大処理 ---
            setStyles(document.documentElement, { 'overflow-x': 'hidden' });
            setStyles(document.body, { 'overflow-x': 'hidden' });

            let curr = video;
            while (curr && curr !== document.body) {
                setStyles(curr, {
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
                setStyles(sb, {
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

                setSeekBarHandlers(sb);

                sb.querySelectorAll('*').forEach(child => {
                    setStyles(child, { 'pointer-events': 'auto' });
                });
            });

            expanded = true;
            console.log("Nico Theater: Expanded");
        } else {
            // --- 復元処理 ---
            removeSeekBarHandlers();
            restoreStyles();
            expanded = false;
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
