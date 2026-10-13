# Release checklist

Do not call this project production-ready until the applicable items are checked.

## Visual and functional
- [ ] Compare homepage to the user-approved reference image at desktop and mobile sizes.
- [ ] Confirm the approved navy/gold palette, brand placement, Arabic classic headings and Latin brand type.
- [ ] Check all page links and keyboard focus.
- [ ] Check country, city, property type, sale/rent and budget filtering.
- [ ] Verify clear empty states and accessible labels.

## Backend and data
- [ ] Select production database and authentication provider.
- [ ] Implement verified email flow, account recovery, secure sessions and role authorization.
- [ ] Implement owner/agent listing management and photo uploads.
- [ ] Implement real listing details, status, moderation and reporting.
- [ ] Configure backups, retention, monitoring, rate limiting and abuse handling.
- [ ] Configure email sending and test delivery.

## Legal and privacy
- [ ] Identify the legal operator and add correct business contact details.
- [ ] Review privacy notice and terms with qualified counsel for launch jurisdictions.
- [ ] Configure consent/cookie controls if required by the services used.
- [ ] Define user rights handling, retention and deletion procedures.
- [ ] Ensure sample content is clearly labeled and replaced before launch.

## Deployment and domain
- [ ] Verify automated checks pass on the final commit.
- [ ] Test the Vercel preview independently of the legacy site.
- [ ] Check production build output, 404 behavior, redirects, headers and SEO URLs.
- [ ] Verify custom domain ownership and DNS plan.
- [ ] Do not change the existing `sakan-app` domain or deployment during this project.
- [ ] Assign any new domain only after explicit final approval.
