// ==UserScript==
// @name         JKT48 New UI Filter (PORTED|stable) v2
// @namespace    avenari.dev
// @version      2.0
// @description  Ported filter from old script to new Vue UI
// @match        https://jkt48.com/purchase*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.github.com/crimskid/supptools_jkt48_com/VC_MnG_HS_new2026-step-1.meta.js
// @downloadURL  https://raw.github.com/crimskid/supptools_jkt48_com/VC_MnG_HS_new2026-step-1.user.js
// ==/UserScript==

(function () {
  "use strict";

  const BOX_ID = "filterBoxFloat";

  // =========================
  // CREATE BOX
  // =========================
  function createBox() {
    if (document.getElementById(BOX_ID)) return;

    const savedNames = GM_getValue(
      "allowedNames",
      "Gracia, Fiony, Gresella, Grace, Adeline, Oline, Hillary, Abigail",
    );
    const savedEnNames =
      GM_getValue("enFilNames", "true") === "true" ? "checked" : "";

    const savedSession = GM_getValue("allowedSess", "Sesi1, Sesi2, Sesi6");
    const savedEnSess =
      GM_getValue("enFilSess", "true") === "true" ? "checked" : "";

    const box = document.createElement("div");
    box.id = BOX_ID;

    box.innerHTML = `
      <div><strong>Filter Members</strong></div>

      <label>
        <input type="checkbox" id="filterEnable" ${savedEnNames}>
        Enable Hide
      </label><br>

      <textarea id="allowedNames">${savedNames}</textarea>

      <label>
        <input type="checkbox" id="filterEnableSs" ${savedEnSess}>
        Enable Hide Sesi
      </label><br>

      <textarea id="allowedSessions">${savedSession}</textarea>

      <button id="applyFilter">Filter</button>
    `;

    document.body.appendChild(box);

    // =========================
    // STYLE (UPDATED COLORS)
    // =========================
    GM_addStyle(`
      #${BOX_ID} {
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        padding: 10px;
        border-radius: 8px;
        z-index: 99999;
        font-size: 14px;
        width: 220px;
      }

      #${BOX_ID} textarea {
        width: 100%;
        height: 60px;
        margin-top: 5px;
        background: #000;
        color: #fff;
        border: 1px solid #555;
      }

      #${BOX_ID} button {
        margin-top: 5px;
        width: 100%;
        background: orange;
        font-weight: bold;
        color: white;
      }
      .overflow-x-auto {
        overflow-x: visible !important;
    }
    `);

    document.getElementById("applyFilter").onclick = () => applyFilter();

    console.log("[Avenari] Box Ready");
  }

  // =========================
  // PARSE INPUT (YOUR STYLE)
  // =========================
  function parseList(text) {
    return text
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  // =========================
  // EXTRACT FROM NEW UI
  // =========================
  function extractData(el) {
    const nameEl = el.querySelector(".text-sm");
    const name = nameEl ? nameEl.textContent.trim().toLowerCase() : "";

    const fullText = el.innerText.toLowerCase();

    return { name, fullText };
  }

  // =========================
  // APPLY FILTER (PORTED EXACT STYLE)
  // =========================
  function applyFilter() {
    const enabled = document.getElementById("filterEnable").checked;

    const namesText = document.getElementById("allowedNames").value;

    // SAVE (unchanged)
    GM_setValue("allowedNames", namesText);
    GM_setValue("enFilNames", enabled ? "true" : "false");

    const keywords = namesText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    document
      .querySelectorAll("div.max-w-\\[150px\\].group\\/session")
      .forEach((session) => {
        let hasVisible = false;

        session.querySelectorAll("div.py-2.border-b").forEach((item) => {
          const nameEl = item.querySelector("p.font-bold");
          if (!nameEl) return;

          const name = nameEl.innerText.trim();
          // console.log("nameEl:" + name);

          const isMatch = !enabled || keywords.some((k) => name.includes(k));

          item.style.display = isMatch ? "" : "none";

          if (isMatch) hasVisible = true;
        });

        // 🔥 IMPORTANT: hide session ONLY if no child visible
        session.style.display = hasVisible ? "" : "none";
      });

    console.log("[Avenari] Filter applied Scheduled (CORRECT LEVEL)");

    document
      .querySelectorAll("div[data-v-5e83bc41].py-4")
      .forEach((session) => {
        let hasVisible2 = false;
        //console.log("Checking session:", hasVisible2);

        session.querySelectorAll('div.w-full').forEach((item) => {
          const nameEl2 = item.querySelector(".font-bold");

          if (!nameEl2) return;

          const name = nameEl2.innerText.trim();
          //console.log("nameEl2:" + name);

          const isMatch = !enabled || keywords.some((k) => name.includes(k));

          item.style.display = isMatch ? "" : "none";

          if (isMatch) hasVisible2 = true;
        });

        // 🔥 IMPORTANT: hide session ONLY if no child visible
        session.style.display = hasVisible2 ? "" : "none";
      });

    console.log("[Avenari] Filter applied on Buy (CORRECT LEVEL)");
  }

  // =========================
  // OBSERVER (FOR VUE)
  // =========================
  function observe() {
    const obs = new MutationObserver(() => {
      applyFilter();
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // =========================
  // INIT
  // =========================
  function init() {
    const wait = setInterval(() => {
      if (document.body) {
        clearInterval(wait);
        createBox();
        applyFilter();
        observe();
      }
    }, 100);
  }

  init();
})();
