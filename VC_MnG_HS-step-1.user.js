// ==UserScript==
// @name         VC/MnG/HS step [1] - Hide El & SUbmit
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  VC/MnG/HS - Hide El & SUbmit
// @author       You
// @match        https://jkt48.com/tickets/handshake?*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/VC_MnG_HS-step-1.meta.js
// @downloadURL  https://raw.githubusercontent.com/crimskid/supptools_jkt48_com/main/VC_MnG_HS-step-1.user.js
// ==/UserScript==

(function () {
  "use strict";

  function hidePosts() {
    const posts = document.querySelectorAll(".entry-news__detail .post");
    posts.forEach((post, index) => {
      const isLast = index === posts.length - 1;
      const hasLink = post.querySelector("a") !== null;
      const link = post.querySelector("a");

      if (!isLast && !hasLink) {
        post.style.display = "none";
      } else {
        post.style.display = ""; // keep visible

        // if post has <a>, auto-click it
        if (link) {
          // Option 1: simulate a user click
          link.click();

          // Option 2: redirect directly
          // window.location.href = link.href;
        }
      }
    });
  }

  // Run once
  hidePosts();

  // Keep watching for dynamically added posts
  const observer = new MutationObserver(hidePosts);
  observer.observe(document.body, { childList: true, subtree: true });
})();
