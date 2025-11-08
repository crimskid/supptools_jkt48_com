// ==UserScript==
// @name         JKT48 Form Saver & Auto Injector
// @namespace    avenari
// @version      2.1
// @description  Automatically inject saved form if page shows "Kesalahan"
// @match        https://jkt48.com/tickets/handshake/form/hid/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// ==/UserScript==

(function () {
  "use strict";

  const baseSelector = ".entry-contents__main-area";
  const sectionTitleSelector = ".section-title";
  const formSelector = ".entry-mypage";
  const saveKeyPrefix = "saved_entry_form_";
  const currentUrl = location.href.split("?")[0];
  const saveKey = saveKeyPrefix + currentUrl;
  const saveKeyArr = "saved_ArrEf_" + currentUrl;

  // Select all .form-group inside .entry-mypage__form==============================
  const formGroups = document.querySelectorAll(
    ".entry-mypage__form .form-group"
  );

  const emfArr = Array.from(formGroups).map((group, index) => {
    const label = group.querySelector("label");
    const select = group.querySelector("select");
    const soldOut = group.querySelector(".text-red");

    // Extract the session and member name from label if present
    const labelText = label
      ? label.textContent.trim().replace(/\s+/g, " ")
      : "";
    const member = label?.querySelector("a")?.textContent.trim() || null;

    return {
      id: index, // unique ID (based on select name), // position
      sesi_info: labelText, // e.g. "Sesi1 Jalur1 (16:30-17:30) Nayla Suji"
      member_name: member, // e.g. "Nayla Suji"
      select_name: select ? select.name : null, // e.g. "box_29871" or null if SOLD OUT
      is_sold_out: !!soldOut, // true if "SOLD OUT" text exists
    };
  });
  const cekSaveArrEmf = GM_getValue(saveKeyArr, null);
  if (!cekSaveArrEmf) {
    GM_setValue(saveKeyArr, emfArr);
  }
  //   console.log(emfArr);
  console.log("📋 Saved Array Data:", cekSaveArrEmf);
  // /.Select all .form-group inside .entry-mypage__form==============================

  //cek save data
  const cek_saveForm = GM_getValue(saveKey, null);
  console.log(cek_saveForm ? "✅ Form already saved" : "📭 No form saved yet");
  // this can add to auto saved form, below
  // console.log(cek_saveForm);

  // --- Helper Toast Message ---
  function showToast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    Object.assign(t.style, {
      position: "fixed",
      bottom: "15px",
      //   right: "15px",
      right: "300px",
      background: "#2222226d",
      color: "#fff",
      padding: "8px 14px",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 999999,
    });
    document.body.appendChild(t);
    setTimeout(() => (t.style.opacity = 0), 2200);
    setTimeout(() => t.remove(), 2500);
  }

  // --- Save Form ---
  function saveCurrentForm() {
    const area = document.querySelector(baseSelector);
    if (area) {
      const html = area.outerHTML;
      const cek_saveFormCa = GM_getValue(saveKey, null);
      if (cek_saveFormCa) {
        showToast("⚠️ Already saved form data!!");
        return;
      } else {
        GM_setValue(saveKey, html);
        showToast("✅ Form saved for this page");
      }
    } else {
      showToast("❌ Target form area not found");
    }
  }

  // --- Inject Saved Form ---
  function injectSavedForm(reason = "manual") {
    const savedHTML = GM_getValue(saveKey, null);
    const mainArea = document.querySelector(baseSelector);
    const sectionTitle = mainArea?.querySelector(sectionTitleSelector);
    const cekarea_form = mainArea.querySelector(formSelector);

    if (!savedHTML) {
      showToast("⚠️ No saved form data found");
      return;
    }
    // if (!mainArea || !sectionTitle) {
    //     showToast('❌ Target insertion area not found');
    //     return;
    // }
    if (!sectionTitle) {
      showToast("❌ Target insertion area not found");
      return;
    }

    if (cekarea_form) {
      //process if there's not mainArea
      showToast("❌ Target insertion Already there!");
      return;
    } else {
      // Create element for saved HTML
      const parser = new DOMParser();
      const savedDoc = parser.parseFromString(savedHTML, "text/html");
      const savedForm = savedDoc.querySelector(formSelector);

      if (savedForm) {
        // Remove existing "entry-news" (error block)
        //   const existingNews = mainArea.querySelector('.entry-news');
        //   if (existingNews) existingNews.remove();

        // Insert saved form after title
        sectionTitle.insertAdjacentElement("afterend", savedForm);
        showToast(
          reason === "auto"
            ? "📥 Injected saved form (page error detected)"
            : "📥 Form injected manually"
        );
      } else {
        showToast("⚠️ Saved form data invalid");
      }
    }
  }

  // --- Auto Inject if Kesalahan ---
  function autoInjectIfError() {
    const titleEl = document.querySelector(
      `${baseSelector} ${sectionTitleSelector}`
    );
    if (titleEl && titleEl.textContent.trim() === "Kesalahan") {
      injectSavedForm("auto");
    }
  }

  // --- Restore Missing Selects ---
  function restoreMissingSelects() {
    const savedArr = GM_getValue(saveKeyArr, []);

    if (!savedArr || !Array.isArray(savedArr) || savedArr.length === 0) {
      showToast("⚠️ No saved select array found!");
      return;
    }

    const currentGroups = document.querySelectorAll(
      ".entry-mypage__form .form-group"
    );
    let restoredCount = 0;

    currentGroups.forEach((group, i) => {
      const data = savedArr.find((x) => x.id === i);
      const hasSelect = group.querySelector("select");
      const isSoldOut = group.querySelector(".text-red"); // i need append under this guys

      //   updated element data label & input
      const updInp = group.querySelector("input");
      updInp.id = data.select_name;
      updInp.name = data.select_name;

      const updLbl = group.querySelector("label.lbl_box_inj");
      updLbl.textContent = "[Box name: " + data.select_name + "]";
      //   =============================================

      // Skip if sold out text exists (don't restore there) (from chatGpt)
      //   justru i need to restore there!!!
      //   if (isSoldOut) return;

      if (!hasSelect && data && data.select_name) {
        // Create new <select>
        const newSelect = document.createElement("select");
        newSelect.name = data.select_name;
        newSelect.style.border = "1px solid #ccc";
        // newSelect.style.padding = "4px";
        newSelect.className = "form-control";
        newSelect.innerHTML = `
            <option value="" label=""></option> 
            <option value="1" label="1">1</option> 
            <option value="2" label="2">2</option> 
            <option value="3" label="3">3</option> 
            <option value="4" label="4">4</option> 
            <option value="5" label="5">5</option>
        `;

        // Append select at end of group
        // group.appendChild(newSelect); // i needed it after text Sold Out
        // isSoldOut.insertAdjacentHTML("afterend", newSelect);
        isSoldOut.insertAdjacentElement("afterend", newSelect);
        restoredCount++;
        console.log(
          `✅ Restored missing <select> at index ${i}: ${data.select_name}`
        );
      }
    });

    if (restoredCount > 0) {
      showToast(`🧩 Restored ${restoredCount} missing <select> element(s)!`);
    } else {
      showToast("✅ No missing <select> elements detected.");
    }
  }

  // --- Auto Save form when still empty data ---
  if (!cek_saveForm) {
    showToast("✅ Auto Save form data!! ^^");
    saveCurrentForm();
  }
  // --------------------------------------------

  // --- Keyboard Shortcuts ---
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveCurrentForm();
    }
    if (e.ctrlKey && e.key === "i") {
      e.preventDefault();
      injectSavedForm("manual");
    }
    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      restoreMissingSelects();
    }
  });

  /** Floating control buttons (manual save/inject) */
  function createControlButtons() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "10px";
    container.style.right = "10px";
    container.style.zIndex = 99999;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Save Form";
    saveBtn.onclick = saveCurrentForm;

    const injectBtn = document.createElement("button");
    injectBtn.textContent = "📥 Inject Form";
    injectBtn.onclick = injectSavedForm;

    const restoreBtn = document.createElement("button");
    restoreBtn.textContent = "🔄 Restore Missing";
    restoreBtn.onclick = restoreMissingSelects;

    [saveBtn, injectBtn, restoreBtn].forEach((btn) => {
      btn.style.margin = "5px";
      btn.style.padding = "5px 10px";
      btn.style.background = "#2222226d";
      btn.style.color = "#fff";
      btn.style.border = "1px solid #555";
      btn.style.borderRadius = "5px";
      btn.style.cursor = "pointer";
    });

    container.appendChild(saveBtn);
    container.appendChild(injectBtn);
    container.appendChild(restoreBtn);
    document.body.appendChild(container);
  }

  // --- Initialize ---
  window.addEventListener("load", () => {
    createControlButtons();
    autoInjectIfError();
    console.log("🧩 JKT48 Form Saver + Injector + Restorer active");
  });

  // ------------------ Data Editor (insert into your userscript) ------------------

  // Call this to open the popup editor for GM storage
  function openDataEditor() {
    // keys to show in dropdown by default (your script keys)
    const defaultKeys = [saveKeyArr, saveKey];

    // Try to get all keys via GM_listValues if available
    const keysPromise =
      typeof GM_listValues === "function"
        ? Promise.resolve(GM_listValues().catch?.(() => defaultKeys))
        : Promise.resolve(defaultKeys);

    keysPromise.then((allKeys) => {
      // ensure the defaults are present and unique
      const keys = Array.from(new Set([...(allKeys || []), ...defaultKeys]));

      // create popup
      const popup = document.createElement("div");
      Object.assign(popup.style, {
        position: "fixed",
        top: "60px",
        // bottom: "60px",
        right: "20px",
        width: "420px",
        maxHeight: "70vh",
        overflow: "auto",
        zIndex: 999999,
        background: "#1f1f1f",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        padding: "12px",
        fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        fontSize: "13px",
      });

      popup.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>🧰 GM Data Editor</strong>
        <div>
          <button id="de_close" style="margin-left:8px">✖</button>
        </div>
      </div>

      <div style="margin-bottom:8px">
        <label style="display:block;margin-bottom:4px">Select Key</label>
        <select id="de_key" style="width:100%;padding:6px;border-radius:6px;background:#2b2b2b;color:#fff;border:1px solid #333"></select>
      </div>

      <div style="margin-bottom:8px">
        <label style="display:block;margin-bottom:4px">Value (JSON)</label>
        <textarea id="de_text" rows="12" style="width:100%;background:#2b2b2b;color:#fff;border:1px solid #333;border-radius:6px;padding:8px;white-space:pre-wrap"></textarea>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="de_load">🔃 Load</button>
        <button id="de_save">💾 Save</button>
        <button id="de_export">📤 Export</button>
        <button id="de_import">📥 Import</button>
        <button id="de_clear">🗑️ Delete Key</button>
      </div>

      <div style="margin-top:8px;color:#aaa;font-size:12px">
        Tip: make sure JSON is valid. Use Load before Save for safety.
      </div>
    `;

      document.body.appendChild(popup);

      const sel = popup.querySelector("#de_key");
      const ta = popup.querySelector("#de_text");
      const btnLoad = popup.querySelector("#de_load");
      const btnSave = popup.querySelector("#de_save");
      const btnExport = popup.querySelector("#de_export");
      const btnImport = popup.querySelector("#de_import");
      const btnClear = popup.querySelector("#de_clear");
      const btnClose = popup.querySelector("#de_close");

      // populate keys
      keys.forEach((k) => {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = k;
        sel.appendChild(opt);
      });

      // helper: show toast (reuse your showToast if available)
      const _showToast =
        typeof showToast === "function"
          ? showToast
          : (m) => {
              const t = document.createElement("div");
              t.textContent = m;
              Object.assign(t.style, {
                position: "fixed",
                bottom: "15px",
                right: "300px",
                background: "#222222b3",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                zIndex: 999999,
              });
              document.body.appendChild(t);
              setTimeout(() => t.remove(), 2200);
            };

      // load key value
      async function loadKey(k) {
        try {
          // GM_getValue may be sync; support both
          const v = GM_getValue(k, null);
          // pretty-print if possible
          ta.value =
            v === null || v === undefined ? "" : JSON.stringify(v, null, 2);
          _showToast("🔃 Loaded key: " + k);
        } catch (err) {
          ta.value = "";
          _showToast("❌ Failed load: " + String(err));
        }
      }

      // save textarea JSON to key
      async function saveKey(k) {
        try {
          const parsed = ta.value.trim() === "" ? null : JSON.parse(ta.value);
          GM_setValue(k, parsed);
          _showToast("💾 Saved key: " + k);
        } catch (err) {
          _showToast("❌ Invalid JSON: " + err.message);
        }
      }

      // export current text as file
      function exportText(k) {
        const blob = new Blob([ta.value], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${k || "gm_export"}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        _showToast("📤 Export started");
      }

      // import JSON from file (simple)
      btnImport.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = (ev) => {
          const f = ev.target.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            ta.value = r.result;
            _showToast("📥 File loaded into editor");
          };
          r.readAsText(f);
        };
        input.click();
      });

      // delete key (set to null)
      btnClear.addEventListener("click", async () => {
        const k = sel.value;
        if (!k) return _showToast("⚠️ No key selected");
        if (!confirm(`Delete key "${k}"? This will set it to null.`)) return;
        try {
          GM_setValue(k, null);
          ta.value = "";
          _showToast("🗑️ Cleared key: " + k);
        } catch (err) {
          _showToast("❌ Failed to clear: " + String(err));
        }
      });

      // wire buttons
      btnLoad.addEventListener("click", () => loadKey(sel.value));
      btnSave.addEventListener("click", () => saveKey(sel.value));
      btnExport.addEventListener("click", () => exportText(sel.value));
      btnClose.addEventListener("click", () => popup.remove());

      // auto-load currently selected key
      if (sel.value) loadKey(sel.value);

      // update textarea when selection changes
      sel.addEventListener("change", () => loadKey(sel.value));
    });
  }

  // Add a Data Editor button into your control panel
  // Update createControlButtons() to append this button into the container.
  // If you already append a restore button, add this alongside it:
  (function addDataEditorButtonToPanel() {
    try {
      // Try to find same panel created by your script (right-bottom container)
      const panel =
        document.querySelector(
          'body > div[style*="position: fixed"][style*="z-index: 99999"]'
        ) || null;
      // If panel not found, append to body in top-right
      //   console.log(panel);
      const container = panel || document.createElement("div");
      if (!panel) {
        Object.assign(container.style, {
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: 99999,
        });
        document.body.appendChild(container);
      }
      // create button
      const dataBtn = document.createElement("button");
      dataBtn.textContent = "📝 Data Editor";
      Object.assign(dataBtn.style, {
        position: "fixed",
        margin: "5px",
        bottom: "10px",
        padding: "5px 10px",
        background: "#222222b3",
        color: "#fff",
        border: "1px solid #555",
        borderRadius: "5px",
        cursor: "pointer",
      });
      dataBtn.onclick = openDataEditor;
      container.appendChild(dataBtn);
    } catch (err) {
      console.warn("Failed to attach Data Editor button:", err);
    }
  })();
})();
