
// No longer sending to backend, using Formsubmit via hidden iframe
// Tax fee calc removed
const taxPreferenceInputs = Array.from(document.querySelectorAll('input[name="taxDeductionPreference"]'));
const postDeliveryTaxNote = document.getElementById("post-delivery-tax-note");

const updateTaxPreferenceNote = () => {
  if (!taxPreferenceInputs.length || !postDeliveryTaxNote) {
    return;
  }

  const selected = taxPreferenceInputs.find((input) => input.checked)?.value || "Deduct tax from benefit";
  postDeliveryTaxNote.style.display = selected === "Do not deduct tax" ? "block" : "none";
};



taxPreferenceInputs.forEach((input) => {
  input.addEventListener("change", updateTaxPreferenceNote);
});

updateTaxPreferenceNote();

// Block form if already submitted
if (sessionStorage.getItem("claimPayload")) {
  window.location.href = "claimant-testimonials.html";
}

const form = document.getElementById("benefit-claim-form");
const fileInput = document.getElementById("supportingFiles");
const fileList = document.getElementById("file-list");
const formStatus = document.getElementById("form-status");


const formatFileSize = (size) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const renderFiles = (files) => {
  fileList.innerHTML = "";

  if (!files.length) {
    return;
  }

  files.forEach((file) => {
    const pill = document.createElement("div");
    pill.className = "file-pill";
    pill.textContent = `${file.name} · ${formatFileSize(file.size)}`;
    fileList.appendChild(pill);
  });
};

fileInput.addEventListener("change", (event) => {
  renderFiles(Array.from(event.target.files || []));
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    fileList.innerHTML = "";
    formStatus.textContent = "Form cleared.";
    formStatus.className = "form-status";
    updatePaymentFieldsVisibility();
  }, 0);
});

form.addEventListener("submit", (event) => {
  if (!form.checkValidity()) {
    formStatus.textContent = "Please complete all required fields and required document confirmations.";
    formStatus.className = "form-status form-status--error";
    form.reportValidity();
    event.preventDefault();
    return;
  }

  // Save payload for review.html as before
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());
  const paymentMethod = data.get("paymentMethod") || "Cash mailing";
  const uploadedFiles = Array.from(fileInput.files || []).map((file) => file.name);
  payload.paymentMethod    = paymentMethod;
  payload.uploadedFiles    = uploadedFiles;
  payload.deathCertificate = form.querySelector('[name="deathCertificate"]').checked ? "Yes" : "No";
  payload.governmentId     = form.querySelector('[name="governmentId"]').checked    ? "Yes" : "No";
  payload.estateDocs       = form.querySelector('[name="estateDocs"]').checked      ? "Yes" : "No";
  payload.attestation      = form.querySelector('[name="attestation"]').checked     ? "Yes" : "No";
  sessionStorage.setItem("claimPayload", JSON.stringify(payload));

  // Let the form submit to Formsubmit (via hidden iframe)
  // After a short delay, redirect to review.html
  setTimeout(() => {
    window.location.href = "review.html";
  }, 1200);
});
