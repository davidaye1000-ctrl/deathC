# Death Benefit Claim Portal

A professional, responsive one-page death benefit claim dashboard for beneficiary intake. The design uses an original enterprise financial-services aesthetic and does not copy proprietary Western & Southern branding or assets.

## Included

- Summary card for the deceased account holder and claim reference
- Beneficiary intake form with claimant details and payment preferences
- Required-document checklist and file picker
- Responsive layout for desktop and mobile
- Tiny Node.js static server and smoke test

## Files

- `index.html` — dashboard markup and form structure
- `styles.css` — responsive visual design
- `script.js` — file list preview and submit/reset behavior
- `server.js` — local static server on port `5500`
- `tests/smoke.test.js` — quick validation test

## Run locally

```powershell
npm test
npm start
```

Then open `http://127.0.0.1:5500` in your browser.

## Notes

- The current version is a polished front-end prototype.
- For production use, connect the form to your secure backend, document storage, e-signature workflow, and authentication stack.
- Replace the sample claim reference and contact details with your live data and service channels.
