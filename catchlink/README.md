# App Store landing / support / privacy pages

Static HTML hosted on `https://yamartinez.github.io/catchlink/`.

## Files

- `index.html` — marketing landing page (App Store *Marketing URL*).
- `support.html` — support + FAQ (App Store *Support URL*, required).
- `privacy.html` — privacy policy (App Store *Privacy Policy URL*, required).
- `_shared.css` — shared styles (light/dark, system fonts).

## Published URLs

| App Store Connect field | URL |
| --- | --- |
| Support URL (required) | https://yamartinez.github.io/catchlink/support.html |
| Privacy Policy URL (required) | https://yamartinez.github.io/catchlink/privacy.html |
| Marketing URL (optional) | https://yamartinez.github.io/catchlink/ |

## How publishing works

The `.github/workflows/publish-site.yml` workflow runs on every push to `main`
that touches `app-store/web/**`. It checks out `yamartinez/yamartinez.github.io`,
rsyncs this directory into `catchlink/` there, and commits + pushes.

### Required secret

`PERSONAL_SITE_TOKEN` — a fine-scoped GitHub personal access token with
**contents: read/write** on `yamartinez/yamartinez.github.io`. Configure at
`Settings → Secrets and variables → Actions` on this repo.

### Manual run

Actions tab → "Publish App Store site" → Run workflow.

## Editing

Edit the HTML/CSS directly. On merge to `main`, the workflow takes care of the
rest. Use `--delete` semantics — files removed here are removed on the site.
