const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const stylesCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const scriptJs = fs.readFileSync(path.join(root, "script.js"), "utf8");

assert.ok(indexHtml.includes("Death Benefit Claim Dashboard"), "Page heading missing.");
assert.ok(indexHtml.includes("Barbara Ford"), "Deceased details missing.");
assert.ok(indexHtml.includes("Sherri Ford"), "Beneficiary details missing.");
assert.ok(indexHtml.includes('id="benefit-claim-form"'), "Claim form missing.");
assert.ok(indexHtml.includes('id="documents"'), "Document section missing.");
assert.ok(indexHtml.includes("styles.css"), "Stylesheet reference missing.");
assert.ok(indexHtml.includes("script.js"), "Script reference missing.");
assert.ok(stylesCss.includes(".hero"), "Hero styles missing.");
assert.ok(stylesCss.includes(".form-status--success"), "Form status success style missing.");
assert.ok(scriptJs.includes("sessionStorage.setItem") && scriptJs.includes("review.html"), "Client-side submit handling missing.");

console.log("Smoke test passed.");
