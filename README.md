# Christians and Cannibals

Static marketing site built with vanilla HTML/CSS/JS. Everything required to host it publicly lives in this folder (`index.html`, `style.css`, `script.js`, `background.js`, and `Resources/` assets).

## Publish via GitHub Pages

1. **Create a repository.** Sign in to GitHub, create a new repo (e.g., `christiansandcannibals`), keep it public, and do *not* initialize with a README.
2. **Initialize git locally.**
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   ```
3. **Push to GitHub.**
   ```bash
   git remote add origin https://github.com/antintheagora/christiansandcannibals.git
   git push -u origin main
   ```
4. **Enable Pages.** In the repo on GitHub: `Settings → Pages → Branch`, choose `main` + `/ (root)` and save. After the build finishes, GitHub shows your live URL (e.g., `https://antintheagora.github.io/christiansandcannibals/`).

## Connect `christiansandcannibals.com`

The `CNAME` file in this repo is prefilled with `christiansandcannibals.com`, so once DNS is correct GitHub Pages automatically serves that hostname.

1. **Point DNS at GitHub Pages.**
   - Create `A` records for `@` (root) pointing to GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Create a `CNAME` record for `www` pointing to `antintheagora.github.io`.
2. **Tell GitHub about the domain.** Repo `Settings → Pages → Custom domain` → enter `christiansandcannibals.com`. (The existing `CNAME` file keeps this persistent.)
3. **Force HTTPS.** After verification, enable “Enforce HTTPS” in the same Pages settings panel so GitHub provisions a Let’s Encrypt certificate.
4. **Wait for DNS propagation.** It may take up to an hour before the domain resolves and GitHub issues the certificate. Use the commands below to confirm the A/CNAME records before retrying the Pages settings page.
   ```bash
   # Check root A records resolve to the GitHub IPs
   nslookup christiansandcannibals.com

   # Check www CNAME resolves to your GitHub Pages hostname
   nslookup -type=cname www.christiansandcannibals.com

   # `dig` equivalents if installed
   dig christiansandcannibals.com A +short
   dig www.christiansandcannibals.com CNAME +short
   ```

## Local preview

Open `index.html` directly in a browser, or serve the folder (for proper relative paths) with:

```bash
npx serve .
```

The repo is now ready to be published by following the steps above.
