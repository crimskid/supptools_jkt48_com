// ==UserScript==
// @name         VC/MnG/HS step [4] - Auto execute/comp Konfirmasi
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Submit Akhir, berbahaya
// @author       IceCrims
// @match        https://jkt48.com/tickets/handshake/comp/hid*
// @grant        none
// @updateURL    https://raw.github.com/crimskid/supptools_jkt48_com/VC_MnG_HS-step-4.meta.js
// @downloadURL  https://raw.github.com/crimskid/supptools_jkt48_com/VC_MnG_HS-step-4.user.js
// ==/UserScript==

(function () {
  "use strict";

  const ent_contents = document.querySelector(".entry-contents__main-area");
  console.log(ent_contents);

  let newUrl = "";

  const currentUrl = window.location.href;
  if (currentUrl.includes("/comp/")) {
    newUrl = currentUrl.replace("/comp/", "/form/");
    console.log("currentUrl: " + currentUrl);
    console.log("newUrl: " + newUrl);
    //window.location.href = newUrl;
  }

  // input.type = "text";
  // input.id = 2;

  const linkBack = document.createElement("a");
  linkBack.style.background = "rgba(62, 127, 247, 0.8)";
  linkBack.className = "form-control bg-yellow";

  const boldText = document.createElement("b");
  boldText.textContent = "Link back to: ";
  linkBack.appendChild(boldText);
  linkBack.append(": " + newUrl);

  linkBack.href = newUrl;
  // linkBack.placeholder = "Enter something...";
  // linkBack.value = 0;
  linkBack.style.margin = "5px 0 0 0";
  linkBack.target = "_blank";     // open in a new tab
  ent_contents.appendChild(linkBack);

})();
