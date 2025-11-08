// ==UserScript==
// @name         JKT48 Form Saver & Auto Injector
// @namespace    avenari
// @version      2.0
// @description  Automatically inject saved form if page shows "Kesalahan"
// @match        https://jkt48.com/tickets/handshake/form/hid/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const baseSelector = '.entry-contents__main-area';
    const sectionTitleSelector = '.section-title';
    const formSelector = '.entry-mypage';
    const saveKeyPrefix = 'saved_entry_form_';
    const currentUrl = location.href.split('?')[0];
    const saveKey = saveKeyPrefix + currentUrl;

    //cek save data
    const cek_saveForm = GM_getValue(saveKey, null);
    console.log(cek_saveForm ? "Ada" : "masih kosong");
    // this can add to auto saved form, below
    // console.log(cek_saveForm);

    // --- Helper Toast Message ---
    function showToast(msg) {
        const t = document.createElement('div');
        t.textContent = msg;
        Object.assign(t.style, {
            position: 'fixed',
            bottom: '15px',
            right: '15px',
            background: '#222',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 999999,
        });
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    // --- Save Form ---
    function saveCurrentForm() {
        const area = document.querySelector(baseSelector);
        if (area) {
            const html = area.outerHTML;
            if (cek_saveForm) {
                showToast('⚠️ Already saved form data!!');
                return;
            }
            else {
                GM_setValue(saveKey, html);
                showToast('✅ Form saved for this page');
            }

        } else {
            showToast('❌ Target form area not found');
        }
    }

    // --- Inject Saved Form ---
    function injectSavedForm(reason = 'manual') {
        const savedHTML = GM_getValue(saveKey, null);
        const mainArea = document.querySelector(baseSelector);
        const sectionTitle = mainArea?.querySelector(sectionTitleSelector);
        const cekarea_form = mainArea.querySelector(formSelector);
        

        if (!savedHTML) {
            showToast('⚠️ No saved form data found');
            return;
        }
        // if (!mainArea || !sectionTitle) {
        //     showToast('❌ Target insertion area not found');
        //     return;
        // }
        if (!sectionTitle) {
            showToast('❌ Target insertion area not found');
            return;
        }

        if (cekarea_form) { //process if there's not mainArea
            showToast('❌ Target insertion Already there!');
            return;
        } else {
            // Create element for saved HTML
            const parser = new DOMParser();
            const savedDoc = parser.parseFromString(savedHTML, 'text/html');
            const savedForm = savedDoc.querySelector(formSelector);

            if (savedForm) {
                // Remove existing "entry-news" (error block)
                //   const existingNews = mainArea.querySelector('.entry-news');
                //   if (existingNews) existingNews.remove();

                // Insert saved form after title
                sectionTitle.insertAdjacentElement('afterend', savedForm);
                showToast(reason === 'auto'
                    ? '📥 Injected saved form (page error detected)'
                    : '📥 Form injected manually');
            } else {
                showToast('⚠️ Saved form data invalid');
            }
        }
    }

    // --- Auto Inject if Kesalahan ---
    function autoInjectIfError() {
        const titleEl = document.querySelector(`${baseSelector} ${sectionTitleSelector}`);
        if (titleEl && titleEl.textContent.trim() === 'Kesalahan') {
            injectSavedForm('auto');
        }
    }

    // --- Auto Save form when still empty data ---
    if (!cek_saveForm) {
        showToast('✅ Auto Save form data!! ^^');
        saveCurrentForm();
    }
    // --------------------------------------------

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCurrentForm();
        }
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            injectSavedForm('manual');
        }
    });

    /** Floating control buttons (manual save/inject) */
    function createControlButtons() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.right = '10px';
        container.style.zIndex = 99999;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Save Form';
        saveBtn.onclick = saveCurrentForm;

        const injectBtn = document.createElement('button');
        injectBtn.textContent = '📥 Inject Form';
        injectBtn.onclick = injectSavedForm;

        [saveBtn, injectBtn].forEach(btn => {
            btn.style.margin = '5px';
            btn.style.padding = '5px 10px';
            btn.style.background = '#222';
            btn.style.color = '#fff';
            btn.style.border = '1px solid #555';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
        });

        container.appendChild(saveBtn);
        container.appendChild(injectBtn);
        document.body.appendChild(container);
    }

    // --- Initialize ---
    window.addEventListener('load', () => {
        createControlButtons();
        autoInjectIfError();
        console.log('🧩 JKT48 Form Saver & Auto Injector active');
    });
})();
