// ==UserScript==
// @name         VC/MnG/HS step [3.5] - Auto Submit VC/MnG/HS for comp
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Submit form otomatis ketika tombol filter ditekan
// @match        https://jkt48.com/tickets/handshake/conf/hid*
// @grant        none
// @updateURL    https://raw.github.com/crimskid/supptools_jkt48_com/VC_MnG_HS-step-3-5.meta.js
// @downloadURL  https://raw.github.com/crimskid/supptools_jkt48_com/VC_MnG_HS-step-3-5.user.js
// ==/UserScript==

(function () {
  "use strict";
  const currentUrl = window.location.href;
  if (currentUrl.includes("/conf/")) {
    const newUrl = currentUrl.replace("/conf/", "/comp/");
    console.log("currentUrl: " + currentUrl);
    console.log("newUrl: " + newUrl);
    window.location.href = newUrl;
  }
})();
