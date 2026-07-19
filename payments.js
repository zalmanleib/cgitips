// Shared across index.html (script.js) and camper.html (camper.js)

// Known payment methods get a branded logo. Any method not listed here
// (e.g. a brand-new column added to the sheet) falls back to a generic icon.
const PAYMENT_LOGOS = {
  cashapp: "https://cdn.simpleicons.org/cashapp/00D632",
  zelle: "https://cdn.simpleicons.org/zelle/6D1ED4",
  paypal: "https://cdn.simpleicons.org/paypal/003087",
  venmo: "https://cdn.simpleicons.org/venmo/3D95CE"
};
const FALLBACK_LOGO = "https://cdn.simpleicons.org/creditcard/64748b";

function logoFor(method) {
  const key = String(method || "").trim().toLowerCase().replace(/\s+/g, "");
  return PAYMENT_LOGOS[key] || FALLBACK_LOGO;
}

// A payment value that's a URL opens as a link (e.g. Cash App / PayPal / Venmo
// pay links). Anything else (e.g. a Zelle email/phone) copies to clipboard.
function isLinkValue(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function preferredValue(value) {
  return String(value || "").trim().toLowerCase();
}

function isPreferred(preferred, method) {
  const p = preferredValue(preferred);
  return p.includes(method.toLowerCase());
}

// Builds one <article class="staff-card"> for a person, fully wired up
// (link buttons + copy-to-clipboard buttons).
function buildStaffCard(person) {
  const card = document.createElement("article");
  card.className = "staff-card";

  const preferred = String(person.preferred || "").trim();
  const payments = person.payments || {};
  const methods = Object.keys(payments).filter(m => String(payments[m] || "").trim());

  let buttons = "";

  methods.forEach(method => {
    const value = String(payments[method]).trim();
    const preferredClass = isPreferred(preferred, method) ? "preferred" : "";
    const badge = isPreferred(preferred, method)
      ? '<span class="preferred-badge">⭐ Preferred</span>'
      : "";
    const logo = `<img class="payment-logo" src="${logoFor(method)}" alt="">`;

    if (isLinkValue(value)) {
      buttons += `
        <a
          class="payment-button ${preferredClass}"
          href="${escapeHtml(value)}"
          target="_blank"
          rel="noopener"
          data-method="${escapeHtml(method)}"
        >
          ${badge}
          ${logo}
          <span>Open ${escapeHtml(method)}</span>
        </a>
      `;
    } else {
      buttons += `
        <button
          class="payment-button ${preferredClass}"
          data-copy="${escapeHtml(value)}"
          data-method="${escapeHtml(method)}"
        >
          ${badge}
          ${logo}
          <span>Copy ${escapeHtml(method)} Info</span>
        </button>
      `;
    }
  });

  card.innerHTML = `
    <h3 class="staff-name">
      ${escapeHtml(person.name)}
    </h3>

    <div class="payment-buttons">
      ${
        buttons ||
        '<div class="no-payment">No payment information listed.</div>'
      }
    </div>
  `;

  card.querySelectorAll("[data-copy]").forEach(copyButton => {
    const value = copyButton.getAttribute("data-copy");
    const method = copyButton.getAttribute("data-method");
    const originalHTML = copyButton.innerHTML;

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);

        copyButton.innerHTML = `<span>✓ ${escapeHtml(method)} Info Copied</span>`;

        const instruction = document.createElement("div");
        instruction.className = "zelle-instruction";
        instruction.textContent = `Open your bank app to send with ${method}.`;
        copyButton.insertAdjacentElement("afterend", instruction);

      } catch {
        copyButton.innerHTML = "Copy failed";
        setTimeout(() => {
          copyButton.innerHTML = originalHTML;
        }, 1800);
      }
    });
  });

  return card;
}
