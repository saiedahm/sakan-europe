# SAKAN EUROPE — Architecture

## Current delivery
This repository is a static HTML/CSS/JavaScript prototype. There is no backend service, user database, session management, upload service, payment processor, or real estate listing API in the current version.

## Current public pages
- `index.html`: approved homepage visual direction, demo search, example cards.
- `properties.html`: demo listing filter page.
- `contact.html`: client-side form validation only; does not send email.
- `login.html` and `signup.html`: visual shells only; do not authenticate or create accounts.
- `privacy.html` and `terms.html`: legal drafts requiring review and operator-specific information.
- `404.html`: custom not-found page.
- `favicon.svg`: browser icon.

## Recommended production phases
1. Confirm legal operator, target countries, languages, hosting and data-retention requirements.
2. Choose and configure a managed database and authentication provider; use server-side authorization and password hashing only through a trusted auth system.
3. Define schema for users, organizations/agents, listings, listing photos, saved listings, contact requests, moderation and audit events.
4. Add protected listing creation/editing and server-side input validation.
5. Add photo storage with file-type/size validation and access controls.
6. Add moderation, report/block workflows, fraud prevention, email verification and abuse limits.
7. Add transactional email and a consent-aware privacy/cookie implementation if applicable.
8. Add payment only after pricing, refunds, invoices and legal requirements are decided.
9. Test mobile/desktop, keyboard accessibility, RTL, cross-browser behavior, authorization boundaries, backups and restore.
10. Launch on a separate preview/deployment and validate before assigning a custom domain.

## Non-negotiable safety boundaries
- Never store plaintext passwords.
- Never put secrets in browser JavaScript or committed files.
- Do not present demo properties or sample prices as real listings.
- Do not claim identity, ownership or listing verification until a real process exists.
- Do not alter the legacy `sakan-app` repository or its domain from this project.
