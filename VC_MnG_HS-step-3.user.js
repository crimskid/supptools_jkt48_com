// ==UserScript==
// @name         VC/MnG/HS step [3] - Auto Submit VC/MnG/HS Konfirmasi
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Submit form otomatis ketika tombol filter ditekan
// @author       IceCrims
// @match        https://jkt48.com/tickets/handshake/address/hid*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/VC_MnG_HS-step-3.meta.js
// @downloadURL  https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/VC_MnG_HS-step-3.user.js
// ==/UserScript==

(function () {
  "use strict";

  function autoClick() {
    const checkbox = document.querySelector("#agree");
    if (checkbox) {
      checkbox.checked = true;
    }
    // cari tombol submit berdasarkan teks dan class
    const button = [
      ...document.querySelectorAll("button.btn.btn-block.btn-pink"),
    ].find((b) => b.textContent.trim() === "Konfirmasi");

    if (button) {
      button.click(); // klik otomatis
      //console.log("Tombol Konfirmasi sudah diklik otomatis");
    } else {
      //console.log("Tombol Konfirmasi tidak ditemukan");
    }
  }

  // Run once
  autoClick();

  // Keep watching for dynamically added posts
  const observer = new MutationObserver(autoClick);
  observer.observe(document.body, { childList: true, subtree: true });
})();
