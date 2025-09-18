// ==UserScript==
// @name         2SHots step [3] - Auto Submit 2shot Konfirmasi
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Submit form otomatis ketika tombol filter ditekan
// @author       IceCrims
// @match        https://jkt48.com/tickets/twoshot/address/hid*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/2S-step-3.meta.js
// @downloadURL  https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/2S-step-3.user.js
// ==/UserScript==

(function () {
  "use strict";

  function autoClick() {
    const posts = document.querySelectorAll(".entry-mypage form");
    posts.forEach((post, index) => {
      const button = post.querySelector("button");

      if (button) {
        // Option 1: simulate a user click
        button.click();
      }
    });
  }

  // Run once
  autoClick();

  // Keep watching for dynamically added posts
  const observer = new MutationObserver(autoClick);
  observer.observe(document.body, { childList: true, subtree: true });
})();
