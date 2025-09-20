// ==UserScript==
// @name         VC/MnG/HS step [2] - Hide EL Except Selected
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Hide all form-group elements except the one with Celline Thefani
// @author       IceCrims
// @match        https://jkt48.com/tickets/handshake/form/hid/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/VC_MnG_HS-step-2.meta.js
// @downloadURL  https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/VC_MnG_HS-step-2.user.js
// ==/UserScript==

(function () {
  "use strict";

  //floating kirim button
  // Tambahkan CSS untuk tombol Kirim
  GM_addStyle(`
        .entry-mypage form .btn.btn-block.btn-pink {
            position: fixed !important;
            top: 220px !important;     /* jarak dari atas layar */
            right: 120px !important;   /* jarak dari kanan layar */
            width: 200px !important;   /* jangan full width */
            height: 100px !important;   /* jangan full width */
            display: inline-block !important;
            z-index: 99999 !important; /* biar selalu di atas */
        }
    `);

  const savedNames = GM_getValue(
    "allowedNames",
    "Gracia, Fiony, Gresella, Grace"
  );
  const savedEnNames = GM_getValue("enFilNames", "checked");
  const savedSession = GM_getValue("allowedSess", "Sesi1, Sesi2, Sesi6");
  const savedEnSess = GM_getValue("enFilSess", "checked");

  // --- Create floating box ---
  const box = document.createElement("div");
  box.style.position = "fixed";
  box.style.top = "10px";
  //box.style.right = "10px";
  box.style.left = "10px";
  box.style.background = "rgba(0,0,0,0.8)";
  box.style.color = "#fff";
  box.style.padding = "10px";
  box.style.borderRadius = "8px";
  box.style.zIndex = "9999";
  box.style.fontSize = "14px";
  box.style.width = "220px";

  box.innerHTML = `
        <div><strong>Filter Members</strong></div>
        <label><input type="checkbox" id="filterEnable" ${savedEnNames}> Enable Hide</label><br>
        <textarea id="allowedNames" style="width:100%; height:60px; margin-top:5px;">${savedNames}</textarea>
        <br>
        <label><input type="checkbox" id="filterEnableSs" ${savedEnSess}> Enable Hide Sesi</label><br>
        <textarea id="allowedSessions" style="width:100%; height:40px; margin-top:5px;">${savedSession}</textarea>
        <button id="applyFilter" style="margin-top:5px; width:100%; background:orange; font-weight:bold; color:white;">Filter</button>
    `;

  document.body.appendChild(box);

  // --- Filtering function ---
  function applyFilter() {
    const enabled = document.querySelector("#filterEnable").checked;
    const enabledSs = document.querySelector("#filterEnableSs").checked;
    const namesText = document.querySelector("#allowedNames").value;
    const sessText = document.querySelector("#allowedSessions").value;

    // Save current names to Tampermonkey storage
    GM_setValue("allowedNames", namesText);
    GM_setValue("enFilNames", enabled);
    GM_setValue("allowedSess", enabledSs);
    GM_setValue("enFilSess", sessText);

    const names = namesText
      .split(",")
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0);

    const sessions = sessText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    document
      .querySelectorAll(".entry-mypage__form .form-group")
      .forEach((el) => {
        const link = el.querySelector("a");
        const label = el.querySelector("label");
        if (!enabled) {
          el.style.display = ""; // show everything if disabled
          return;
        }
        if (!link) {
          el.style.display = "none";
          return;
        }
        const nameText = link.textContent.trim().toLowerCase();
        const labelText = label ? label.textContent.trim().toLowerCase() : "";
        //const isAllowed = names.includes(nameText);
        const isNameAllowed = names.some((part) => nameText.includes(part));
        const isSessionAllowed = sessions.some((s) => labelText.includes(s));
        //el.style.display = isAllowed ? "" : "none";

        if (enabledSs) {
          if (isNameAllowed && isSessionAllowed) {
            el.style.display = ""; // show
          } else {
            el.style.display = "none"; // hide
          }
        } else {
          if (isNameAllowed) {
            el.style.display = ""; // show
          } else {
            el.style.display = "none"; // hide
          }
        }
      });
  }

  applyFilter();
  // --- Event listeners ---
  document.querySelector("#applyFilter").addEventListener("click", applyFilter);
})();
