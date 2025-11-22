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
   git remote add origin https://github.com/<your-user>/christiansandcannibals.git
   git push -u origin main
   ```
4. **Enable Pages.** In the repo on GitHub: `Settings → Pages → Branch`, choose `main` + `/ (root)` and save. After the build finishes, GitHub shows your live URL (e.g., `https://<your-user>.github.io/christiansandcannibals/`).

## Connect a Custom Domain (e.g., `christiansandcannibals.com`)

1. **Buy the domain** from any registrar (Cloudflare, Namecheap, Porkbun, etc.).
2. **Point DNS at GitHub Pages.**
   - Create `A` records for `@` (root) pointing to GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Create a `CNAME` record for `www` pointing to `<your-user>.github.io`.
3. **Tell GitHub about the domain.** Repo `Settings → Pages → Custom domain` → enter `christiansandcannibals.com`. GitHub writes a `CNAME` file for you automatically once it verifies DNS.
4. **Force HTTPS.** After verification, enable “Enforce HTTPS” in the same Pages settings panel so GitHub provisions a Let’s Encrypt certificate.

## Local preview

Open `index.html` directly in a browser, or serve the folder (for proper relative paths) with:

```bash
npx serve .
```

The repo is now ready to be published by following the steps above.
