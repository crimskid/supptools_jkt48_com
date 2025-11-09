// ==UserScript==
// @name         Loket Auto Fill (Ikhwanur Rahman)
// @namespace    https://avenari.ai
// @version      2.0
// @description  Auto fill Loket form fields and select QR/QRIS payment automatically
// @match        https://*.loket.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  const presetData = {
    nama: "Ikhwanur Rahman",
    email: "ikhwanur.rahman@gmail.com",
    hp: "085251198383",
    identitas: "6305040109890001", // <-- Ganti sesuai KTP/passport
    lahir: "1989-09-01", // <-- Format YYYY-MM-DD
    kelamin: "Laki-laki", // atau "Perempuan"
    domisili: "Banjarbaru",
  };

  // Fill inputs by matching placeholder, name, or aria-label
  function fillByKeyword(keywords, value) {
    const inputs = document.querySelectorAll("input, textarea, select");
    for (const input of inputs) {
      const attrs = [
        input.name?.toLowerCase() || "",
        input.placeholder?.toLowerCase() || "",
        input.getAttribute("aria-label")?.toLowerCase() || "",
      ];
      if (keywords.some((kw) => attrs.some((a) => a.includes(kw)))) {
        if (input.type === "checkbox" || input.type === "radio") continue;
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  // Select radio or dropdown options by visible text
  function selectByText(keyword) {
    // Try selects first
    const selects = document.querySelectorAll("select");
    for (const select of selects) {
      for (const opt of select.options) {
        if (opt.textContent.toLowerCase().includes(keyword.toLowerCase())) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
      }
    }

    // Then try clickable text/radio
    const all = Array.from(
      document.querySelectorAll("input[type=radio], label, span, div")
    );
    const match = all.find((el) =>
      el.textContent.toLowerCase().includes(keyword.toLowerCase())
    );
    if (match) match.click();
  }

  // Check any checkbox that matches keyword text
  function checkBoxByKeyword(keyword) {
    const boxes = document.querySelectorAll("label, span, div");
    for (const el of boxes) {
      if (el.textContent.toLowerCase().includes(keyword.toLowerCase())) {
        const input = el.querySelector("input[type=checkbox]");
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
  }

  function fillForm() {
    fillByKeyword(["nama"], presetData.nama);
    fillByKeyword(["email"], presetData.email);
    fillByKeyword(["handphone", "hp", "telepon"], presetData.hp);
    fillByKeyword(["identitas", "ktp", "passport"], presetData.identitas);
    fillByKeyword(["lahir", "tanggal"], presetData.lahir);
    fillByKeyword(["domisili", "kota"], presetData.domisili);
    selectByText(presetData.kelamin);
    selectByText("QR");
    checkBoxByKeyword("syarat");
    checkBoxByKeyword("kebijakan");
  }

  // Floating control buttons
  function createControlButtons() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "10px";
    container.style.right = "10px";
    container.style.zIndex = 99999;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "6px";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Save Info";
    saveBtn.onclick = () => {
      GM_setValue("loketData", presetData);
      alert("Data telah disimpan!");
    };

    const fillBtn = document.createElement("button");
    fillBtn.textContent = "⚙️ Auto Fill";
    fillBtn.onclick = fillForm;

    [saveBtn, fillBtn].forEach((btn) => {
      btn.style.padding = "6px 12px";
      btn.style.background = "#222";
      btn.style.color = "#fff";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "13px";
    });

    container.appendChild(saveBtn);
    container.appendChild(fillBtn);
    document.body.appendChild(container);
  }

  // Run when DOM is ready
  function onReady(callback) {
    if (document.readyState !== "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
  }

  onReady(() => {
    setTimeout(createControlButtons, 1500);
  });
})();
