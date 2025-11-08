// ==UserScript==
// @name         VC/MnG/HS step [2] - Hide EL Except Selected
// @namespace    http://tampermonkey.net/
// @version      1.10
// @description  Hide all form-group elements except the one with Selected
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
            top: 150px !important;     /* jarak dari atas layar */
            right: 120px !important;   /* jarak dari kanan layar */
            width: 200px !important;   /* jangan full width */
            height: 100px !important;   /* jangan full width */
            display: inline-block !important;
            z-index: 99999 !important; /* biar selalu di atas */
        }
    `);

  const currentUrl = window.location.href;
  const savedNames = GM_getValue(
    "allowedNames",
    "Gracia, Fiony, Gresella, Grace"
  );
  let savedEnNames = GM_getValue("enFilNames", "true");
  savedEnNames = savedEnNames === "true" ? "checked" : "";

  const savedSession = GM_getValue("allowedSess", "Sesi1, Sesi2, Sesi6");
  let savedEnSess = GM_getValue("enFilSess", "true");
  savedEnSess = savedEnSess === "true" ? "checked" : "";

  // --- Create floating box ---
  const box = document.createElement("div");
  box.id = "filterBoxFloat";
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
    let enabled = document.querySelector("#filterEnable").checked;
    let enabledSs = document.querySelector("#filterEnableSs").checked;
    const namesText = document.querySelector("#allowedNames").value;
    const sessText = document.querySelector("#allowedSessions").value;
    const RecapSel = [];

    // Save current names to Tampermonkey storage
    GM_setValue("allowedNames", namesText);
    GM_setValue("enFilNames", enabled ? "true" : "false");
    GM_setValue("allowedSess", sessText);
    GM_setValue("enFilSess", enabledSs ? "true" : "false");

    const names = namesText
      .split(",")
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0);

    const sessions = sessText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    //cek for added link or for inject form ^^
    const cekEntrymy = document.querySelector(
      ".entry-mypage__form .form-group"
    );
    // console.log(cekEntrymy);
    if (!cekEntrymy) {
      const secTtl = document.querySelector(".entry-contents__main-area"); // button back link

      const linkcurr = document.createElement("a");
      linkcurr.style.background = "rgba(62, 127, 247)";
      linkcurr.className = "form-control";

      const boldTextCurr = document.createElement("b");
      boldTextCurr.textContent = "current Link";
      linkcurr.appendChild(boldTextCurr);
      linkcurr.append(": " + currentUrl);

      linkcurr.href = currentUrl;
      linkcurr.style.margin = "5px 0 0 0";
      secTtl.append(linkcurr);
      // /.button confirm link
    }
    // /.cek for added link or for inject form ^^

    document
      .querySelectorAll(".entry-mypage__form .form-group")
      .forEach((el) => {
        const link = el.querySelector("a");
        const label = el.querySelector("label");
        const select = el.querySelector("select");

        if (!enabled) {
          el.style.display = ""; // show everything if disabled
          return;
        }
        if (!link) {
          el.style.display = "none";
          return;
        }
        const nameText = link.textContent.trim().toLowerCase();
        //console.log(nameText);
        const labelText = label ? label.textContent.trim().toLowerCase() : "";
        // console.log(select ? select.id : "SO");
        //const isAllowed = names.includes(nameText);
        const isNameAllowed = names.some((part) => nameText.includes(part));
        const isSessionAllowed = sessions.some((s) => labelText.includes(s));
        //el.style.display = isAllowed ? "" : "none";

        const input = document.createElement("input");
        input.type = "text";
        input.style.background = "rgba(0, 0, 0, 0.3)";
        input.id = select ? select.id : "-";
        input.className = "form-control";
        input.name = select ? select.name : "-";
        if (!el.querySelector("input[name='" + input.name + "']")) {
          input.placeholder = "Enter something...";
          input.value = 0;
          input.style.margin = "1px 0 0 0";
          // el.appendChild(input);

          const labl = document.createElement("label");
          const boldTextlbl = document.createElement("b");
          boldTextlbl.textContent = "[Box name: " + input.name + "]";
          labl.style.margin = "5px 0 0 0";
          labl.appendChild(boldTextlbl);

          el.appendChild(labl);
          el.appendChild(input);
        }

        if (enabledSs) {
          if (isNameAllowed && isSessionAllowed) {
            el.style.display = ""; // show
          } else {
            el.style.display = "none"; // hide
          }
        } else {
          if (isNameAllowed) {
            el.style.display = ""; // show
            //el.html("TEst");
            //console.log(el);
          } else {
            el.style.display = "none"; // hide
          }
        }
      });
  }

  applyFilter();
  // --- Event listeners ---
  document.querySelector("#applyFilter").addEventListener("click", applyFilter);

  //cek url
  let confUrl = "";
  let compUrl = "";

  const fBf = document.querySelector("#filterBoxFloat");
  fBf.appendChild(document.createElement("br"));
  fBf.appendChild(document.createElement("br"));

  if (currentUrl.includes("/form/")) {
    confUrl = currentUrl.replace("/form/", "/conf/");
    compUrl = currentUrl.replace("/form/", "/comp/");

    console.log("currentUrl: " + currentUrl);
    console.log("confUrl: " + confUrl);
    console.log("compUrl: " + compUrl);
    //window.location.href = newUrl;

    // button confirm link
    const linkConf = document.createElement("a");
    linkConf.style.background = "rgba(62, 127, 247, 0.8)";
    linkConf.className = "form-control bg-yellow";

    const boldText = document.createElement("b");
    boldText.textContent = "Link Confirm";
    linkConf.appendChild(boldText);
    linkConf.append(": " + confUrl);

    linkConf.href = confUrl;
    linkConf.style.margin = "5px 0 0 0";
    linkConf.target = "_blank"; // open in a new tab
    fBf.appendChild(linkConf);
    // /.button confirm link

    fBf.appendChild(document.createElement("br"));

    // button complete link
    const linkComp = document.createElement("a");
    linkComp.style.background = "rgba(247, 62, 62, 0.8)";
    linkComp.className = "form-control bg-yellow";

    const boldText2 = document.createElement("b");
    boldText2.textContent = "Link Complete [bahaya]";
    linkComp.appendChild(boldText2);
    linkComp.append(": " + compUrl);

    linkComp.href = compUrl;
    linkComp.style.margin = "5px 0 0 0";
    linkComp.target = "_blank"; // open in a new tab
    fBf.appendChild(linkComp);
    // /.button complete link
  }
})();
