// ==UserScript==
// @name         Loket Auto Fill (Ikhwanur Rahman)
// @namespace    https://avenari.ai
// @version      3.0
// @description  Auto-fill Loket.com registration form and select QRIS + accept terms automatically
// @match        https://*.loket.com/*
// @grant        none
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

  function fillInputs() {
    // Fill by name
    const map = {
      firstname: data.nama,
      email: data.email,
      telephone: data.hp,
      identity_id: data.identitas,
    };
    for (const name in map) {
      const el = document.querySelector(`input[name="${name}"]`);
      if (el) {
        el.value = map[name];
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // --- Date Picker (Tanggal Lahir) ---
    const dateBtn = document.querySelector(
      'button[aria-haspopup="dialog"] span'
    );
    if (dateBtn && dateBtn.textContent.includes("Pilih Tanggal")) {
      dateBtn.textContent = data.lahir;
    }

    // --- Jenis Kelamin ---
    const gender =
      data.kelamin.toLowerCase() === "laki-laki"
        ? document.querySelector("button#gender-1")
        : document.querySelector("button#gender-2");
    if (gender) gender.click();

    // --- Domisili ---
    const domisiliInput = document.querySelector(
      'input[name="domicile"], input[id*="domicile"], input[placeholder*="Domisili"]'
    );
    if (domisiliInput) {
      domisiliInput.value = data.domisili;
      domisiliInput.dispatchEvent(new Event("input", { bubbles: true }));
      domisiliInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // --- Payment Method (QR / QRIS) ---
    const qrisBtn = document.querySelector('label[for="QRIS"] button#QRIS');
    if (qrisBtn) qrisBtn.click();

    // --- Check both policy boxes ---
    const terms = document.querySelector('button#terms[role="checkbox"]');
    const consent = document.querySelector('button#consent[role="checkbox"]');
    if (terms && terms.getAttribute("data-state") === "unchecked")
      terms.click();
    if (consent && consent.getAttribute("data-state") === "unchecked")
      consent.click();
  }

  // Create floating UI for manual trigger
  function createControlButtons() {
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      bottom: "10px",
      right: "10px",
      zIndex: "99999",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    });

    const btn = document.createElement("button");
    btn.textContent = "⚙️ Auto Fill Loket";
    Object.assign(btn.style, {
      padding: "8px 14px",
      background: "#222",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
    });
    btn.onclick = fillInputs;

    container.appendChild(btn);
    document.body.appendChild(container);
  }

  // Wait for form ready
  const observer = new MutationObserver(() => {
    const firstname = document.querySelector('input[name="firstname"]');
    if (firstname) {
      observer.disconnect();
      createControlButtons();
    }
  });

  observer.observe(document, { childList: true, subtree: true });
})();
